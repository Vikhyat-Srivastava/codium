/**
 * societies.js — SmartSociety Societies Page
 * Handles: dynamic society rendering from DB,
 *          category filter bar, search, card animations.
 */

(function () {
  'use strict';

  let currentFilter = 'All';
  let currentSearch = '';

  // ── Build a society card HTML ─────────────────────────────────────────────────
  function buildCard(s) {
    const tagClass = s.category === 'Technical' ? 'tag-tech' : 'tag-art';
    const iconClass = s.category === 'Art & Culture' ? 'pink' : '';
    return `
      <div class="card society-card" data-category="${s.category}" data-id="${s.id}">
        <span class="tag ${tagClass}">${s.category}</span>
        <div class="card-icon ${iconClass}">${s.icon}</div>
        <h3>${s.name}</h3>
        <p>${s.description}</p>
      </div>
    `;
  }

  // ── Render all societies into the page ────────────────────────────────────────
  function renderSocieties() {
    if (!window.DB) return;

    const societies = window.DB.getSocieties();

    // Group by category
    const grouped = societies.reduce((acc, s) => {
      (acc[s.category] = acc[s.category] || []).push(s);
      return acc;
    }, {});

    // Target container
    const container = document.querySelector('.container');
    if (!container) return;

    // Remove existing grids (keep filter bar)
    container.querySelectorAll('.society-section').forEach(el => el.remove());

    const categories = Object.keys(grouped);

    categories.forEach(cat => {
      const items = grouped[cat].filter(s => {
        const matchFilter = currentFilter === 'All' || s.category === currentFilter;
        const matchSearch = !currentSearch ||
          s.name.toLowerCase().includes(currentSearch) ||
          s.description.toLowerCase().includes(currentSearch);
        return matchFilter && matchSearch;
      });

      if (items.length === 0) return;

      const emoji   = cat === 'Technical' ? '⚙️' : cat === 'Art & Culture' ? '🎨' : '🏆';
      const section = document.createElement('div');
      section.className = 'society-section';
      section.innerHTML = `
        <div class="section-header">
          <div class="section-title">${emoji} ${cat} Societies</div>
          <span class="section-sub">${items.length} ${items.length === 1 ? 'society' : 'societies'}</span>
        </div>
        <div class="grid society-grid">${items.map(buildCard).join('')}</div>
      `;

      const isLastSection = cat === categories[categories.length - 1];
      if (!isLastSection) {
        section.querySelector('.grid').classList.add('section-divider');
      }

      container.appendChild(section);
    });

    // Empty state
    const totalVisible = container.querySelectorAll('.society-card').length;
    let empty = container.querySelector('.empty-state');
    if (totalVisible === 0) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.style.cssText = `
          text-align: center; padding: 64px 0;
          color: var(--muted); font-size: 15px;
        `;
        empty.innerHTML = `<div style="font-size:36px; margin-bottom:16px;">🔍</div>
          <p>No societies found for "<strong style="color:var(--muted2)">${currentSearch || currentFilter}</strong>"</p>`;
        container.appendChild(empty);
      }
    } else {
      if (empty) empty.remove();
    }

    // Animate cards in
    animateCards();
  }

  // ── Card entrance animation ───────────────────────────────────────────────────
  function animateCards() {
    const cards = document.querySelectorAll('.society-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.transition = 'opacity 0.35s ease, transform 0.35s ease, background 0.3s, border-color 0.3s, box-shadow 0.3s';
      card.style.transitionDelay = `${i * 50}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      });
    });
  }

  // ── Filter bar logic ──────────────────────────────────────────────────────────
  function initFilterBar() {
    const filterBar = document.querySelector('.filter-bar');
    if (!filterBar) return;

    // Dynamically build filters from data
    const societies  = window.DB ? window.DB.getSocieties() : [];
    const categories = [...new Set(societies.map(s => s.category))];
    filterBar.innerHTML = '';

    ['All', ...categories].forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        currentFilter = cat;
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSocieties();
      });
      filterBar.appendChild(btn);
    });
  }

  // ── Search bar injection ──────────────────────────────────────────────────────
  function initSearch() {
    const pageHero = document.querySelector('.page-hero');
    if (!pageHero) return;

    const wrap = document.createElement('div');
    wrap.style.cssText = `margin-top: 20px; max-width: 360px; position: relative;`;
    wrap.innerHTML = `
      <input
        id="society-search"
        type="text"
        placeholder="Search societies..."
        style="padding-left: 42px; width: 100%;"
      >
      <span style="
        position:absolute; left:14px; top:50%; transform:translateY(-50%);
        font-size:16px; pointer-events:none;
      ">🔍</span>
    `;
    pageHero.appendChild(wrap);

    document.getElementById('society-search').addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      renderSocieties();
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Remove static HTML sections so we render from DB
    document.querySelectorAll('.section-header, .grid, .section-divider').forEach(el => el.remove());

    initSearch();
    initFilterBar();
    renderSocieties();
  });

})();
