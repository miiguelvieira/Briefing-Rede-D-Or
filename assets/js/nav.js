/**
 * nav.js — Navigation rendering and user profile dropdown
 * Rede D'Or Portal de Atendimento
 *
 * Depends on: auth.js, utils.js
 * Usage: call initNav(currentPage) after DOM ready
 */

'use strict';

/**
 * Initialises the main navigation.
 * @param {string} currentPage — 'home' | 'portal' | 'painel' | 'login' | 'cadastro' | 'briefing'
 */
function initNav(currentPage) {
  const el = document.getElementById('mainNav');
  if (!el) return;

  const session = getSession();

  el.innerHTML = `
    <a href="index.html" class="nav-brand">
      Rede D'Or <span class="nav-dot">·</span> Briefings
    </a>

    <a href="index.html" class="nav-link ${currentPage === 'home' ? 'active' : ''}">Home</a>

    ${session ? _buildLoggedInLinks(session, currentPage) : _buildGuestLinks(currentPage)}
  `;

  if (session) _attachProfileEvents(session);
}

/* ── PRIVATE: Build logged-in nav links ─────────────────────────────────── */
function _buildLoggedInLinks(session, currentPage) {
  const trackHref  = session.role === 'user' ? 'portal.html' : 'painel.html';
  const trackLabel = session.role === 'user' ? 'Meus Chamados' : 'Painel';
  const trackActive = (currentPage === 'portal' || currentPage === 'painel') ? 'active' : '';

  const avatarClass = session.role === 'admin' ? 'admin-avatar' : '';

  return `
    <a href="${trackHref}" class="nav-link ${trackActive}">${trackLabel}</a>
    <div class="nav-spacer"></div>
    <div class="nav-profile" id="navProfile">
      <button class="nav-profile-btn" id="navProfileBtn" aria-label="Menu do usuário">
        <div class="nav-avatar ${avatarClass}" id="navAvatar">${session.initials}</div>
        <span class="nav-username" id="navUsername">${session.name.split(' ')[0]}</span>
        <svg class="nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      ${_buildProfileDropdown(session)}
    </div>
  `;
}

/* ── PRIVATE: Build guest nav links ─────────────────────────────────────── */
function _buildGuestLinks(currentPage) {
  return `
    <div class="nav-spacer"></div>
    <a href="login.html"    class="nav-link ${currentPage === 'login'    ? 'active' : ''}">Login</a>
    <a href="cadastro.html" class="nav-btn-primary">Cadastro</a>
  `;
}

/* ── PRIVATE: Build profile dropdown HTML ───────────────────────────────── */
function _buildProfileDropdown(session) {
  const roleLabel = { admin: '👑 Administrador', analyst: '🔍 Analista', user: '👤 Usuário' }[session.role] || session.role;
  const roleCssClass = session.role;

  const sectorLine = session.sector && SECTOR_META[session.sector]
    ? `<div class="profile-info-row">
         <span class="profile-info-label">Setor</span>
         <span class="profile-info-value">${SECTOR_META[session.sector].label}</span>
       </div>`
    : '';

  const trackHref  = session.role === 'user' ? 'portal.html' : 'painel.html';
  const trackLabel = session.role === 'user' ? 'Meus Chamados' : 'Painel de Controle';

  const avatarColorClass = session.role === 'admin' ? 'admin'
    : (session.sector ? session.sector.toLowerCase() : '');

  return `
    <div class="profile-dropdown" id="profileDropdown">
      <div class="profile-header">
        <div class="profile-avatar-lg ${avatarColorClass}">${session.initials}</div>
        <div class="profile-name">${session.name}</div>
        <span class="profile-role-badge ${roleCssClass}">${roleLabel}</span>
      </div>

      <div class="profile-info">
        <div class="profile-info-row">
          <span class="profile-info-label">E-mail</span>
          <span class="profile-info-value">${session.email || '—'}</span>
        </div>
        <div class="profile-info-row">
          <span class="profile-info-label">Setor</span>
          <span class="profile-info-value">${session.department || '—'}</span>
        </div>
        ${sectorLine}
      </div>

      <div class="profile-actions">
        <a href="${trackHref}" class="profile-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          ${trackLabel}
        </a>
        <button class="profile-action-btn danger" id="navLogoutBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sair da conta
        </button>
      </div>
    </div>
  `;
}

/* ── PRIVATE: Attach dropdown toggle events ─────────────────────────────── */
function _attachProfileEvents(session) {
  const btn      = document.getElementById('navProfileBtn');
  const dropdown = document.getElementById('profileDropdown');
  const logoutBtn= document.getElementById('navLogoutBtn');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    dropdown.classList.toggle('open', !isOpen);
    btn.classList.toggle('open', !isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!document.getElementById('navProfile')?.contains(e.target)) {
      dropdown.classList.remove('open');
      btn.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      btn.classList.remove('open');
    }
  });

  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}
