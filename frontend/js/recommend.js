/**
 * recommend.js — SmartSociety Home Page Recommendation Engine
 * Renders: personalised society cards with match scores, tag chips,
 *          profile summary, and edit-profile modal flow.
 * Depends on: data.js (window.DB), nav.js (window.toast)
 */

(function () {
  'use strict';

  // ─── INTEREST/SKILL/ROLE OPTIONS (mirrors login.js) ──────────────────────────
  const INTEREST_OPTIONS = [
    { label: 'Artificial Intelligence', icon: '🤖' },
    { label: 'Competitive Coding',      icon: '⌨️' },
    { label: 'Web Development',         icon: '🌐' },
    { label: 'IoT & Hardware',          icon: '🔌' },
    { label: 'Machine Learning',        icon: '📊' },
    { label: 'Robotics',               icon: '🦾' },
    { label: 'Visual Arts',            icon: '🎨' },
    { label: 'Dance & Performing Arts', icon: '💃' },
    { label: 'Photography',            icon: '📷' },
    { label: 'Career & Placements',    icon: '💼' },
    { label: 'Open Source',            icon: '🔓' },
    { label: 'Startups & Innovation',  icon: '🚀' },
  ];

  const SKILL_OPTIONS = [
    { label: 'Python',          icon: '🐍' },
    { label: 'C++',             icon: '⚡' },
    { label: 'JavaScript',      icon: '🟨' },
    { label: 'React',           icon: '⚛️' },
    { label: 'Machine Learning',icon: '🧠' },
    { label: 'Arduino',         icon: '🔧' },
    { label: 'UI/UX Design',    icon: '🎯' },
    { label: 'Figma',           icon: '✏️' },
    { label: 'DSA',             icon: '🌳' },
    { label: 'Cloud (AWS/GCP)', icon: '☁️' },
    { label: 'Embedded C',      icon: '💾' },
    { label: 'Illustration',    icon: '🖼️' },
  ];

  const ROLE_OPTIONS = [
    { label: 'Developer',        icon: '👨‍💻' },
    { label: 'Researcher',       icon: '🔬' },
    { label: 'Designer',         icon: '🎨' },
    { label: 'Competitive Coder',icon: '🏆' },
    { label: 'Event Organizer',  icon: '📅' },
    { label: 'Performer',        icon: '🎭' },
    { label: 'Mentor/Educator',  icon: '👨‍🏫' },
    { label: 'Hardware Engineer',icon: '🔩' },
  ];

  // ─── INJECT STYLES ────────────────────────────────────────────────────────────
  function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
      /* ── Logged-out hero ─────────────────────────── */
      .rec-hero-wrap {
        text-align: center;
        padding: 80px 20px;
        background: linear-gradient(135deg,
          rgba(0,212,255,0.04) 0%,
          rgba(124,58,237,0.05) 50%,
          rgba(240,171,252,0.04) 100%);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 28px;
        position: relative;
        overflow: hidden;
      }
      .rec-hero-wrap::before {
        content: '';
        position: absolute; inset: 0;
        background:
          radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,212,255,0.08), transparent);
        pointer-events: none;
      }
      .rec-hero-badge {
        display: inline-block;
        padding: 5px 14px;
        background: rgba(0,212,255,0.08);
        border: 1px solid rgba(0,212,255,0.2);
        border-radius: 100px;
        font-size: 12px; font-weight: 500;
        color: var(--accent); letter-spacing: 0.5px;
        text-transform: uppercase; margin-bottom: 24px;
      }
      .rec-hero-title {
        font-family: 'Syne', sans-serif;
        font-size: clamp(32px, 5vw, 54px);
        font-weight: 800; letter-spacing: -1.5px;
        line-height: 1.05; margin-bottom: 16px;
        color: var(--text);
      }
      .rec-hero-sub {
        color: var(--muted2); font-size: 16px;
        max-width: 480px; margin: 0 auto; line-height: 1.7;
        font-weight: 300;
      }
      .rec-features {
        display: flex; gap: 10px; justify-content: center;
        flex-wrap: wrap; margin-top: 28px;
      }
      .rec-feature-pill {
        padding: 8px 16px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 100px;
        font-size: 13px; color: var(--muted2);
      }

      /* ── Recommendation cards ─────────────────────── */
      .rec-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 18px;
      }

      .rec-card {
        background: var(--surface2);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 26px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        cursor: default;
        opacity: 0; transform: translateY(20px);
        animation: recCardIn 0.45s ease forwards;
      }
      @keyframes recCardIn {
        to { opacity: 1; transform: translateY(0); }
      }
      .rec-card:hover {
        transform: translateY(-4px);
        border-color: rgba(0,212,255,0.2);
        box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,212,255,0.08);
      }
      .rec-card.top-pick {
        border-color: rgba(0,212,255,0.25);
        background: linear-gradient(135deg, rgba(0,212,255,0.05), var(--surface2));
      }
      .rec-card.top-pick::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, var(--accent), var(--accent2));
      }

      .rec-card-top {
        display: flex; justify-content: space-between;
        align-items: flex-start; margin-bottom: 14px;
      }
      .rec-card-icon {
        width: 44px; height: 44px; border-radius: 12px;
        background: rgba(0,212,255,0.08);
        border: 1px solid rgba(0,212,255,0.15);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; flex-shrink: 0;
      }
      .rec-card-icon.art {
        background: rgba(240,171,252,0.08);
        border-color: rgba(240,171,252,0.15);
      }

      .rec-score-ring {
        display: flex; flex-direction: column; align-items: center; gap: 2px;
      }
      .rec-score-num {
        font-family: 'Syne', sans-serif;
        font-size: 22px; font-weight: 800;
        letter-spacing: -1px; line-height: 1;
      }
      .rec-score-num.high   { color: var(--accent); }
      .rec-score-num.mid    { color: #a78bfa; }
      .rec-score-num.low    { color: var(--muted2); }
      .rec-score-label {
        font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px;
        color: var(--muted); font-weight: 600;
      }

      .rec-card-name {
        font-family: 'Syne', sans-serif;
        font-size: 17px; font-weight: 700; letter-spacing: -0.3px;
        color: var(--text); margin-bottom: 8px;
      }
      .rec-card-desc {
        font-size: 13px; color: var(--muted2);
        line-height: 1.6; font-weight: 300; margin-bottom: 16px;
      }

      /* Tag chips on cards */
      .rec-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
      .rec-tag {
        padding: 4px 10px; border-radius: 100px;
        font-size: 11px; font-weight: 500; letter-spacing: 0.3px;
        display: inline-flex; align-items: center; gap: 4px;
      }
      .rec-tag-role     { background: rgba(0,212,255,0.08);   color: var(--accent);  border: 1px solid rgba(0,212,255,0.15); }
      .rec-tag-skill    { background: rgba(167,139,250,0.08); color: #a78bfa;        border: 1px solid rgba(167,139,250,0.15); }
      .rec-tag-about    { background: rgba(240,171,252,0.08); color: var(--accent3); border: 1px solid rgba(240,171,252,0.15); }
      .rec-tag-match    { background: rgba(52,211,153,0.08);  color: #34d399;        border: 1px solid rgba(52,211,153,0.15); }

      /* Match reasons strip */
      .rec-matches {
        border-top: 1px solid rgba(255,255,255,0.05);
        padding-top: 14px;
        display: flex; flex-wrap: wrap; gap: 6px;
      }
      .rec-match-chip {
        padding: 3px 9px; border-radius: 100px; font-size: 11px; font-weight: 500;
        display: inline-flex; align-items: center; gap: 4px;
      }
      .rec-match-chip.interest { background: rgba(0,212,255,0.1);   color: var(--accent); }
      .rec-match-chip.skill    { background: rgba(167,139,250,0.1); color: #a78bfa; }
      .rec-match-chip.role     { background: rgba(240,171,252,0.1); color: var(--accent3); }
      .rec-match-chip.category { background: rgba(52,211,153,0.1);  color: #34d399; }
      .rec-no-match { font-size: 12px; color: var(--muted); font-style: italic; }

      /* Top-pick badge */
      .rec-top-badge {
        display: inline-flex; align-items: center; gap: 5px;
        background: rgba(0,212,255,0.12);
        border: 1px solid rgba(0,212,255,0.25);
        border-radius: 100px; padding: 3px 10px;
        font-size: 10px; font-weight: 600;
        color: var(--accent); letter-spacing: 0.5px;
        text-transform: uppercase; margin-bottom: 12px;
      }

      /* ── Profile summary ─────────────────────────── */
      .rec-profile-tags {
        display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px;
      }
      .rec-profile-tag {
        padding: 5px 12px; border-radius: 100px; font-size: 12px;
        font-weight: 400; display: inline-flex; align-items: center; gap: 5px;
      }
      .rpt-interest { background: rgba(0,212,255,0.08);   color: var(--accent);  border: 1px solid rgba(0,212,255,0.15); }
      .rpt-skill    { background: rgba(167,139,250,0.08); color: #a78bfa;        border: 1px solid rgba(167,139,250,0.15); }
      .rpt-role     { background: rgba(240,171,252,0.08); color: var(--accent3); border: 1px solid rgba(240,171,252,0.15); }

      /* ── Edit profile modal ──────────────────────── */
      .epm-overlay {
        position: fixed; inset: 0; z-index: 1000;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center; padding: 20px;
        animation: pmFadeIn 0.25s ease;
      }
      @keyframes pmFadeIn { from{opacity:0} to{opacity:1} }
      .epm-box {
        background: #0d1117;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        width: 100%; max-width: 620px;
        max-height: 90vh; overflow-y: auto;
        animation: pmSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
        scrollbar-width: thin; scrollbar-color: #1e293b transparent;
      }
      @keyframes pmSlideUp {
        from{opacity:0;transform:translateY(28px) scale(0.97)}
        to{opacity:1;transform:translateY(0) scale(1)}
      }
      .epm-header {
        padding: 32px 36px 22px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        position: sticky; top: 0; background: #0d1117;
        border-radius: 24px 24px 0 0; z-index: 2;
        display: flex; justify-content: space-between; align-items: flex-start;
      }
      .epm-title {
        font-family: 'Syne', sans-serif;
        font-size: 20px; font-weight: 800; letter-spacing: -0.4px; color: var(--text);
      }
      .epm-sub { font-size: 13px; color: var(--muted); margin-top: 4px; }
      .epm-close {
        background: rgba(255,255,255,0.06); border: 1px solid var(--border);
        border-radius: 8px; color: var(--muted2); font-size: 16px;
        width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.2s; flex-shrink: 0;
      }
      .epm-close:hover { background: rgba(255,255,255,0.1); color: var(--text); }

      .epm-body { padding: 28px 36px; }
      .epm-section { margin-bottom: 30px; }
      .epm-section-label {
        font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
        color: var(--muted); font-weight: 600; margin-bottom: 14px;
        display: flex; align-items: center; gap: 8px;
      }
      .epm-section-label::after {
        content: ''; flex: 1; height: 1px;
        background: rgba(255,255,255,0.06);
      }

      .epm-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      .epm-chip {
        padding: 8px 14px; border-radius: 100px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        color: #94a3b8; font-size: 12px; font-weight: 400;
        cursor: pointer; transition: all 0.2s;
        font-family: 'DM Sans', sans-serif; user-select: none;
        display: inline-flex; align-items: center; gap: 5px;
      }
      .epm-chip:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
      .epm-chip.sel-i { border-color: var(--accent);  background: rgba(0,212,255,0.1);   color: var(--accent);  }
      .epm-chip.sel-s { border-color: #a78bfa;        background: rgba(167,139,250,0.1); color: #a78bfa;        }
      .epm-chip.sel-r { border-color: var(--accent3); background: rgba(240,171,252,0.1); color: var(--accent3); }

      .epm-footer {
        padding: 18px 36px 30px;
        border-top: 1px solid rgba(255,255,255,0.06);
        display: flex; justify-content: flex-end; gap: 10px;
      }
      .epm-btn {
        padding: 10px 22px; border-radius: 11px; border: none;
        font-family: 'DM Sans', sans-serif; font-size: 14px;
        font-weight: 500; cursor: pointer; transition: all 0.2s;
      }
      .epm-cancel {
        background: transparent; color: var(--muted);
        border: 1px solid var(--border);
      }
      .epm-cancel:hover { color: var(--text); }
      .epm-save {
        background: linear-gradient(135deg, #00d4ff, #00a8d0);
        color: #060910; font-weight: 600;
        box-shadow: 0 0 20px rgba(0,212,255,0.2);
      }
      .epm-save:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(0,212,255,0.35); }

      /* Responsive */
      @media (max-width: 600px) {
        .rec-grid { grid-template-columns: 1fr; }
        .rec-hero-wrap { padding: 48px 20px; }
        .epm-body, .epm-header, .epm-footer { padding-left: 20px; padding-right: 20px; }
      }
    `;
    document.head.appendChild(s);
  }

  // ─── SCORE COLOUR ──────────────────────────────────────────────────────────────
  function scoreClass(score) {
    if (score >= 12) return 'high';
    if (score >= 6)  return 'mid';
    return 'low';
  }

  // ─── BUILD RECOMMENDATION CARD ────────────────────────────────────────────────
  function buildRecCard(society, rank) {
    const isTop     = rank < 3 && society.score > 0;
    const isArt     = society.category === 'Art & Culture';
    const iconClass = isArt ? 'art' : '';
    const sc        = scoreClass(society.score);

    // Match reason chips
    const uniqueReasons = [];
    const seen = new Set();
    (society.matchReasons || []).forEach(r => {
      const key = r.type + r.label;
      if (!seen.has(key)) { seen.add(key); uniqueReasons.push(r); }
    });

    const matchHtml = uniqueReasons.length
      ? uniqueReasons.slice(0, 4).map(r => `
          <span class="rec-match-chip ${r.type}">
            ${r.type === 'interest' ? '⚡' : r.type === 'skill' ? '🛠' : r.type === 'role' ? '👤' : '🏷'} ${r.label}
          </span>`).join('')
      : `<span class="rec-no-match">No direct match — explore anyway!</span>`;

    // Society detail tags (roles, skills, about)
    const roleTags  = (society.roles  || []).slice(0, 2).map(r => `<span class="rec-tag rec-tag-role">👤 ${r}</span>`).join('');
    const skillTags = (society.skills || []).slice(0, 2).map(s => `<span class="rec-tag rec-tag-skill">🛠 ${s}</span>`).join('');

    return `
      <div class="rec-card ${isTop ? 'top-pick' : ''}" style="animation-delay:${rank * 60}ms">
        ${isTop ? '<div class="rec-top-badge">⭐ Top Pick</div>' : ''}
        <div class="rec-card-top">
          <div class="rec-card-icon ${iconClass}">${society.icon}</div>
          <div class="rec-score-ring">
            <div class="rec-score-num ${sc}">${society.score}</div>
            <div class="rec-score-label">match</div>
          </div>
        </div>

        <div class="rec-card-name">${society.name}</div>
        <div class="rec-card-desc">${society.about || society.description}</div>

        <div class="rec-tags">
          ${roleTags}
          ${skillTags}
          <span class="rec-tag rec-tag-about">📂 ${society.category}</span>
        </div>

        <div class="rec-matches">
          ${matchHtml}
        </div>
      </div>
    `;
  }

  // ─── RENDER PROFILE SUMMARY TAGS ─────────────────────────────────────────────
  function renderProfileSummary(profile) {
    const container = document.getElementById('rec-profile-summary');
    if (!container) return;

    const tags = [
      ...(profile.interests || []).slice(0, 3).map(i => `<span class="rec-profile-tag rpt-interest">⚡ ${i}</span>`),
      ...(profile.skills    || []).slice(0, 3).map(s => `<span class="rec-profile-tag rpt-skill">🛠 ${s}</span>`),
      ...(profile.roleGoals || []).slice(0, 2).map(r => `<span class="rec-profile-tag rpt-role">👤 ${r}</span>`),
    ];

    if (tags.length) {
      container.outerHTML = `<div class="rec-profile-tags">${tags.join('')}</div>`;
    } else {
      container.textContent = 'Based on your profile — update anytime.';
    }
  }

  // ─── RENDER RECOMMENDATION GRID ──────────────────────────────────────────────
  function renderRecommendations() {
    const session = window.DB.getSession();
    const loggedOut  = document.getElementById('rec-loggedout');
    const loggedIn   = document.getElementById('rec-loggedin');
    const noProfile  = document.getElementById('rec-no-profile');
    const grid       = document.getElementById('rec-grid');

    if (!session || !session.loggedIn) {
      if (loggedOut) loggedOut.style.display = 'block';
      if (loggedIn)  loggedIn.style.display  = 'none';
      return;
    }

    // Logged in
    if (loggedOut) loggedOut.style.display = 'none';
    if (loggedIn)  loggedIn.style.display  = 'block';

    const profile = window.DB.getProfile();

    if (!profile) {
      if (grid)      grid.style.display      = 'none';
      if (noProfile) noProfile.style.display = 'block';
      return;
    }

    if (noProfile) noProfile.style.display = 'none';
    if (grid)      grid.style.display      = '';

    renderProfileSummary(profile);

    const ranked = window.DB.getRecommendations(profile);
    grid.innerHTML = ranked.map((s, i) => buildRecCard(s, i)).join('');
  }

  // ─── EDIT PROFILE MODAL ───────────────────────────────────────────────────────
  function openEditModal() {
    const existing = window.DB.getProfile() || { interests: [], skills: [], roleGoals: [] };
    const draft = {
      interests: [...existing.interests],
      skills:    [...existing.skills],
      roleGoals: [...existing.roleGoals],
    };

    const overlay = document.createElement('div');
    overlay.className = 'epm-overlay';

    function chips(options, arr, selClass, key) {
      return options.map(opt => `
        <div class="epm-chip ${arr.includes(opt.label) ? selClass : ''}"
             data-key="${key}" data-label="${opt.label}">
          <span>${opt.icon}</span>${opt.label}
        </div>`).join('');
    }

    overlay.innerHTML = `
      <div class="epm-box">
        <div class="epm-header">
          <div>
            <div class="epm-title">✏️ Edit My Profile</div>
            <div class="epm-sub">Refine your picks to improve recommendations.</div>
          </div>
          <button class="epm-close" id="epm-close">✕</button>
        </div>
        <div class="epm-body">
          <div class="epm-section">
            <div class="epm-section-label">⚡ Interests</div>
            <div class="epm-chips">${chips(INTEREST_OPTIONS, draft.interests, 'sel-i', 'interests')}</div>
          </div>
          <div class="epm-section">
            <div class="epm-section-label">🛠 Skills</div>
            <div class="epm-chips">${chips(SKILL_OPTIONS, draft.skills, 'sel-s', 'skills')}</div>
          </div>
          <div class="epm-section">
            <div class="epm-section-label">👤 Role Goals</div>
            <div class="epm-chips">${chips(ROLE_OPTIONS, draft.roleGoals, 'sel-r', 'roleGoals')}</div>
          </div>
        </div>
        <div class="epm-footer">
          <button class="epm-btn epm-cancel" id="epm-cancel">Cancel</button>
          <button class="epm-btn epm-save" id="epm-save">Save & Refresh →</button>
        </div>
      </div>
    `;

    // Wire chips
    overlay.querySelectorAll('.epm-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const key   = chip.dataset.key;
        const label = chip.dataset.label;
        const selClass = key === 'interests' ? 'sel-i' : key === 'skills' ? 'sel-s' : 'sel-r';
        const arr   = draft[key];
        const idx   = arr.indexOf(label);
        if (idx === -1) { arr.push(label); chip.classList.add(selClass); }
        else            { arr.splice(idx, 1); chip.classList.remove(selClass); }
      });
    });

    overlay.querySelector('#epm-close').addEventListener('click',  () => overlay.remove());
    overlay.querySelector('#epm-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#epm-save').addEventListener('click', () => {
      window.DB.saveProfile(draft);
      overlay.remove();
      renderRecommendations();
      window.toast && window.toast('✅ Profile updated! Recommendations refreshed.', 'success');

      // Smooth scroll to section
      document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Close on backdrop click
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    document.body.appendChild(overlay);
  }

  // ─── FIRST-TIME SETUP MODAL (from "Set Up Profile" button) ───────────────────
  function openSetupModal() {
    const STEP_META = [
      { label: 'Step 1 of 3', title: 'What are you into?',        subtitle: 'Select your interests so we can find the right societies.' },
      { label: 'Step 2 of 3', title: 'What skills do you have?',  subtitle: 'Pick skills you have or are learning.' },
      { label: 'Step 3 of 3', title: 'What role fits you best?',  subtitle: 'Choose roles you\'d love to play in a society.' },
    ];

    const profile = { interests: [], skills: [], roleGoals: [] };
    let step = 0;

    const style = document.getElementById('pm-modal-style') || (() => {
      const s = document.createElement('style');
      s.id = 'pm-modal-style';
      s.textContent = `
        .pm-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.85);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:20px;animation:pmFadeIn .3s ease}
        @keyframes pmFadeIn{from{opacity:0}to{opacity:1}}
        .pm-box{background:#0d1117;border:1px solid rgba(255,255,255,.1);border-radius:24px;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;animation:pmSlideUp .35s cubic-bezier(.34,1.56,.64,1);scrollbar-width:thin;scrollbar-color:#1e293b transparent}
        @keyframes pmSlideUp{from{opacity:0;transform:translateY(32px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .pm-header{padding:34px 38px 22px;border-bottom:1px solid rgba(255,255,255,.06);position:sticky;top:0;background:#0d1117;border-radius:24px 24px 0 0;z-index:2}
        .pm-step-bar{display:flex;gap:6px;margin-bottom:18px}
        .pm-step-dot{height:3px;border-radius:2px;flex:1;background:rgba(255,255,255,.1);transition:background .3s}
        .pm-step-dot.active{background:#00d4ff}.pm-step-dot.complete{background:rgba(0,212,255,.4)}
        .pm-step-lbl{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#00d4ff;font-weight:600;margin-bottom:7px}
        .pm-ttl{font-family:'Syne',sans-serif;font-size:21px;font-weight:800;letter-spacing:-.4px;color:#f1f5f9}
        .pm-sub{font-size:13px;color:#64748b;margin-top:5px;font-weight:300}
        .pm-body{padding:26px 38px}
        .pm-chips{display:flex;flex-wrap:wrap;gap:9px}
        .pm-chip{display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:100px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#94a3b8;font-size:13px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;user-select:none}
        .pm-chip:hover{border-color:rgba(0,212,255,.4);color:#f1f5f9;background:rgba(0,212,255,.06)}
        .pm-chip.sel-i{border-color:#00d4ff;background:rgba(0,212,255,.12);color:#00d4ff;font-weight:500}
        .pm-chip.sel-s{border-color:#a78bfa;background:rgba(167,139,250,.12);color:#a78bfa;font-weight:500}
        .pm-chip.sel-r{border-color:#f0abfc;background:rgba(240,171,252,.12);color:#f0abfc;font-weight:500}
        .pm-footer{padding:18px 38px 30px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.06)}
        .pm-cnt{font-size:12px;color:#64748b}.pm-cnt strong{color:#00d4ff}
        .pm-nav{display:flex;gap:9px}
        .pm-btn{padding:10px 22px;border-radius:11px;border:none;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s}
        .pm-back{background:transparent;color:#64748b;border:1px solid rgba(255,255,255,.1)}.pm-back:hover{color:#f1f5f9}
        .pm-next{background:linear-gradient(135deg,#00d4ff,#00a8d0);color:#060910;font-weight:600;box-shadow:0 0 20px rgba(0,212,255,.25)}.pm-next:hover{transform:translateY(-1px)}
        .pm-finish{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;font-weight:600;box-shadow:0 0 20px rgba(124,58,237,.3)}.pm-finish:hover{transform:translateY(-1px)}
        .pm-skip{font-size:12px;color:#475569;cursor:pointer;text-decoration:underline;text-underline-offset:3px;background:none;border:none;font-family:'DM Sans',sans-serif;transition:color .2s}.pm-skip:hover{color:#64748b}
      `;
      document.head.appendChild(s);
      return s;
    })();

    const overlay = document.createElement('div');
    overlay.className = 'pm-overlay';

    const STEPS = [
      { opts: INTEREST_OPTIONS, arr: profile.interests, cls: 'sel-i' },
      { opts: SKILL_OPTIONS,    arr: profile.skills,    cls: 'sel-s' },
      { opts: ROLE_OPTIONS,     arr: profile.roleGoals, cls: 'sel-r' },
    ];

    function render() {
      const meta = STEP_META[step];
      const { opts, arr, cls } = STEPS[step];
      const isLast = step === STEPS.length - 1;

      overlay.innerHTML = `
        <div class="pm-box">
          <div class="pm-header">
            <div class="pm-step-bar">
              ${STEPS.map((_, i) => `<div class="pm-step-dot ${i < step ? 'complete' : i === step ? 'active' : ''}"></div>`).join('')}
            </div>
            <div class="pm-step-lbl">${meta.label}</div>
            <div class="pm-ttl">${meta.title}</div>
            <div class="pm-sub">${meta.subtitle}</div>
          </div>
          <div class="pm-body">
            <div class="pm-chips">
              ${opts.map(opt => `
                <div class="pm-chip ${arr.includes(opt.label) ? cls : ''}" data-label="${opt.label}">
                  <span>${opt.icon}</span>${opt.label}
                </div>`).join('')}
            </div>
          </div>
          <div class="pm-footer">
            <div>
              <span class="pm-cnt"><strong>${arr.length}</strong> selected</span>
              ${!isLast ? '<br><button class="pm-skip">Skip →</button>' : ''}
            </div>
            <div class="pm-nav">
              ${step > 0 ? '<button class="pm-btn pm-back">← Back</button>' : ''}
              ${isLast
                ? '<button class="pm-btn pm-finish">🎯 Get Recommendations</button>'
                : '<button class="pm-btn pm-next">Next →</button>'}
            </div>
          </div>
        </div>`;

      overlay.querySelectorAll('.pm-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const label = chip.dataset.label;
          const idx = arr.indexOf(label);
          if (idx === -1) { arr.push(label); chip.classList.add(cls); }
          else            { arr.splice(idx, 1); chip.classList.remove(cls); }
          const cnt = overlay.querySelector('.pm-cnt strong');
          if (cnt) cnt.textContent = arr.length;
        });
      });

      overlay.querySelector('.pm-back')?.addEventListener('click',   () => { step--; render(); });
      overlay.querySelector('.pm-next')?.addEventListener('click',   () => { step++; render(); });
      overlay.querySelector('.pm-skip')?.addEventListener('click',   () => { step++; render(); });
      overlay.querySelector('.pm-finish')?.addEventListener('click', () => {
        window.DB.saveProfile(profile);
        overlay.remove();
        renderRecommendations();
        window.toast && window.toast('🎯 Profile saved! Here are your matches.', 'success');
        document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' });
      });
    }

    render();
    document.body.appendChild(overlay);
  }

  // ─── WIRE BUTTONS ─────────────────────────────────────────────────────────────
  function wireButtons() {
    document.getElementById('rec-edit-profile')?.addEventListener('click', openEditModal);
    document.getElementById('rec-setup-profile')?.addEventListener('click', openSetupModal);
  }

  // ─── AUTO-SCROLL ON HASH ──────────────────────────────────────────────────────
  function handleHashScroll() {
    if (window.location.hash === '#recommendations') {
      setTimeout(() => {
        document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    renderRecommendations();
    wireButtons();
    handleHashScroll();
  });

})();
