'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';

const ADMIN_EMAIL = 'noamhemo2001@gmail.com';

export async function deleteUserAction(uid: string, idToken: string) {
  try {
    // ✅ Verify the caller's Firebase ID token server-side
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return { success: false, error: 'Invalid or expired token' };
    }

    if (decodedToken.email !== ADMIN_EMAIL) {
      return { success: false, error: 'Unauthorized. Only super admin can delete users.' };
    }

    // 2. Delete user from Firebase Auth
    await adminAuth.deleteUser(uid);

    // 3. Delete user's public profile from Firestore
    await adminDb.collection('users').doc(uid).delete();

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
