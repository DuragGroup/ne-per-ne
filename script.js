/* ============================================================
   GAZETA SHKOLLORE — script.js
   Vanilla JS: dark mode, nav, slider, ticker, animations, forms
============================================================ */

'use strict';

/* ——————————————————————————————————————
   HELPERS
—————————————————————————————————————— */
const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

/* ——————————————————————————————————————
   1. CURRENT DATE (header top bar)
—————————————————————————————————————— */
(function setDate() {
  const el = $('#currentDate');
  if (!el) return;
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  // Use Albanian locale with a fallback
  try {
    el.textContent = now.toLocaleDateString('sq-AL', opts);
  } catch {
    el.textContent = now.toLocaleDateString('en-GB', opts);
  }
})();

/* ——————————————————————————————————————
   2. DARK MODE TOGGLE
—————————————————————————————————————— */
(function darkMode() {
  const root     = document.documentElement;
  const btn      = $('#darkToggle');
  const icon     = $('#darkIcon');
  const DARK_KEY = 'gazeta-theme';

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem(DARK_KEY, theme);
  }

  // Load saved preference or use OS preference
  const saved = localStorage.getItem(DARK_KEY);
  apply(saved || 'light');

  if (btn) {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      apply(current === 'dark' ? 'light' : 'dark');
    });
  }
})();

/* ——————————————————————————————————————
   3. MOBILE DRAWER NAVIGATION
—————————————————————————————————————— */
(function mobileNav() {
  const hamburger = $('#hamburger');
  const drawer    = $('#mobileDrawer');
  const overlay   = $('#overlay');
  const closeBtn  = $('#drawerClose');
  const drawerLinks = $$('a', drawer);

  function open() {
    hamburger?.setAttribute('aria-expanded', 'true');
    hamburger?.classList.add('open');
    drawer?.classList.add('open');
    drawer?.setAttribute('aria-hidden', 'false');
    overlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    hamburger?.setAttribute('aria-expanded', 'false');
    hamburger?.classList.remove('open');
    drawer?.classList.remove('open');
    drawer?.setAttribute('aria-hidden', 'true');
    overlay?.classList.remove('show');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = drawer?.classList.contains('open');
    isOpen ? close() : open();
  });

  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  // Close on link click
  drawerLinks.forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer?.classList.contains('open')) close();
  });
})();

/* ——————————————————————————————————————
   4. SEARCH BAR TOGGLE
—————————————————————————————————————— */
(function searchBar() {
  const toggle   = $('#searchToggle');
  const bar      = $('#searchBar');
  const closeBtn = $('#searchClose');
  const input    = $('#searchInput');

  function open() {
    bar?.classList.add('open');
    bar?.setAttribute('aria-hidden', 'false');
    toggle?.setAttribute('aria-expanded', 'true');
    setTimeout(() => input?.focus(), 50);
  }
  function close() {
    bar?.classList.remove('open');
    bar?.setAttribute('aria-hidden', 'true');
    toggle?.setAttribute('aria-expanded', 'false');
  }

  toggle?.addEventListener('click', () => {
    bar?.classList.contains('open') ? close() : open();
  });
  closeBtn?.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && bar?.classList.contains('open')) close();
  });
})();

/* ——————————————————————————————————————
   5. SMART STICKY HEADER (hide on scroll down)
—————————————————————————————————————— */
(function smartHeader() {
  const header = $('#siteHeader');
  if (!header) return;

  let lastY   = 0;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    if (y > 100) {
      if (y > lastY) {
        header.classList.add('hide');
      } else {
        header.classList.remove('hide');
      }
    } else {
      header.classList.remove('hide');
    }
    lastY   = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();

/* ——————————————————————————————————————
   6. READING PROGRESS BAR
—————————————————————————————————————— */
(function readingProgress() {
  const bar = $('#readingProgress');
  if (!bar) return;

  function update() {
    const docH    = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    bar.style.width = `${Math.min(100, scrolled)}%`;
    bar.setAttribute('aria-valuenow', Math.round(scrolled));
  }

  window.addEventListener('scroll', update, { passive: true });
})();

/* ——————————————————————————————————————
   7. SCROLL-TO-TOP BUTTON
—————————————————————————————————————— */
(function scrollTop() {
  const btn = $('#scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ——————————————————————————————————————
   8. ACTIVE NAV LINK ON SCROLL
—————————————————————————————————————— */
(function activeNav() {
  const links    = $$('.nav-link[data-section]');
  const sections = links.map(l => document.getElementById(l.dataset.section)).filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = links.find(l => l.dataset.section === entry.target.id);
        active?.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();

/* ——————————————————————————————————————
   9. SCROLL-REVEAL ANIMATIONS
—————————————————————————————————————— */
(function scrollReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger cards in a grid
        const parent = entry.target.parentElement;
        const siblings = $$('.reveal', parent);
        const index = siblings.indexOf(entry.target);
        const delay = Math.min(index * 80, 400);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

  elements.forEach(el => observer.observe(el));
})();

/* ——————————————————————————————————————
   10. LAZY IMAGE LOADING + SKELETON CLEAR
—————————————————————————————————————— */
(function lazyImages() {
  // Wrappers that carry the skeleton shimmer animation
  const WRAPPER_SELECTORS = [
    '.hero-img-wrap', '.side-img-wrap', '.t-img-wrap',
    '.card-img-wrap', '.list-img-wrap'
  ];

  function markWrapperLoaded(img) {
    const wrapper = img.closest(WRAPPER_SELECTORS.join(','));
    if (wrapper) wrapper.classList.add('img-loaded');
  }

  // All imgs: fade-in + skeleton clear
  $$('img').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.45s ease';

    function onLoad() {
      img.style.opacity = '1';
      markWrapperLoaded(img);
    }
    function onError() {
      img.style.opacity = '0.35';
      markWrapperLoaded(img); // still clear skeleton on error
    }

    if (img.complete && img.naturalWidth > 0) {
      img.style.opacity = '1';
      markWrapperLoaded(img);
    } else {
      img.addEventListener('load',  onLoad,  { once: true });
      img.addEventListener('error', onError, { once: true });
    }
  });
})();

/* ——————————————————————————————————————
   10b. CATEGORY-AWARE OBJECT-POSITION
       Marks sport/action wrappers so CSS
       can apply tighter crop focus.
—————————————————————————————————————— */
(function imgFocusHints() {
  // Sport cards → keep action centre-frame
  $$('.badge-sport').forEach(badge => {
    const card = badge.closest('.news-card, .t-card, .hero-side-card');
    if (card) {
      const wrap = card.querySelector(
        '.card-img-wrap, .t-img-wrap, .side-img-wrap'
      );
      if (wrap) wrap.dataset.imgFocus = 'action';
    }
  });

  // Tech cards → slight top bias (screen/face visible)
  $$('.badge-tech').forEach(badge => {
    const card = badge.closest('.news-card, .t-card, .hero-main');
    if (card) {
      const wrap = card.querySelector(
        '.card-img-wrap, .t-img-wrap, .hero-img-wrap'
      );
      if (wrap) wrap.dataset.imgFocus = 'top';
    }
  });
})();

/* ——————————————————————————————————————
   11. TRENDING SLIDER (touch + buttons)
—————————————————————————————————————— */
(function trendingSlider() {
  const slider  = $('#trendingSlider');
  const prevBtn = $('#sliderPrev');
  const nextBtn = $('#sliderNext');
  if (!slider) return;

  const CARD_W = () => {
    const card = slider.querySelector('.t-card');
    if (!card) return 300;
    const gap = parseInt(getComputedStyle(slider).gap) || 16;
    return card.offsetWidth + gap;
  };

  function scrollBy(dir) {
    slider.scrollBy({ left: dir * CARD_W(), behavior: 'smooth' });
  }

  prevBtn?.addEventListener('click', () => scrollBy(-1));
  nextBtn?.addEventListener('click', () => scrollBy(1));

  // Update button states
  function updateBtns() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = slider.scrollLeft <= 4;
    nextBtn.disabled = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 4;
  }

  slider.addEventListener('scroll', updateBtns, { passive: true });
  updateBtns();

  // Touch swipe support
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) scrollBy(diff > 0 ? 1 : -1);
  }, { passive: true });

  // Auto-advance every 5 seconds
  let autoTimer = setInterval(() => {
    const atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 4;
    if (atEnd) {
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      scrollBy(1);
    }
  }, 5000);

  // Pause auto-advance on hover / touch
  slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
  slider.addEventListener('touchstart', () => clearInterval(autoTimer), { passive: true });
  slider.addEventListener('mouseleave', () => {
    autoTimer = setInterval(() => scrollBy(1), 5000);
  });
})();

/* ——————————————————————————————————————
   12. NEWSLETTER FORM (main section)
—————————————————————————————————————— */
(function newsletterForm() {
  const form    = $('#newsletterForm');
  const success = $('#nlSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name  = $('#nlName');
    const email = $('#nlEmail');
    let valid = true;

    // Simple validation
    [name, email].forEach(field => {
      if (!field) return;
      if (!field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) {
      // Shake the form
      form.style.animation = 'shake 0.4s ease';
      setTimeout(() => form.style.animation = '', 400);
      return;
    }

    // Simulate submission
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = 'Duke dërguar…';
      btn.disabled = true;
    }

    setTimeout(() => {
      if (success) {
        form.hidden    = true;
        success.hidden = false;
      }
    }, 1000);
  });
})();

/* ——————————————————————————————————————
   13. MINI NEWSLETTER (sidebar)
—————————————————————————————————————— */
(function miniNewsletter() {
  const form = $('#miniNlForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input?.value.trim()) return;

    const btn = form.querySelector('button');
    if (btn) {
      btn.textContent = '✅ Faleminderit!';
      btn.style.background = '#27ae60';
      btn.style.color = '#fff';
      btn.disabled = true;
    }
    if (input) {
      input.disabled = true;
      input.value = '';
    }
  });
})();

/* ——————————————————————————————————————
   14. SMOOTH SCROLL for anchor links
—————————————————————————————————————— */
(function smoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    e.preventDefault();

    const headerH = document.getElementById('siteHeader')?.offsetHeight || 90;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ——————————————————————————————————————
   15. SHAKE ANIMATION (for form validation)
—————————————————————————————————————— */
(function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-8px); }
      40%      { transform: translateX(8px); }
      60%      { transform: translateX(-5px); }
      80%      { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
})();

/* ——————————————————————————————————————
   16. CARD HOVER — add subtle lift on mouse
       (CSS already handles it, this is extra)
—————————————————————————————————————— */

/* ——————————————————————————————————————
   17. DYNAMIC YEAR IN FOOTER
—————————————————————————————————————— */
(function footerYear() {
  const els = $$('.footer-bottom p');
  const year = new Date().getFullYear();
  els.forEach(el => {
    el.textContent = el.textContent.replace('2024', year);
  });
})();

/* ——————————————————————————————————————
   18. SCROLL-TO-TOP — keyboard accessible
—————————————————————————————————————— */
(function scrollTopKeyboard() {
  const btn = $('#scrollTopBtn');
  if (!btn) return;
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
})();

/* ——————————————————————————————————————
   19. SEARCH — basic filter on page (demo)
—————————————————————————————————————— */
(function searchFilter() {
  const input = $('#searchInput');
  if (!input) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        // Reset visibility
        $$('.news-card, .t-card, .list-card').forEach(c => {
          c.style.display = '';
        });
        return;
      }
      $$('.news-card, .t-card, .list-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });
    }, 300);
  });
})();

/* ——————————————————————————————————————
   20. SYNC CARD IMAGES FROM ARTICLES DATA
       Reads window.ARTICLES (set by articles-data.js)
       and replaces every card's <img> src with the
       exact same image used on the article page hero —
       so index.html cards always match article.html.
—————————————————————————————————————— */
(function syncCardImages() {
  const articles = window.ARTICLES;
  if (!Array.isArray(articles)) return;

  /* Build a slug → article lookup map */
  const bySlug = Object.fromEntries(articles.map(a => [a.slug, a]));

  /* Every image-wrap link that points to an article page */
  $$('a[href*="article.html?slug="]').forEach(link => {
    const img = link.querySelector('img');
    if (!img) return; /* title links have no <img>, skip them */

    const href   = link.getAttribute('href');
    const slug   = new URLSearchParams(href.split('?')[1]).get('slug');
    const article = bySlug[slug];
    if (!article) return;

    img.src = article.image;
    img.alt = article.imageAlt || img.alt;
  });
})();

/* ——————————————————————————————————————
   21. INIT — log version
—————————————————————————————————————— */
console.log('%cGazeta Shkollore 🗞️  v1.0', 'color:#c0392b;font-weight:bold;font-size:14px;');
