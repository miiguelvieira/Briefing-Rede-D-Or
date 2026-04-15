/**
 * firebase-config.js — Firebase initialization
 * Rede D'Or Portal de Atendimento
 * Loaded before all other scripts via CDN (firebase-app-compat + auth + firestore).
 */

'use strict';

const firebaseConfig = {
  apiKey:            "AIzaSyAkSAwjZVW-OQ8kwz56lddeST4glHI73w4",
  authDomain:        "marketing-rede-d-or.firebaseapp.com",
  projectId:         "marketing-rede-d-or",
  storageBucket:     "marketing-rede-d-or.firebasestorage.app",
  messagingSenderId: "281001077046",
  appId:             "1:281001077046:web:214777031a0777af99eb97",
  measurementId:     "G-WH59H08RHD",
};

firebase.initializeApp(firebaseConfig);

/** Firestore instance — shared across all modules */
const db      = firebase.firestore();
/** Auth instance — shared across all modules */
const auth    = firebase.auth();
/** Storage instance — shared across all modules */
const storage = firebase.storage();

