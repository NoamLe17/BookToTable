'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserById, createUser } from '@/lib/firestore';
import { User } from '@/types';

/** Returns true when running on a mobile/tablet browser */
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result from Google Sign-In on mobile
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const fbUser = result.user;
          let userData = await getUserById(fbUser.uid);
          if (!userData) {
            await createUser(fbUser.uid, {
              name: fbUser.displayName || 'משתמש גוגל',
              email: fbUser.email || '',
              allowsFanMail: false,
              stripeOnboarded: false,
              avatarUrl: fbUser.photoURL || undefined,
            });
            userData = await getUserById(fbUser.uid);
          }
          setUser(userData);
        }
      })
      .catch((err) => {
        console.error('Google redirect result error:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userData = await getUserById(fbUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userData = await getUserById(cred.user.uid);
    setUser(userData);
    return cred;
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    allowsFanMail: boolean = false,
    pickupAddress?: { street: string; city: string; zip: string; phone: string; },
    paymentMethods?: User['paymentMethods']
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await createUser(cred.user.uid, {
        name,
        email,
        allowsFanMail,
        stripeOnboarded: false,
        emailVerified: false,
        ...(pickupAddress && { pickupAddress }),
        ...(paymentMethods && { paymentMethods })
      });
      const userData = await getUserById(cred.user.uid);
      setUser(userData);
      
      // Trigger OTP generation and email send
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, uid: cred.user.uid })
      });
      
      return cred;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/api-key-not-valid') {
        alert("שגיאה: חסר מפתח API חוקי של Firebase. אנא עדכן את קובץ .env.local כפי שמוסבר במדריך.");
      }
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      if (isMobile()) {
        // On mobile, use redirect flow (popup is blocked by Safari/iOS)
        await signInWithRedirect(auth, provider);
        // The page will redirect to Google — result is handled in the useEffect above
        return;
      }

      // Desktop: use popup
      const cred = await signInWithPopup(auth, provider);
      
      // Check if user exists in our DB, if not, create them
      let userData = await getUserById(cred.user.uid);
      if (!userData) {
        await createUser(cred.user.uid, {
          name: cred.user.displayName || 'משתמש גוגל',
          email: cred.user.email || '',
          allowsFanMail: false,
          stripeOnboarded: false,
          avatarUrl: cred.user.photoURL || undefined,
        });
        userData = await getUserById(cred.user.uid);
      }
      setUser(userData);
      return cred;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/api-key-not-valid') {
        alert("שגיאה: חסר מפתח API חוקי של Firebase. אנא עדכן את קובץ .env.local כפי שמוסבר במדריך.");
      }
      // Ignore popup-closed-by-user errors silently
      if (firebaseError.code === 'auth/popup-closed-by-user' || firebaseError.code === 'auth/cancelled-popup-request') {
        return;
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (firebaseUser) {
      const userData = await getUserById(firebaseUser.uid);
      setUser(userData);
    }
  }, [firebaseUser]);

  return {
    firebaseUser,
    user,
    loading,
    isAuthenticated: !!firebaseUser,
    login,
    register,
    logout,
    refreshUser,
    loginWithGoogle,
  };
}
