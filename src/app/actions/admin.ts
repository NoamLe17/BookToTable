'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function deleteUserAction(uid: string, adminEmail: string) {
  try {
    // 1. Verify caller is the admin
    if (adminEmail !== 'noamhemo2001@gmail.com') {
      return { success: false, error: 'Unauthorized. Only super admin can delete users.' };
    }

    // 2. Delete user from Firebase Auth
    await adminAuth.deleteUser(uid);

    // 3. Delete user's public profile from Firestore
    await adminDb.collection('users').doc(uid).delete();

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message || 'Failed to delete user' };
  }
}
