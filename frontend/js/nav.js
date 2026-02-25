/**
 * nav.js — SmartSociety Shared Navbar Logic
 * Handles: session-aware nav links, scroll shadow, mobile menu.
 * Included on every page AFTER data.js.
 */

(function () {
  'use strict';

  // ── Scroll shadow ────────────────────────────────────────────────────────────
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.boxShadow = window.scrollY > 10
        ? '0 4px 30px rgba(0,0,0,0.5)'
        : '0 4px 20px rgba(0,0,0,0.3)';
    }, { passive: true });
  }

  // ── Session-aware Login/Logout button ────────────────────────────────────────
  function updateNavAuth() {
    const session = window.DB ? window.DB.getSession() : null;
    const loginLink = document.querySelector('.nav-links a[href="login.html"]');
    if (!loginLink) return;

    if (session && session.loggedIn) {
      // Show logout + user name
      loginLink.textContent = `👤 ${session.name.split(' ')[0]}`;
      loginLink.href = '#';
      loginLink.title = 'Click to logout';
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
          window.DB.logout();
          window.location.href = 'login.html';
        }
      });

      // If admin, add dashboard shortcut
      if (session.role === 'admin') {
        const links = document.querySelector('.nav-links');
        const existing = links.querySelector('a[href="admin.html"]');
        if (!existing) {
          const adminLink = document.createElement('a');
          adminLink.href = 'admin.html';
          adminLink.textContent = '🛠 Dashboard';
          adminLink.style.cssText = 'color: var(--accent3) !important;';
          links.insertBefore(adminLink, loginLink);
        }
      }
    }
  }

  // ── Mobile nav toggle ────────────────────────────────────────────────────────
  function initMobileNav() {
    const navEl = document.querySelector('nav');
    if (!navEl) return;

    // Inject hamburger button
    const burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.setAttribute('aria-label', 'Toggle menu');
    burger.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;

    // Only show on mobile
    const style = document.createElement('style');
    style.textContent = `
      .nav-burger {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        z-index: 200;
      }
      .nav-burger span {
        display: block;
        width: 22px;
        height: 2px;
        background: white;
        border-radius: 2px;
        transition: all 0.3s ease;
      }
      .nav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      .nav-burger.open span:nth-child(2) { opacity: 0; }
      .nav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

      @media (max-width: 768px) {
        .nav-burger { display: flex; }
        .nav-links {
          position: fixed;
          top: 70px;
          left: 0; right: 0;
          background: rgba(6,9,16,0.97);
          backdrop-filter: blur(20px);
          flex-direction: column;
          padding: 24px 7%;
          gap: 4px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transform: translateY(-10px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.25s ease;
          z-index: 99;
        }
        .nav-links.open {
          display: flex;
          transform: translateY(0);
          opacity: 1;
          pointer-events: all;
        }
        .nav-links a {
          padding: 12px 0 !important;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 15px !important;
        }
      }
    `;
    document.head.appendChild(style);

    const links = document.querySelector('.nav-links');
    if (links) {
      navEl.appendChild(burger);
      burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        links.classList.toggle('open');
      });

      // Close on link click
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          burger.classList.remove('open');
          links.classList.remove('open');
        });
      });
    }
  }

  // ── Toast notification system ────────────────────────────────────────────────
  window.toast = function (message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed; bottom: 28px; right: 28px;
        display: flex; flex-direction: column; gap: 10px;
        z-index: 9999;
      `;
      document.body.appendChild(container);
    }

    const colors = {
      success: '#00d4ff',
      error:   '#f87171',
      info:    '#a78bfa',
      warning: '#fbbf24',
    };

    const t = document.createElement('div');
    t.style.cssText = `
      background: #111827;
      border: 1px solid ${colors[type] || colors.success}33;
      border-left: 3px solid ${colors[type] || colors.success};
      color: #f1f5f9;
      padding: 14px 20px;
      border-radius: 12px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      animation: slideInToast 0.3s ease;
      cursor: pointer;
    `;
    t.textContent = message;

    const style = document.getElementById('toast-style');
    if (!style) {
      const s = document.createElement('style');
      s.id = 'toast-style';
      s.textContent = `
        @keyframes slideInToast {
          from { opacity:0; transform: translateX(20px); }
          to   { opacity:1; transform: translateX(0); }
        }
        @keyframes fadeOutToast {
          from { opacity:1; transform: translateX(0); }
          to   { opacity:0; transform: translateX(20px); }
        }
      `;
      document.head.appendChild(s);
    }

    container.appendChild(t);
    t.addEventListener('click', () => dismiss(t));

    const timer = setTimeout(() => dismiss(t), 3500);

    function dismiss(el) {
      clearTimeout(timer);
      el.style.animation = 'fadeOutToast 0.3s ease forwards';
      setTimeout(() => el.remove(), 300);
    }
  };

  // ── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    updateNavAuth();
    initMobileNav();
  });

})();
