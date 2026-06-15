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
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserById, createUser } from '@/lib/firestore';
import { User } from '@/types';

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    pickupAddress?: { street: string; city: string; zip: string; phone: string; }
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await createUser(cred.user.uid, {
        name,
        email,
        allowsFanMail,
        stripeOnboarded: false,
        ...(pickupAddress && { pickupAddress })
      });
      const userData = await getUserById(cred.user.uid);
      setUser(userData);
      return cred;
    } catch (error: any) {
      if (error.code === 'auth/api-key-not-valid') {
        alert("שגיאה: חסר מפתח API חוקי של Firebase. אנא עדכן את קובץ .env.local כפי שמוסבר במדריך.");
      }
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
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
    } catch (error: any) {
      if (error.code === 'auth/api-key-not-valid') {
        alert("שגיאה: חסר מפתח API חוקי של Firebase. אנא עדכן את קובץ .env.local כפי שמוסבר במדריך.");
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
