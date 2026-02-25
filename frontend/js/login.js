/**
 * login.js — SmartSociety Login Page
 * Handles: role toggle (Student / Admin), form validation,
 *          auth against DB, redirect on success, session guard.
 */

(function () {
  'use strict';

  let selectedRole = 'student';

  // ── Redirect if already logged in ────────────────────────────────────────────
  function checkAlreadyLoggedIn() {
    if (!window.DB) return;
    const session = window.DB.getSession();
    if (session && session.loggedIn) {
      window.location.href = session.role === 'admin' ? 'admin.html' : 'index.html';
    }
  }

  // ── Role toggle ───────────────────────────────────────────────────────────────
  function initRoleToggle() {
    const buttons = document.querySelectorAll('.role-toggle button');
    const emailInput = document.querySelector('input[type="email"]');
    const label = emailInput ? emailInput.closest('.form-group')?.querySelector('label') : null;

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRole = i === 0 ? 'student' : 'admin';

        // Update placeholder hints
        if (emailInput) {
          emailInput.placeholder = selectedRole === 'admin'
            ? 'admin@university.edu'
            : 'you@university.edu';
          emailInput.value = '';
        }

        // Update subtitle hint
        const subtitle = document.querySelector('.form-subtitle');
        if (subtitle) {
          subtitle.textContent = selectedRole === 'admin'
            ? 'Admin access only — enter your credentials'
            : 'Sign in to your SmartSociety account';
        }

        // Shake animation on role switch
        const box = document.querySelector('.form-box');
        if (box) {
          box.style.animation = 'none';
          requestAnimationFrame(() => {
            box.style.animation = '';
          });
        }
      });
    });
  }

  // ── Input validation ──────────────────────────────────────────────────────────
  function setError(input, msg) {
    clearError(input);
    input.style.borderColor = '#f87171';
    input.style.boxShadow = '0 0 0 3px rgba(248,113,113,0.12)';
    const err = document.createElement('div');
    err.className = 'field-error';
    err.style.cssText = 'color: #f87171; font-size: 12px; margin-top: -10px; margin-bottom: 12px; padding-left: 4px;';
    err.textContent = msg;
    input.after(err);
  }

  function clearError(input) {
    input.style.borderColor = '';
    input.style.boxShadow = '';
    const next = input.nextSibling;
    if (next && next.classList && next.classList.contains('field-error')) next.remove();
  }

  function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(e => e.remove());
    document.querySelectorAll('input').forEach(i => {
      i.style.borderColor = '';
      i.style.boxShadow = '';
    });
  }

  // ── Login handler ─────────────────────────────────────────────────────────────
  function handleLogin() {
    clearAllErrors();

    const emailInput = document.querySelector('input[type="email"]');
    const passInput  = document.querySelector('input[type="password"]');
    if (!emailInput || !passInput) return;

    const email    = emailInput.value.trim();
    const password = passInput.value;
    let valid = true;

    if (!email) {
      setError(emailInput, 'Email is required.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError(emailInput, 'Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setError(passInput, 'Password is required.');
      valid = false;
    } else if (password.length < 6) {
      setError(passInput, 'Password must be at least 6 characters.');
      valid = false;
    }

    if (!valid) return;

    // Attempt auth
    const loginBtn = document.querySelector('.btn-primary');
    loginBtn.textContent = 'Signing in...';
    loginBtn.style.opacity = '0.7';
    loginBtn.disabled = true;

    setTimeout(() => {
      const session = window.DB ? window.DB.login(email, password, selectedRole) : null;

      if (session) {
        loginBtn.textContent = '✓ Success!';
        loginBtn.style.background = 'linear-gradient(135deg, #34d399, #059669)';

        window.toast && window.toast(`Welcome back, ${session.name}!`, 'success');

        setTimeout(() => {
          if (session.role === 'admin') {
            window.location.href = 'admin.html';
          } else if (!window.DB.hasProfile()) {
            // First-time student — show interest profile modal before redirecting
            showProfileModal(session);
          } else {
            window.location.href = 'index.html';
          }
        }, 800);
      } else {
        // Failed
        loginBtn.textContent = 'Login →';
        loginBtn.style.opacity = '1';
        loginBtn.disabled = false;

        setError(emailInput, ' ');
        setError(passInput, 'Invalid credentials. Please check your email and password.');

        // Shake the form
        const box = document.querySelector('.form-box');
        if (box) {
          box.style.animation = 'shakeForm 0.4s ease';
          setTimeout(() => box.style.animation = '', 400);
        }

        window.toast && window.toast('Login failed — check your credentials.', 'error');
      }
    }, 600); // Small delay for UX feel
  }

  // ── "Enter" key submits ───────────────────────────────────────────────────────
  function initEnterKey() {
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin();
      });
    });
  }

  // ── Inject shake animation ────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shakeForm {
        0%,100% { transform: translateX(0); }
        20%     { transform: translateX(-8px); }
        40%     { transform: translateX(8px); }
        60%     { transform: translateX(-6px); }
        80%     { transform: translateX(6px); }
      }
      /* Demo hint panel */
      .demo-hint {
        background: rgba(0,212,255,0.05);
        border: 1px solid rgba(0,212,255,0.15);
        border-radius: 12px;
        padding: 14px 16px;
        margin-top: 20px;
        font-size: 12px;
        color: var(--muted2);
        line-height: 1.7;
      }
      .demo-hint strong { color: var(--accent); }
      .demo-hint .fill-link {
        color: var(--accent);
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Demo credentials hint ─────────────────────────────────────────────────────
  function injectDemoHint() {
    const box = document.querySelector('.form-box');
    if (!box) return;

    const hint = document.createElement('div');
    hint.className = 'demo-hint';
    hint.innerHTML = `
      <strong>Demo Credentials</strong><br>
      🎓 Student — <span class="fill-link" data-role="student">student@university.edu / student123</span><br>
      🛠 Admin &nbsp;— <span class="fill-link" data-role="admin">admin@university.edu / admin123</span>
    `;

    box.appendChild(hint);

    hint.querySelectorAll('.fill-link').forEach(link => {
      link.addEventListener('click', () => {
        const role = link.dataset.role;
        // Switch role toggle
        const buttons = document.querySelectorAll('.role-toggle button');
        buttons.forEach(b => b.classList.remove('active'));
        buttons[role === 'student' ? 0 : 1]?.classList.add('active');
        selectedRole = role;

        // Fill inputs
        const emailInput = document.querySelector('input[type="email"]');
        const passInput  = document.querySelector('input[type="password"]');
        if (emailInput) emailInput.value = role === 'student' ? 'student@university.edu' : 'admin@university.edu';
        if (passInput)  passInput.value  = role === 'student' ? 'student123' : 'admin123';
      });
    });
  }

  // ── Profile Onboarding Modal ──────────────────────────────────────────────────
  function showProfileModal(session) {

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

    // Inject modal styles
    const style = document.createElement('style');
    style.textContent = `
      .pm-overlay {
        position: fixed; inset: 0; z-index: 1000;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        animation: pmFadeIn 0.3s ease;
      }
      @keyframes pmFadeIn { from{opacity:0} to{opacity:1} }

      .pm-box {
        background: #0d1117;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        width: 100%; max-width: 620px;
        max-height: 90vh;
        overflow-y: auto;
        animation: pmSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
        scrollbar-width: thin;
        scrollbar-color: #1e293b transparent;
      }
      @keyframes pmSlideUp {
        from{opacity:0;transform:translateY(32px) scale(0.97)}
        to{opacity:1;transform:translateY(0) scale(1)}
      }

      .pm-header {
        padding: 36px 40px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        position: sticky; top: 0;
        background: #0d1117;
        border-radius: 24px 24px 0 0;
        z-index: 2;
      }
      .pm-step-bar {
        display: flex; gap: 6px; margin-bottom: 20px;
      }
      .pm-step-dot {
        height: 3px; border-radius: 2px; flex: 1;
        background: rgba(255,255,255,0.1);
        transition: background 0.3s ease;
      }
      .pm-step-dot.active   { background: #00d4ff; }
      .pm-step-dot.complete { background: rgba(0,212,255,0.4); }

      .pm-step-label {
        font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
        color: #00d4ff; font-weight: 600; margin-bottom: 8px;
      }
      .pm-title {
        font-family: 'Syne', sans-serif;
        font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
        color: #f1f5f9;
      }
      .pm-subtitle {
        font-size: 14px; color: #64748b; margin-top: 6px; font-weight: 300;
      }

      .pm-body { padding: 28px 40px; }

      .pm-chips {
        display: flex; flex-wrap: wrap; gap: 10px;
      }
      .pm-chip {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 9px 16px; border-radius: 100px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        color: #94a3b8; font-size: 13px; font-weight: 400;
        cursor: pointer; transition: all 0.2s ease;
        font-family: 'DM Sans', sans-serif;
        user-select: none;
      }
      .pm-chip:hover {
        border-color: rgba(0,212,255,0.4);
        color: #f1f5f9;
        background: rgba(0,212,255,0.06);
      }
      .pm-chip.selected {
        border-color: #00d4ff;
        background: rgba(0,212,255,0.12);
        color: #00d4ff;
        font-weight: 500;
      }
      .pm-chip.selected-skill {
        border-color: #a78bfa;
        background: rgba(167,139,250,0.12);
        color: #a78bfa;
        font-weight: 500;
      }
      .pm-chip.selected-role {
        border-color: #f0abfc;
        background: rgba(240,171,252,0.12);
        color: #f0abfc;
        font-weight: 500;
      }

      .pm-footer {
        padding: 20px 40px 32px;
        display: flex; justify-content: space-between; align-items: center;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .pm-count {
        font-size: 12px; color: #64748b;
      }
      .pm-count strong { color: #00d4ff; }
      .pm-nav { display: flex; gap: 10px; }

      .pm-btn {
        padding: 11px 24px; border-radius: 12px; border: none;
        font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
        cursor: pointer; transition: all 0.2s ease;
      }
      .pm-btn-ghost {
        background: transparent; color: #64748b;
        border: 1px solid rgba(255,255,255,0.1);
      }
      .pm-btn-ghost:hover { color: #f1f5f9; border-color: rgba(255,255,255,0.2); }
      .pm-btn-primary {
        background: linear-gradient(135deg, #00d4ff, #00a8d0);
        color: #060910; font-weight: 600;
        box-shadow: 0 0 20px rgba(0,212,255,0.25);
      }
      .pm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(0,212,255,0.4); }
      .pm-btn-finish {
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        color: white; font-weight: 600;
        box-shadow: 0 0 20px rgba(124,58,237,0.3);
      }
      .pm-btn-finish:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(124,58,237,0.5); }

      .pm-skip {
        font-size: 12px; color: #475569; cursor: pointer; text-decoration: underline;
        text-underline-offset: 3px; background: none; border: none;
        font-family: 'DM Sans', sans-serif; transition: color 0.2s;
      }
      .pm-skip:hover { color: #64748b; }

      .pm-section-step { display: none; }
      .pm-section-step.active { display: block; }
    `;
    document.head.appendChild(style);

    // Build state
    const profile = { interests: [], skills: [], roleGoals: [] };
    let currentStep = 0;
    const steps = ['interests', 'skills', 'roles'];
    const STEP_META = [
      { label: 'Step 1 of 3', title: `Hey ${session.name.split(' ')[0]}, what are you into?`, subtitle: 'Select your interests so we can find the right societies for you.' },
      { label: 'Step 2 of 3', title: 'What skills do you bring?',   subtitle: 'Pick skills you already have or are actively learning right now.' },
      { label: 'Step 3 of 3', title: 'What role fits you best?',     subtitle: 'Choose the roles you\'d love to play inside a society.' },
    ];

    const overlay = document.createElement('div');
    overlay.className = 'pm-overlay';

    function renderChips(options, selectedArr, selectedClass) {
      return options.map(opt => `
        <div class="pm-chip ${selectedArr.includes(opt.label) ? selectedClass : ''}"
             data-label="${opt.label}">
          <span>${opt.icon}</span> ${opt.label}
        </div>
      `).join('');
    }

    function getStepOptions() {
      if (currentStep === 0) return { opts: INTEREST_OPTIONS, arr: profile.interests, cls: 'selected',      label: 'interests' };
      if (currentStep === 1) return { opts: SKILL_OPTIONS,    arr: profile.skills,    cls: 'selected-skill', label: 'skills' };
      return                        { opts: ROLE_OPTIONS,     arr: profile.roleGoals, cls: 'selected-role',  label: 'roles' };
    }

    function renderModal() {
      const meta = STEP_META[currentStep];
      const { opts, arr, cls, label } = getStepOptions();

      overlay.innerHTML = `
        <div class="pm-box">
          <div class="pm-header">
            <div class="pm-step-bar">
              ${steps.map((_, i) => `<div class="pm-step-dot ${i < currentStep ? 'complete' : i === currentStep ? 'active' : ''}"></div>`).join('')}
            </div>
            <div class="pm-step-label">${meta.label}</div>
            <div class="pm-title">${meta.title}</div>
            <div class="pm-subtitle">${meta.subtitle}</div>
          </div>

          <div class="pm-body">
            <div class="pm-chips" id="pm-chips">
              ${renderChips(opts, arr, cls)}
            </div>
          </div>

          <div class="pm-footer">
            <div>
              <span class="pm-count"><strong>${arr.length}</strong> selected</span>
              ${currentStep === steps.length - 1 ? '' : `<br><button class="pm-skip">Skip this step</button>`}
            </div>
            <div class="pm-nav">
              ${currentStep > 0 ? `<button class="pm-btn pm-btn-ghost" id="pm-back">← Back</button>` : ''}
              ${currentStep < steps.length - 1
                ? `<button class="pm-btn pm-btn-primary" id="pm-next">Next →</button>`
                : `<button class="pm-btn pm-btn-finish" id="pm-finish">🎯 Get My Recommendations</button>`
              }
            </div>
          </div>
        </div>
      `;

      // Wire chips
      overlay.querySelectorAll('.pm-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const lbl = chip.dataset.label;
          const idx = arr.indexOf(lbl);
          if (idx === -1) {
            arr.push(lbl);
            chip.classList.add(cls);
          } else {
            arr.splice(idx, 1);
            chip.classList.remove(cls);
          }
          // Update count
          const countEl = overlay.querySelector('.pm-count strong');
          if (countEl) countEl.textContent = arr.length;
        });
      });

      // Nav buttons
      overlay.querySelector('#pm-back')?.addEventListener('click', () => { currentStep--; renderModal(); });
      overlay.querySelector('#pm-next')?.addEventListener('click', () => { currentStep++; renderModal(); });
      overlay.querySelector('#pm-finish')?.addEventListener('click', finishProfile);
      overlay.querySelector('.pm-skip')?.addEventListener('click', () => { currentStep++; renderModal(); });
    }

    function finishProfile() {
      window.DB.saveProfile(profile);
      overlay.remove();
      window.toast && window.toast('🎯 Your profile is saved! Showing recommendations…', 'success');
      window.location.href = 'index.html#recommendations';
    }

    renderModal();
    document.body.appendChild(overlay);
  }

  // ── Wire up login button ──────────────────────────────────────────────────────
  function initLoginButton() {
    const btn = document.querySelector('.btn-primary');
    if (btn) btn.addEventListener('click', handleLogin);
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    checkAlreadyLoggedIn();
    injectStyles();
    initRoleToggle();
    initLoginButton();
    initEnterKey();
    injectDemoHint();
  });

})();
