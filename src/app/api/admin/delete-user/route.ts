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

    if (typeof uid !== 'string' || uid.trim() === '') {
      return NextResponse.json({ success: false, error: 'Invalid UID format' }, { status: 400 });
    }

    const cleanUid = uid.trim();

    // Delete user from Firebase Auth
    try {
      await adminAuth.deleteUser(cleanUid);
    } catch (authErr: any) {
      // If user is already deleted from auth, we still want to delete from Firestore
      if (authErr.code !== 'auth/user-not-found') {
        console.error('Firebase Auth delete error:', authErr);
        throw authErr;
      }
    }

    // Delete user's public profile from Firestore
    try {
      await adminDb.collection('users').doc(cleanUid).delete();
    } catch (dbErr: any) {
      console.error('Firestore delete error for UID:', cleanUid, dbErr);
      throw dbErr;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in delete-user route:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
