/* ============================================================
   GAZETA SHKOLLORE — article.js
   Slug-based article routing: reads ?slug= from URL,
   fetches articles.json, renders full article page.
============================================================ */

'use strict';

(function articlePage() {

  /* ── DOM refs ── */
  const loading      = document.getElementById('articleLoading');
  const errorEl      = document.getElementById('articleError');
  const wrap         = document.getElementById('articleWrap');
  const heroEl       = document.getElementById('articleHero');
  const headerEl     = document.getElementById('articleHeader');
  const contentEl    = document.getElementById('articleContent');
  const tagsEl       = document.getElementById('articleTags');
  const relatedGrid  = document.getElementById('relatedGrid');
  const bcCat        = document.getElementById('breadcrumbCat');
  const bcTitle      = document.getElementById('breadcrumbTitle');
  const asbInfo      = document.getElementById('asbInfo');

  /* ── Read slug from URL ── */
  const slug = new URLSearchParams(location.search).get('slug');

  if (!slug) { showError(); return; }

  /* ── Load data (window.ARTICLES set by articles-data.js <script>) ── */
  const articles = window.ARTICLES;
  if (!Array.isArray(articles)) { showError(); return; }

  const article = articles.find(a => a.slug === slug);
  if (!article) { showError(); return; }

  /* ── Render ── */
  renderMeta(article);
  renderBreadcrumb(article);
  renderHero(article);
  renderHeader(article);
  renderContent(article);
  renderTags(article);
  renderSidebar(article);
  renderRelated(article, articles);
  wireShareButtons(article);

  loading.hidden = true;
  wrap.hidden    = false;

  /* re-trigger lazy image observer from script.js for dynamic imgs */
  initDynamicImages();

  /* ── Helpers ── */

  function showError() {
    loading.hidden = true;
    errorEl.hidden = false;
  }

  function renderMeta(a) {
    document.title = `${a.title} | Gazeta Shkollore`;
    setMeta('description', a.excerpt);
    setMeta('og:title',       a.title);
    setMeta('og:description', a.excerpt);
    setMeta('og:image',       a.image);
  }

  function setMeta(name, content) {
    let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function renderBreadcrumb(a) {
    if (bcCat)   bcCat.textContent   = a.categoryLabel;
    if (bcTitle) bcTitle.textContent = truncate(a.title, 55);
  }

  function renderHero(a) {
    heroEl.innerHTML = `
      <div class="article-hero-img-wrap">
        <img
          src="${esc(a.image)}"
          alt="${esc(a.imageAlt)}"
          class="article-hero-img"
          loading="eager"
          fetchpriority="high"
        />
        <div class="article-hero-overlay"></div>
      </div>
    `;
  }

  function renderHeader(a) {
    headerEl.innerHTML = `
      <div class="article-meta-top">
        <span class="badge ${esc(a.badgeClass)}">${esc(a.categoryLabel)}</span>
        <span class="read-time">${esc(a.readTime)}</span>
      </div>
      <h1 class="article-title">${esc(a.title)}</h1>
      <p class="article-excerpt-lead">${esc(a.excerpt)}</p>
      <div class="article-byline">
        <img src="${esc(a.authorAvatar)}" alt="" class="avatar avatar-md" aria-hidden="true" />
        <div class="byline-info">
          <span class="author-name">${esc(a.author)}</span>
          <time datetime="${esc(a.date)}" class="byline-date">${esc(a.dateFormatted)}</time>
        </div>
      </div>
      <hr class="article-rule" />
    `;
  }

  function renderContent(a) {
    contentEl.innerHTML = a.content.map(renderBlock).join('');
  }

  function renderBlock(block) {
    switch (block.type) {
      case 'paragraph':
        return `<p>${esc(block.text)}</p>`;

      case 'heading':
        return `<h${block.level} class="prose-h">${esc(block.text)}</h${block.level}>`;

      case 'image':
        return `
          <figure class="prose-figure">
            <div class="prose-img-wrap">
              <img src="${esc(block.src)}" alt="${esc(block.alt)}" loading="lazy" />
            </div>
            ${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ''}
          </figure>`;

      case 'quote':
        return `
          <blockquote class="prose-quote">
            <p>${esc(block.text)}</p>
            ${block.cite ? `<cite>— ${esc(block.cite)}</cite>` : ''}
          </blockquote>`;

      case 'list':
        return `
          <ul class="prose-list">
            ${block.items.map(i => `<li>${esc(i)}</li>`).join('')}
          </ul>`;

      default:
        return '';
    }
  }

  function renderTags(a) {
    tagsEl.innerHTML = `
      <span class="tags-label">Etiketa:</span>
      <div class="tags-cloud">
        ${a.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
      </div>
    `;
  }

  function renderSidebar(a) {
    if (!asbInfo) return;
    asbInfo.innerHTML = `
      <h4 class="asb-title">Detajet</h4>
      <ul class="asb-detail-list">
        <li><span class="asb-lbl">Autor</span><span class="asb-val">${esc(a.author)}</span></li>
        <li><span class="asb-lbl">Data</span><span class="asb-val">${esc(a.dateFormatted)}</span></li>
        <li><span class="asb-lbl">Kohë leximi</span><span class="asb-val">${esc(a.readTime)}</span></li>
        <li><span class="asb-lbl">Kategori</span><span class="asb-val">
          <span class="badge ${esc(a.badgeClass)}">${esc(a.categoryLabel)}</span>
        </span></li>
      </ul>
    `;
  }

  function renderRelated(a, all) {
    const related = (a.related || [])
      .map(s => all.find(x => x.slug === s))
      .filter(Boolean)
      .slice(0, 3);

    if (!related.length) {
      document.getElementById('relatedSection').hidden = true;
      return;
    }

    relatedGrid.innerHTML = related.map(r => `
      <article class="related-card reveal">
        <a href="article.html?slug=${esc(r.slug)}" class="related-img-wrap">
          <img src="${esc(r.image)}" alt="${esc(r.imageAlt)}" loading="lazy" class="related-img" />
        </a>
        <div class="related-body">
          <span class="badge ${esc(r.badgeClass)}">${esc(r.categoryLabel)}</span>
          <h3 class="related-title">
            <a href="article.html?slug=${esc(r.slug)}">${esc(r.title)}</a>
          </h3>
          <div class="article-meta">
            <time datetime="${esc(r.date)}">${esc(r.dateFormatted)}</time>
            <span class="read-time">${esc(r.readTime)}</span>
          </div>
        </div>
      </article>
    `).join('');

    /* stagger reveal */
    setTimeout(() => {
      document.querySelectorAll('#relatedGrid .reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 120);
      });
    }, 200);
  }

  function wireShareButtons(a) {
    const url   = encodeURIComponent(location.href);
    const title = encodeURIComponent(a.title);

    function openShare(link) {
      window.open(link, '_blank', 'width=600,height=400,noopener');
    }

    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    const twUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;

    /* footer share row */
    document.getElementById('shareFacebook')?.addEventListener('click', () => openShare(fbUrl));
    document.getElementById('shareTwitter')?.addEventListener('click',  () => openShare(twUrl));
    document.getElementById('shareCopy')?.addEventListener('click',     () => copyLink());

    /* sidebar share */
    document.getElementById('asbFacebook')?.addEventListener('click', () => openShare(fbUrl));
    document.getElementById('asbTwitter')?.addEventListener('click',  () => openShare(twUrl));
    document.getElementById('asbCopy')?.addEventListener('click',     () => copyLink());

    function copyLink() {
      navigator.clipboard.writeText(location.href).then(() => {
        const btn = document.getElementById('shareCopy');
        const asb = document.getElementById('asbCopy');
        if (btn) { btn.textContent = '✅ Kopjuar!'; setTimeout(() => btn.textContent = '🔗 Kopjo', 2000); }
        if (asb) { asb.textContent = '✅'; setTimeout(() => asb.textContent = '🔗', 2000); }
      });
    }
  }

  function initDynamicImages() {
    document.querySelectorAll('#articleWrap img').forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.45s ease';

      function onLoad()  { img.style.opacity = '1'; }
      function onError() { img.style.opacity = '0.35'; }

      if (img.complete && img.naturalWidth > 0) {
        img.style.opacity = '1';
      } else {
        img.addEventListener('load',  onLoad,  { once: true });
        img.addEventListener('error', onError, { once: true });
      }
    });
  }

  /* ── Utility: HTML-escape to prevent XSS from JSON data ── */
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
  }

})();
