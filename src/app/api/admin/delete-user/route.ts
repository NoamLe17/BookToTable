import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

const ADMIN_EMAIL = 'noamhemo2001@gmail.com';

export async function POST(request: Request) {
  try {
    const { uid, idToken } = await request.json();

    if (!uid || !idToken) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    // Verify the caller's Firebase ID token server-side
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    if (decodedToken.email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Only super admin can delete users.' }, { status: 403 });
    }

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(uid);

    // Delete user's public profile from Firestore
    await adminDb.collection('users').doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in delete-user route:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
