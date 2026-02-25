/**
 * admin.js — SmartSociety Admin Dashboard
 * Handles: auth guard, live stats, publish form,
 *          manage table (edit / delete), sidebar active state,
 *          modal editor, real-time count updates.
 */

(function () {
  'use strict';

  // ── Auth guard ────────────────────────────────────────────────────────────────
  function guardAdmin() {
    if (!window.DB) return;
    if (!window.DB.isAdmin()) {
      window.toast && window.toast('Admin access required. Please log in.', 'error');
      setTimeout(() => window.location.href = 'login.html', 1200);
    }
  }

  // ── Sidebar active link on scroll ─────────────────────────────────────────────
  function initSidebarActive() {
    const links    = document.querySelectorAll('.sidebar-link[href^="#"]');
    const sections = [...links].map(l => document.querySelector(l.getAttribute('href')));

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(sec => {
        if (sec && window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      links.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
      });
    }, { passive: true });
  }

  // ── Render live stats ─────────────────────────────────────────────────────────
  function refreshStats() {
    if (!window.DB) return;
    const societies     = window.DB.getSocieties();
    const announcements = window.DB.getAnnouncements();

    const statValues = document.querySelectorAll('.stat-value');
    const statLabels = document.querySelectorAll('.stat-label');

    // Find by label text
    statValues.forEach((el, i) => {
      const label = statLabels[i]?.textContent?.trim();
      if (label === 'Total Societies')    el.textContent = societies.length;
      if (label === 'Announcements')      el.textContent = announcements.length;
      if (label === 'Events This Month')  el.textContent = announcements.filter(a => {
        if (!a.date) return false;
        const d = new Date(a.date + 'T00:00:00');
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
    });

    // Update table count badge
    const subEl = document.querySelector('#manage .section-sub');
    if (subEl) subEl.textContent = `${announcements.length} total`;
  }

  // ── Format date ───────────────────────────────────────────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch { return dateStr; }
  }

  // ── Render announcements table ────────────────────────────────────────────────
  function renderTable() {
    if (!window.DB) return;
    const announcements = window.DB.getAnnouncements();
    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;

    if (announcements.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding: 40px; color: var(--muted);">
            No announcements yet. Publish one above!
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = announcements.map(a => {
      const tagClass = a.category === 'Technical' ? 'tag-tech' : 'tag-art';
      return `
        <tr data-id="${a.id}">
          <td><span class="tag ${tagClass}">${a.society}</span></td>
          <td><strong>${a.title}</strong></td>
          <td>${formatDate(a.date)}</td>
          <td class="actions">
            <button class="btn btn-ghost edit-btn" data-id="${a.id}">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${a.id}">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    // Wire delete
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteAnnouncement(parseInt(btn.dataset.id)));
    });

    // Wire edit
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });

    refreshStats();
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  function deleteAnnouncement(id) {
    if (!confirm('Delete this announcement? This cannot be undone.')) return;
    window.DB.deleteAnnouncement(id);
    renderTable();
    window.toast && window.toast('Announcement deleted.', 'info');
  }

  // ── Publish form ──────────────────────────────────────────────────────────────
  function initPublishForm() {
    const publishBtn = document.querySelector('#publish .btn-primary');
    if (!publishBtn) return;

    publishBtn.addEventListener('click', () => {
      const inputs   = document.querySelectorAll('#publish input, #publish select, #publish textarea');
      const select   = inputs[0];
      const titleIn  = inputs[1];
      const msgIn    = inputs[2];
      const dateIn   = inputs[3];
      const locIn    = inputs[4];

      // Validate
      let valid = true;
      [select, titleIn, msgIn].forEach(el => {
        clearFieldError(el);
        if (!el.value.trim()) {
          showFieldError(el, 'This field is required.');
          valid = false;
        }
      });

      if (!valid) {
        window.toast && window.toast('Please fill in all required fields.', 'error');
        return;
      }

      // Build & save
      window.DB.addAnnouncement({
        society:  select.value.trim(),
        title:    titleIn.value.trim(),
        message:  msgIn.value.trim(),
        date:     dateIn.value.trim(),
        location: locIn.value.trim(),
      });

      // Reset form
      [select, titleIn, msgIn, dateIn, locIn].forEach(el => el.value = '');

      renderTable();

      publishBtn.textContent = '✓ Published!';
      publishBtn.style.background = 'linear-gradient(135deg, #34d399, #059669)';
      setTimeout(() => {
        publishBtn.textContent = 'Publish Announcement';
        publishBtn.style.background = '';
      }, 2000);

      window.toast && window.toast('Announcement published successfully!', 'success');

      // Scroll to table
      document.querySelector('#manage')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function showFieldError(el, msg) {
    el.style.borderColor = '#f87171';
    const err = document.createElement('div');
    err.className = 'field-err';
    err.style.cssText = 'color:#f87171;font-size:12px;margin-top:-10px;margin-bottom:8px;padding-left:4px;';
    err.textContent = msg;
    el.after(err);
  }

  function clearFieldError(el) {
    el.style.borderColor = '';
    const next = el.nextSibling;
    if (next && next.classList?.contains('field-err')) next.remove();
  }

  // ── Edit Modal ────────────────────────────────────────────────────────────────
  function injectModalStyles() {
    const s = document.createElement('style');
    s.textContent = `
      .modal-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(6px);
        z-index: 500;
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        animation: fadeIn 0.2s ease;
      }
      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      .modal-box {
        background: #111827;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 36px 40px;
        width: 100%; max-width: 520px;
        animation: slideUp 0.25s ease;
      }
      @keyframes slideUp {
        from { opacity:0; transform: translateY(20px); }
        to   { opacity:1; transform: translateY(0); }
      }
      .modal-title {
        font-family: 'Syne', sans-serif;
        font-size: 20px; font-weight: 700;
        margin-bottom: 24px;
        letter-spacing: -0.3px;
      }
      .modal-actions {
        display: flex; gap: 12px; justify-content: flex-end;
        margin-top: 24px;
      }
    `;
    document.head.appendChild(s);
  }

  function openEditModal(id) {
    const ann = window.DB.getAnnouncements().find(a => a.id === id);
    if (!ann) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-title">✏️ Edit Announcement</div>

        <div class="form-group">
          <label>Society</label>
          <select id="m-society">
            ${window.DB.getSocieties().map(s =>
              `<option value="${s.name}" ${s.name === ann.society ? 'selected' : ''}>${s.name}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Title</label>
          <input id="m-title" type="text" value="${ann.title}">
        </div>
        <div class="form-group">
          <label>Message</label>
          <textarea id="m-message">${ann.message}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <div class="form-group" style="margin-bottom:0;">
            <label>Date</label>
            <input id="m-date" type="text" value="${ann.date || ''}">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label>Location</label>
            <input id="m-location" type="text" value="${ann.location || ''}">
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" id="m-cancel">Cancel</button>
          <button class="btn btn-primary" id="m-save">Save Changes</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay);
    });

    overlay.querySelector('#m-cancel').addEventListener('click', () => closeModal(overlay));

    overlay.querySelector('#m-save').addEventListener('click', () => {
      const title = overlay.querySelector('#m-title').value.trim();
      const msg   = overlay.querySelector('#m-message').value.trim();
      if (!title || !msg) {
        window.toast && window.toast('Title and message cannot be empty.', 'error');
        return;
      }

      window.DB.updateAnnouncement(id, {
        society:  overlay.querySelector('#m-society').value,
        title,
        message:  msg,
        date:     overlay.querySelector('#m-date').value.trim(),
        location: overlay.querySelector('#m-location').value.trim(),
      });

      closeModal(overlay);
      renderTable();
      window.toast && window.toast('Announcement updated!', 'success');
    });
  }

  function closeModal(overlay) {
    overlay.style.animation = 'fadeOut 0.15s ease forwards';
    const style = document.createElement('style');
    style.textContent = '@keyframes fadeOut { to { opacity:0; } }';
    document.head.appendChild(style);
    setTimeout(() => overlay.remove(), 150);
  }

  // ── Smooth sidebar scroll ─────────────────────────────────────────────────────
  function initSidebarScroll() {
    document.querySelectorAll('.sidebar-link[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update active state immediately
          document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    });
  }

  // ── Show logged-in admin name in header ───────────────────────────────────────
  function showAdminName() {
    const session = window.DB?.getSession();
    if (!session) return;
    const p = document.querySelector('.admin-header p');
    if (p) p.textContent = `Logged in as ${session.name} · Manage societies, announcements, and campus activity.`;
  }

  // ── Animate stat cards on load ────────────────────────────────────────────────
  function animateStats() {
    document.querySelectorAll('.stat-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
      card.style.transition = `opacity 0.4s ease ${i * 80}ms, transform 0.4s ease ${i * 80}ms`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }));
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    guardAdmin();
    injectModalStyles();
    showAdminName();
    refreshStats();
    renderTable();
    initPublishForm();
    initSidebarScroll();
    initSidebarActive();
    animateStats();
  });

})();
