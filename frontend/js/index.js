/**
 * index.js — SmartSociety Home Page
 * Handles: animated stat counters, scroll-reveal cards,
 *          dynamic featured societies from data store.
 */

(function () {
  'use strict';

  // ── Animated counter ─────────────────────────────────────────────────────────
  function animateCounter(el, target, suffix, duration = 1800) {
    const isNum = !isNaN(parseInt(target));
    if (!isNum) return;

    const end = parseInt(target);
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * end);
      el.querySelector('.num').childNodes[0].nodeValue = current;
      if (progress < 1) requestAnimationFrame(step);
      else el.querySelector('.num').childNodes[0].nodeValue = end;
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    // Stat items: "8+", "500+", "30+", "1"
    const stats = document.querySelectorAll('.hero-stats .stat-item');
    const targets = [8, 500, 30, 1];
    stats.forEach((el, i) => {
      // Trigger when the stats section enters viewport
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(el, targets[i], '', 1600 + i * 100);
            observer.disconnect();
          }
        });
      }, { threshold: 0.3 });
      observer.observe(el);
    });
  }

  // ── Scroll reveal ─────────────────────────────────────────────────────────────
  function initScrollReveal() {
    const style = document.createElement('style');
    style.textContent = `
      .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.55s ease, transform 0.55s ease; }
      .reveal.visible { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('.card, .section-header, .section-title').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ── Dynamic featured societies ────────────────────────────────────────────────
  function renderFeaturedSocieties() {
    const grid = document.querySelector('.container[style*="padding-top: 0"] .grid');
    if (!grid || !window.DB) return;

    const societies = window.DB.getSocieties();
    // Show 4 featured: first 3 tech + 1 art
    const featured = [
      societies.find(s => s.name === 'Nebula'),
      societies.find(s => s.name === 'Binary Club'),
      societies.find(s => s.name === 'Dance X'),
      societies.find(s => s.name === 'IOTUINO'),
    ].filter(Boolean);

    grid.innerHTML = featured.map(s => `
      <div class="card reveal">
        <span class="tag ${s.category === 'Technical' ? 'tag-tech' : 'tag-art'}">${s.category}</span>
        <h3>${s.icon} ${s.name}</h3>
        <p>${s.description}</p>
      </div>
    `).join('');

    // Re-observe new cards
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ── Update stats from live data ───────────────────────────────────────────────
  function updateLiveStats() {
    if (!window.DB) return;
    const societies     = window.DB.getSocieties();
    const announcements = window.DB.getAnnouncements();

    const statNums = document.querySelectorAll('.hero-stats .stat-item .num');
    if (statNums[0]) {
      // Keep original text structure but update number part
      const societyCount = societies.length;
      statNums[0].innerHTML = `${societyCount}<span>+</span>`;
    }
    if (statNums[2]) {
      statNums[2].innerHTML = `${announcements.length * 6}<span>+</span>`;
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    updateLiveStats();
    renderFeaturedSocieties();
    initCounters();
    initScrollReveal();
  });

})();
