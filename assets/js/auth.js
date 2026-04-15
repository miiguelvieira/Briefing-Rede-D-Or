/**
 * auth.js — Firebase Auth session management and route guards
 * Rede D'Or Portal de Atendimento
 */

'use strict';

/**
 * Resolves with the session object once Firebase reports the auth state.
 * Pages should await this rather than polling.
 *
 * IMPORTANT: We wait for window._seedPromise before registering
 * onAuthStateChanged. This prevents a stale Firebase session (left by a
 * partial seed run) from resolving _authReady with the wrong user, which
 * would cause redirectIfLoggedIn() to auto-redirect on login/recovery pages.
 */
let _authReadyResolve;
window._authReady = new Promise(resolve => { _authReadyResolve = resolve; });

(async function initAuth() {
  // If seed.js is loaded on this page, wait for it to finish and sign out
  // before we start listening — so the first auth event is always clean.
  if (window._seedPromise) await window._seedPromise;

  auth.onAuthStateChanged(async firebaseUser => {
    if (firebaseUser) {
      try {
        const doc = await db.collection('users').doc(firebaseUser.uid).get();
        if (doc.exists) {
          window.currentSession = {
            uid:        firebaseUser.uid,
            userId:     doc.data().numericId,
            role:       doc.data().role,
            sector:     doc.data().sector || null,
            name:       doc.data().name,
            email:      doc.data().email,
            department: doc.data().department,
            initials:   doc.data().initials || doc.data().name.slice(0, 2).toUpperCase(),
            active:     doc.data().active !== false,
          };
        } else {
          // Authenticated with Firebase but no Firestore profile — sign out
          window.currentSession = null;
          await auth.signOut();
        }
      } catch {
        window.currentSession = null;
      }
    } else {
      window.currentSession = null;
    }

    // Resolve only once (subsequent auth state changes update currentSession
    // but don't re-resolve the promise)
    if (_authReadyResolve) {
      _authReadyResolve(window.currentSession);
      _authReadyResolve = null;
    }
  });
})();

/** Returns the cached session (sync — only valid AFTER _authReady resolves) */
function getSession() {
  return window.currentSession || null;
}

/** Signs the current user out and redirects to login */
async function logout() {
  await auth.signOut();
  window.currentSession = null;
  window.location.href = 'login.html';
}

/**
 * Async route guard. Awaits Firebase auth state, then redirects if the
 * session doesn't satisfy the required role. Returns the session or null.
 *
 * @param {'user'|'staff'|null} requiredRole
 */
async function guardAuth(requiredRole = null) {
  const session = await window._authReady;

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  if (!session.active) {
    await auth.signOut();
    window.location.href = 'login.html';
    return null;
  }

  // Regular users cannot access staff pages
  if (requiredRole === 'staff' && session.role === 'user') {
    window.location.href = 'portal.html';
    return null;
  }

  // Staff cannot access user portal
  if (requiredRole === 'user' && session.role !== 'user') {
    window.location.href = 'painel.html';
    return null;
  }

  return session;
}

/**
 * Redirects already logged-in users away from login/cadastro pages.
 * Returns a Promise — must be awaited.
 */
async function redirectIfLoggedIn() {
  const session = await window._authReady;
  if (!session) return;
  window.location.href = session.role === 'user' ? 'portal.html' : 'painel.html';
}
