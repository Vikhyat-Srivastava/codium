/**
 * announcements.js — SmartSociety Announcements Page
 * Handles: dynamic rendering from DB, category + time filters,
 *          search, card entrance animations.
 */

(function () {
  'use strict';

  let currentFilter = 'All';
  let currentSearch = '';

  // ── Format date for display ───────────────────────────────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  // ── "This week" helper ────────────────────────────────────────────────────────
  function isThisWeek(dateStr) {
    if (!dateStr) return false;
    const now   = new Date();
    const date  = new Date(dateStr + 'T00:00:00');
    const start = new Date(now); start.setDate(now.getDate() - now.getDay());
    const end   = new Date(start); end.setDate(start.getDate() + 6);
    return date >= start && date <= end;
  }

  // ── Build an announcement card HTML ──────────────────────────────────────────
  function buildCard(a) {
    const tagClass  = a.category === 'Technical' ? 'tag-tech' : 'tag-art';
    const dotClass  = a.dotColor === 'purple' ? 'purple' : a.dotColor === 'pink' ? 'pink' : '';
    return `
      <div class="ann-card" data-category="${a.category}" data-id="${a.id}">
        <div class="ann-dot ${dotClass}"></div>
        <div class="ann-body">
          <span class="tag ${tagClass}" style="margin-bottom: 8px;">${a.society}</span>
          <h3>${a.title}</h3>
          <p>${a.message}</p>
          <div class="ann-meta">
            ${a.date     ? `<span>📅 ${formatDate(a.date)}</span>` : ''}
            ${a.time     ? `<span>⏰ ${a.time}</span>` : ''}
            ${a.location ? `<span>📍 ${a.location}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ── Render filtered announcements ─────────────────────────────────────────────
  function renderAnnouncements() {
    if (!window.DB) return;

    const all = window.DB.getAnnouncements();

    const filtered = all.filter(a => {
      const matchFilter =
        currentFilter === 'All'          ? true :
        currentFilter === 'This Week'    ? isThisWeek(a.date) :
        a.category === currentFilter;

      const matchSearch = !currentSearch ||
        a.title.toLowerCase().includes(currentSearch)    ||
        a.society.toLowerCase().includes(currentSearch)  ||
        a.message.toLowerCase().includes(currentSearch);

      return matchFilter && matchSearch;
    });

    // Target: the list container after the filter bar
    let listWrap = document.querySelector('.ann-list');
    if (!listWrap) {
      listWrap = document.createElement('div');
      listWrap.className = 'ann-list';
      const container = document.querySelector('.container');
      if (container) container.appendChild(listWrap);
    }

    listWrap.innerHTML = filtered.length
      ? filtered.map(buildCard).join('')
      : `<div style="text-align:center; padding: 64px 0; color: var(--muted);">
           <div style="font-size:36px; margin-bottom:16px;">📭</div>
           <p>No announcements found${currentSearch ? ` for "<strong style="color:var(--muted2)">${currentSearch}</strong>"` : ''}.</p>
         </div>`;

    // Update count badge
    const countBadge = document.querySelector('.ann-count');
    if (countBadge) countBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'announcement' : 'announcements'}`;

    // Animate in
    animateCards();
  }

  // ── Entrance animation ────────────────────────────────────────────────────────
  function animateCards() {
    document.querySelectorAll('.ann-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(-12px)';
      card.style.transition = `opacity 0.35s ease ${i * 60}ms, transform 0.35s ease ${i * 60}ms, border-color 0.3s, transform 0.3s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
      }));
    });
  }

  // ── Filter bar ────────────────────────────────────────────────────────────────
  function initFilterBar() {
    const bar = document.querySelector('.filter-bar');
    if (!bar) return;

    const filters = ['All', 'Technical', 'Art & Culture', 'This Week'];
    bar.innerHTML = '';

    filters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (f === 'All' ? ' active' : '');
      btn.textContent = f;
      btn.addEventListener('click', () => {
        currentFilter = f;
        bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderAnnouncements();
      });
      bar.appendChild(btn);
    });
  }

  // ── Search injection ──────────────────────────────────────────────────────────
  function initSearch() {
    const pageHero = document.querySelector('.page-hero');
    if (!pageHero) return;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-top: 20px; max-width: 360px; position: relative;';
    wrap.innerHTML = `
      <input id="ann-search" type="text" placeholder="Search announcements..."
        style="padding-left: 42px; width:100%;">
      <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);
        font-size:16px;pointer-events:none;">🔍</span>
    `;
    pageHero.appendChild(wrap);

    document.getElementById('ann-search').addEventListener('input', e => {
      currentSearch = e.target.value.trim().toLowerCase();
      renderAnnouncements();
    });
  }

  // ── Count badge in page header ────────────────────────────────────────────────
  function injectCountBadge() {
    const h1 = document.querySelector('.page-hero h1');
    if (!h1) return;
    const badge = document.createElement('span');
    badge.className = 'ann-count';
    badge.style.cssText = `
      display: inline-block; margin-left: 14px;
      font-size: 14px; font-family: 'DM Sans', sans-serif;
      font-weight: 400; letter-spacing: 0;
      color: var(--muted); vertical-align: middle;
    `;
    h1.appendChild(badge);
  }

  // ── Remove static HTML cards (replaced by JS render) ─────────────────────────
  function clearStaticCards() {
    document.querySelectorAll('.container .ann-card').forEach(el => el.remove());
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    clearStaticCards();
    injectCountBadge();
    initSearch();
    initFilterBar();
    renderAnnouncements();
  });

})();
