import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin() {
  if (!getApps().length) {
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.warn('Firebase Admin is not fully configured (missing FIREBASE_PROJECT_ID)');
      return; // Skip initialization during build if missing
    }
    
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newlines in private key securely
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
    }
  }
}

initAdmin();

// We export getters so they evaluate at runtime instead of build time (preventing crashes)
export const getAdminAuth = () => {
  initAdmin();
  return getAuth();
};

export const getAdminDb = () => {
  initAdmin();
  return getFirestore();
};
