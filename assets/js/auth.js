/**
 * auth.js — Session management and route guards
 * Rede D'Or Portal de Atendimento
 */

'use strict';

const SESSION_KEY = 'sdr_session';
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours

/** Returns the active session object or null if expired/missing */
function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** Creates and stores a session from a user object */
function createSession(user) {
  const session = {
    userId:    user.id,
    role:      user.role,
    sector:    user.sector || null,
    name:      user.name,
    initials:  user.initials || user.name.slice(0, 2).toUpperCase(),
    email:     user.email,
    department:user.department,
    expiresAt: Date.now() + SESSION_TTL,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/** Clears session and redirects to login */
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

/**
 * Enforces authentication. Call at the top of protected pages.
 * @param {'user'|'analyst'|'admin'|null} requiredRole - null = any authenticated role
 * @returns {object} session — redirects away if invalid
 */
function guardAuth(requiredRole = null) {
  const session = getSession();

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  // Users trying to access analyst/admin pages → redirect to portal
  if (requiredRole === 'staff' && session.role === 'user') {
    window.location.href = 'portal.html';
    return null;
  }

  // Non-users (analysts/admin) trying to access user portal → redirect to panel
  if (requiredRole === 'user' && session.role !== 'user') {
    window.location.href = 'painel.html';
    return null;
  }

  return session;
}

/** Redirects already-logged-in users away from login/cadastro pages */
function redirectIfLoggedIn() {
  const session = getSession();
  if (!session) return;
  window.location.href = session.role === 'user' ? 'portal.html' : 'painel.html';
}
