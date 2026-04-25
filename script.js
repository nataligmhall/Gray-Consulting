'use strict';

/* ─── CUSTOM CURSOR ──────────────────────────────────── */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
});

(function lerpRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
  requestAnimationFrame(lerpRing);
})();

const hoverTargets = 'a, button, .cap-card, .work-row, input, textarea, .hero-logo-mark';
document.querySelectorAll(hoverTargets).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

/* ─── THEME TOGGLE ───────────────────────────────────── */
(function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  function isLight() {
    return document.documentElement.classList.contains('theme-light');
  }

  function updateIcon() {
    const icon = btn.querySelector('.theme-toggle-icon');
    if (icon) icon.textContent = isLight() ? '◑' : '◐';
  }

  btn.addEventListener('click', () => {
    const next = isLight() ? 'dark' : 'light';
    document.documentElement.classList.toggle('theme-light', next === 'light');
    localStorage.setItem('gc-theme', next);
    updateIcon();
  });

  btn.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  btn.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));

  updateIcon();
})();

/* ─── BACKGROUND: BARS (Spectrum-matched) ───────────── */
(function initBgBars() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let raf, w, h, dpr, t = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const barsRgb = getComputedStyle(document.documentElement).getPropertyValue('--bg-bars-rgb').trim() || '232, 232, 232';
    const barW = 6;
    const gap  = 80;
    const count = Math.ceil(w / gap) + 2;
    for (let i = 0; i < count; i++) {
      const x     = i * gap + (t * 0.3 % gap);
      const phase = Math.sin(t * 0.01 + i * 0.4);
      const hh    = h * (0.35 + phase * 0.1);
      const op    = 0.04 + Math.abs(phase) * 0.03;
      ctx.fillStyle = `rgba(${barsRgb},${op})`;
      ctx.fillRect(x - barW / 2, (h - hh) / 2, barW, hh);
    }
    t++;
    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();


/* ─── HERO SPECTRUM MARK HOVER ───────────────────────── */
(function initHeroMark() {
  const mark = document.querySelector('.hero-logo-mark');
  if (!mark) return;
  const rects = mark.querySelectorAll('rect');
  const baseData = [
    { y: 16, h: 88 }, { y: 19, h: 82 }, { y: 16, h: 88 },
    { y: 19, h: 82 }, { y: 16, h: 88 },
  ];

  mark.addEventListener('mouseenter', () => {
    rects.forEach(r => {
      r.setAttribute('y', '10');
      r.setAttribute('height', '100');
    });
  });
  mark.addEventListener('mouseleave', () => {
    rects.forEach((r, i) => {
      r.setAttribute('y', String(baseData[i].y));
      r.setAttribute('height', String(baseData[i].h));
    });
  });
})();

/* ─── SMOOTH SCROLL ──────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ─── SCROLL REVEAL ──────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ─── WORK ROW PREVIEW ───────────────────────────────── */
(function initWorkPreview() {
  const preview = document.getElementById('workPreview');
  const inner   = document.getElementById('workPreviewInner');
  if (!preview || !inner) return;

  let previewX = window.innerWidth / 2;
  let previewY = window.innerHeight / 2;
  let targetX  = previewX;
  let targetY  = previewY;
  let isVisible = false;
  let rafId = 0;

  function lerp() {
    previewX += (targetX - previewX) * 0.1;
    previewY += (targetY - previewY) * 0.1;
    preview.style.left = previewX + 'px';
    preview.style.top  = previewY + 'px';
    preview.style.transform = `translate(-50%, -50%) scale(${isVisible ? 1 : 0.8})`;
    rafId = requestAnimationFrame(lerp);
  }
  rafId = requestAnimationFrame(lerp);

  document.querySelectorAll('.work-row').forEach(row => {
    const name = row.querySelector('.name');
    row.addEventListener('mouseenter', () => {
      isVisible = true;
      preview.classList.add('visible');
      inner.textContent = name ? name.textContent.charAt(0) : '↗';
    });
    row.addEventListener('mouseleave', () => {
      isVisible = false;
      preview.classList.remove('visible');
    });
    row.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });
  });
})();

/* ─── CONTACT FORM ───────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name    = document.getElementById('fname').value.trim();
  const email   = document.getElementById('femail').value.trim();
  const company = document.getElementById('fcompany').value.trim();
  const message = document.getElementById('fmsg').value.trim();

  if (!name || !email || !message) return;

  const subject = encodeURIComponent('Gray Consulting inquiry from ' + name);
  const body    = encodeURIComponent(
    'Name: '    + name    + '\n' +
    'Email: '   + email   + '\n' +
    (company ? 'Company: ' + company + '\n' : '') +
    '\nMessage:\n' + message
  );

  window.location.href =
    'mailto:contact@grayconsultingmanagement.com?subject=' + subject + '&body=' + body;

  const sentMsg = document.getElementById('sentMsg');
  sentMsg.classList.add('visible');
  this.reset();

  setTimeout(() => sentMsg.classList.remove('visible'), 6000);
});
