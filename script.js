/* ===================================================
   AATT – Artistes Association of Telugu Television
   Premium JavaScript · Interactions & Animations
   =================================================== */

'use strict';

/* ──────────────────────────────
   UTILITIES
   ────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on  = (el, ev, cb, opts) => el && el.addEventListener(ev, cb, opts);

/* ──────────────────────────────
   1. PRELOADER
   ────────────────────────────── */
(function initPreloader() {
  const loader = qs('#preloader');
  if (!loader) return;
  const hide = () => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  };
  document.body.style.overflow = 'hidden';
  if (document.readyState === 'complete') {
    setTimeout(hide, 2000);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 800));
  }
})();

/* ──────────────────────────────
   2. HEADER – scroll & active nav
   ────────────────────────────── */
(function initHeader() {
  const header   = qs('#main-header');
  const navLinks = qsa('.nav-link');
  const sections = qsa('section[id]');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);

    const scrollMid = window.scrollY + window.innerHeight / 2.5;
    let current = '';
    sections.forEach(s => { if (s.offsetTop <= scrollMid) current = s.id; });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ──────────────────────────────
   3. MOBILE NAV
   ────────────────────────────── */
(function initMobileNav() {
  const btn    = qs('#hamburger-btn');
  const nav    = qs('#mobile-nav');
  const links  = qsa('.mobile-nav-link, .mobile-join');
  let backdrop = null;
  let isOpen   = false;

  const open = () => {
    isOpen = true;
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    nav.classList.add('open');
    nav.setAttribute('aria-hidden', 'false');
    createBackdrop();
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    isOpen = false;
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    nav.setAttribute('aria-hidden', 'true');
    removeBackdrop();
    document.body.style.overflow = '';
  };

  const createBackdrop = () => {
    if (backdrop) return;
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop visible';
    document.body.appendChild(backdrop);
    on(backdrop, 'click', close);
  };

  const removeBackdrop = () => {
    if (!backdrop) return;
    backdrop.classList.remove('visible');
    setTimeout(() => { backdrop && backdrop.remove(); backdrop = null; }, 300);
  };

  on(btn, 'click', () => (isOpen ? close() : open()));
  links.forEach(link => on(link, 'click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });
})();

/* ──────────────────────────────
   4. HERO SLIDER (MAA-inspired)
   ────────────────────────────── */
(function initHeroSlider() {
  const wrapper = qs('.hero-slider');
  const slides = qsa('.hero-slide');
  const dots   = qsa('.hero-dot');
  const prevBtn = qs('.hero-nav.prev');
  const nextBtn = qs('.hero-nav.next');
  if (!wrapper || slides.length < 2) return;

  let current    = 0;
  let slideWidth = wrapper.clientWidth;
  let autoTimer  = null;
  const INTERVAL = 4000;

  const setSlideWidth = () => { slideWidth = wrapper.clientWidth; };
  window.addEventListener('resize', setSlideWidth);

  const goTo = (idx) => {
    slides[current].classList.remove('active');
    if (dots.length > 0) dots[current].classList.remove('active');
    current = idx;
    slides[current].classList.add('active');
    if (dots.length > 0) dots[current].classList.add('active');
    wrapper.scrollTo({ left: slideWidth * current, behavior: 'smooth' });
  };

  const next = () => goTo((current + 1) % slides.length);
  const prev = () => goTo((current - 1 + slides.length) % slides.length);

  if (prevBtn) on(prevBtn, 'click', () => { clearInterval(autoTimer); prev(); autoTimer = setInterval(next, INTERVAL); });
  if (nextBtn) on(nextBtn, 'click', () => { clearInterval(autoTimer); next(); autoTimer = setInterval(next, INTERVAL); });

  if (dots.length > 0) {
    dots.forEach((dot, i) => {
      on(dot, 'click', () => {
        clearInterval(autoTimer);
        goTo(i);
        autoTimer = setInterval(next, INTERVAL);
      });
    });
  }

  setSlideWidth();
  goTo(0);
  autoTimer = setInterval(next, INTERVAL);

  // Pause on hover
  const hero = qs('#hero');
  if (hero) {
    on(hero, 'mouseenter', () => clearInterval(autoTimer));
    on(hero, 'mouseleave', () => { autoTimer = setInterval(next, INTERVAL); });
  }

  // Touch swipe
  let startX = 0;
  on(hero, 'touchstart', e => { startX = e.touches[0].clientX; clearInterval(autoTimer); }, { passive: true });
  on(hero, 'touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    autoTimer = setInterval(next, INTERVAL);
  }, { passive: true });
})();

/* ──────────────────────────────
   4.1 LEADERSHIP AUTO SCROLL
   ────────────────────────────── */
(function initLeadershipAutoScroll() {
  const container = qs('.leaders-grid');
  if (!container) return;

  const cards = qsa('.leader-card', container);
  if (cards.length <= 3) return;

  let currentIndex = 0;
  let autoTimer = null;

  const scrollToCard = (index) => {
    const card = cards[index];
    if (!card) return;
    const paddingLeft = parseInt(getComputedStyle(container).paddingLeft, 10) || 0;
    container.scrollTo({
      left: card.offsetLeft - paddingLeft,
      behavior: 'smooth'
    });
  };

  const nextCard = () => {
    currentIndex = (currentIndex + 1) % cards.length;
    scrollToCard(currentIndex);
  };

  const start = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(nextCard, 3000);
  };

  const init = () => {
    currentIndex = 0;
    container.scrollLeft = 0;
    if (container.scrollWidth > container.clientWidth) {
      start();
    } else if (autoTimer) {
      clearInterval(autoTimer);
    }
  };

  on(container, 'mouseenter', () => clearInterval(autoTimer));
  on(container, 'mouseleave', () => start());

  window.addEventListener('load', init);
  window.addEventListener('resize', init);
  init();
})();

/* ──────────────────────────────
   5. HERO PARTICLES
   ────────────────────────────── */
(function initParticles() {
  const container = qs('#hero-particles');
  if (!container) return;
  const count = window.innerWidth < 600 ? 12 : 24;
  for (let i = 0; i < count; i++) {
    const p    = document.createElement('div');
    p.className = 'hero-particle';
    const size  = Math.random() * 4 + 2;
    const left  = Math.random() * 100;
    const dur   = Math.random() * 12 + 8;
    const delay = Math.random() * 10;
    const dx    = (Math.random() - 0.5) * 80;
    p.style.cssText = `
      width:${size}px;height:${size}px;left:${left}%;bottom:-10%;
      --dx:${dx}px;animation-duration:${dur}s;animation-delay:${delay}s;
    `;
    container.appendChild(p);
  }
})();

/* ──────────────────────────────
   6. SCROLL REVEAL
   ────────────────────────────── */
(function initScrollReveal() {
  const els = qsa('.reveal-up, .reveal-fade, .reveal-left, .reveal-right');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay) || 0;
        setTimeout(() => el.classList.add('visible'), delay);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ──────────────────────────────
   7. COUNTER ANIMATION
   ────────────────────────────── */
(function initCounters() {
  const counters = qsa('.stat-number[data-target]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animate = (el, target, duration = 2000) => {
    const start = performance.now();
    const step  = now => {
      const t   = Math.min((now - start) / duration, 1);
      const val = Math.round(easeOut(t) * target);
      el.textContent = val.toLocaleString('en-IN');
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animate(el, parseInt(el.dataset.target));
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
})();

/* ──────────────────────────────
   8. SMOOTH SCROLL
   ────────────────────────────── */
(function initSmoothScroll() {
  const OFFSET = 80;
  document.addEventListener('click', e => {
    if (e.defaultPrevented) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id     = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ──────────────────────────────
   8.1 LOCAL URL CLEANUP
   ────────────────────────────── */
(function cleanLocalUrl() {
  if (!window.location.hostname || !window.history.replaceState) return;
  const origin = window.location.origin;
  if (window.location.href !== origin) {
    window.history.replaceState(null, '', origin);
  }
})();

/* ──────────────────────────────
   9. JOIN MAP NAVIGATION
   ────────────────────────────── */
(function initJoinMapNavigation() {
  const triggerBtns = qsa('#header-join-btn, #mnav-join, #footer-join');
  const contactSection = qs('#contact');

  if (!triggerBtns.length || !contactSection) return;

  triggerBtns.forEach(btn => {
    on(btn, 'click', (event) => {
      event.preventDefault();
      const offset = 80;
      const top = contactSection.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ──────────────────────────────
   9. BACK TO TOP
   ────────────────────────────── */
(function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ──────────────────────────────
   10. GALLERY LIGHTBOX
   ────────────────────────────── */
(function initLightbox() {
  const lightbox  = qs('#lightbox');
  const lbImg     = qs('#lightbox-img');
  const lbCaption = qs('#lightbox-caption');
  const closeBtn  = qs('#lightbox-close');
  const prevBtn   = qs('#lightbox-prev');
  const nextBtn   = qs('#lightbox-next');
  const items     = qsa('.gallery-item');
  if (!lightbox || !lbImg) return;

  let curr = 0;
  const data = items.map(item => {
    const img  = item.querySelector('img');
    const cap  = item.querySelector('.gallery-caption');
    return {
      src: img ? img.src : null,
      alt: img ? img.alt : '',
      caption: cap ? cap.textContent.trim().replace(/[\uf065\s]*/g,'').trim() : ''
    };
  });

  const openAt = idx => {
    curr = idx;
    const d = data[idx];
    if (!d) return;
    lbImg.src = d.src || '';
    lbImg.alt = d.alt;
    lbImg.style.display = d.src ? 'block' : 'none';
    lbCaption.textContent = d.caption;
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeLb = () => {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    lbImg.src = '';
  };

  const nav = dir => { curr = (curr + dir + data.length) % data.length; openAt(curr); };

  items.forEach((item, i) => {
    on(item, 'click', () => openAt(i));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    on(item, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(i); } });
  });

  on(closeBtn, 'click', closeLb);
  on(prevBtn,  'click', () => nav(-1));
  on(nextBtn,  'click', () => nav(1));
  on(lightbox, 'click', e => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', e => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  nav(-1);
    if (e.key === 'ArrowRight') nav(1);
  });
})();

/* ──────────────────────────────
   11. CONTACT FORM
   ────────────────────────────── */
(function initContactForm() {
  const form = qs('#contact-form');
  if (!form) return;

  const fields = {
    name:    { el: qs('#form-name'),    err: qs('#err-name'),    rule: v => v.trim().length >= 3 ? '' : 'Please enter your full name (min 3 chars).' },
    phone:   { el: qs('#form-phone'),   err: qs('#err-phone'),   rule: v => /^[+\d\s\-]{7,15}$/.test(v.trim()) ? '' : 'Enter a valid phone number.' },
    email:   { el: qs('#form-email'),   err: qs('#err-email'),   rule: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.' },
    message: { el: qs('#form-message'), err: qs('#err-message'), rule: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.' }
  };

  const validate = key => {
    const { el, err, rule } = fields[key];
    if (!el) return true;
    const msg = rule(el.value);
    err.textContent = msg;
    el.classList.toggle('error', !!msg);
    return !msg;
  };

  Object.keys(fields).forEach(key => {
    const { el } = fields[key];
    if (!el) return;
    on(el, 'blur',  () => validate(key));
    on(el, 'input', () => { if (fields[key].err.textContent) validate(key); });
  });

  on(form, 'submit', async e => {
    e.preventDefault();
    const valid = Object.keys(fields).map(validate).every(Boolean);
    if (!valid) {
      const first = form.querySelector('.error');
      if (first) first.focus();
      return;
    }
    const submitBtn  = qs('#form-submit-btn');
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const successMsg = qs('#form-success');

    submitBtn.disabled = true;
    btnText.setAttribute('hidden', '');
    btnLoading.removeAttribute('hidden');

    await new Promise(r => setTimeout(r, 1800));

    submitBtn.disabled = false;
    btnText.removeAttribute('hidden');
    btnLoading.setAttribute('hidden', '');
    form.reset();
    successMsg.removeAttribute('hidden');
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => successMsg.setAttribute('hidden', ''), 7000);
  });
})();

/* ──────────────────────────────
   12. PARALLAX HERO
   ────────────────────────────── */
(function initParallax() {
  const heroBg = qs('.hero-bg-img');
  if (!heroBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    if (s < window.innerHeight) {
      heroBg.style.transform = `scale(1.05) translateY(${s * 0.15}px)`;
    }
  }, { passive: true });
})();

/* ──────────────────────────────
   13. CARD 3D TILT
   ────────────────────────────── */
(function init3DTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;

  const cards = qsa('.stat-card, .service-card, .category-card, .leader-card');
  cards.forEach(card => {
    on(card, 'mousemove', e => {
      const r    = card.getBoundingClientRect();
      const cx   = r.left + r.width / 2;
      const cy   = r.top  + r.height / 2;
      const dx   = (e.clientX - cx) / (r.width / 2);
      const dy   = (e.clientY - cy) / (r.height / 2);
      card.style.transform = `perspective(800px) rotateX(${dy*-5}deg) rotateY(${dx*5}deg) translateY(-4px)`;
    });
    on(card, 'mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ──────────────────────────────
   14. TICKER PAUSE ON HOVER
   ────────────────────────────── */
(function initTicker() {
  const track = qs('#ticker-track');
  const wrap  = qs('.ticker-wrap');
  if (!track || !wrap) return;
  on(wrap, 'mouseenter', () => track.style.animationPlayState = 'paused');
  on(wrap, 'mouseleave', () => track.style.animationPlayState = 'running');
})();

/* ──────────────────────────────
   15. SCROLL PROGRESS BAR
   ────────────────────────────── */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:3px;
    background:linear-gradient(90deg,#c9a34e,#e0ba6e);
    z-index:2000;transition:width 0.1s linear;pointer-events:none;
  `;
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0).toFixed(2) + '%';
  }, { passive: true });
})();

/* ──────────────────────────────
   16. BUTTON RIPPLE
   ────────────────────────────── */
(function initRipple() {
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `@keyframes rippleAnim { to { width:220px;height:220px;opacity:0; } }`;
    document.head.appendChild(style);
  }

  qsa('.btn').forEach(btn => {
    on(btn, 'click', function(e) {
      const r = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;
        width:0;height:0;background:rgba(255,255,255,0.35);border-radius:50%;
        transform:translate(-50%,-50%);animation:rippleAnim .55s ease forwards;
        pointer-events:none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
})();

/* ──────────────────────────────
   17. SECTION TAG REVEAL
   ────────────────────────────── */
(function initSectionTagReveal() {
  const tags = qsa('.section-tag');
  if (!tags.length) return;

  if (!document.getElementById('tag-anim-style')) {
    const style = document.createElement('style');
    style.id = 'tag-anim-style';
    style.textContent = `
      @keyframes sectionTagIn { from { opacity:0; transform:translateY(10px) scale(0.9); } to { opacity:1; transform:none; } }
      .section-tag { opacity: 0; }
    `;
    document.head.appendChild(style);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        target.style.animation = 'sectionTagIn 0.5s ease forwards';
        io.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  tags.forEach(t => io.observe(t));
})();

/* ──────────────────────────────
   18. LOGO SHIMMER
   ────────────────────────────── */
(function initLogoShimmer() {
  const logoMain = qs('.logo-main');
  if (logoMain) logoMain.classList.add('shimmer-text');
})();

/* ──────────────────────────────
   DONE
   ────────────────────────────── */
console.log('%cAATT Website Loaded ✓', 'color:#c9a34e;font-weight:bold;font-size:14px;');
