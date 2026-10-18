/**
 * POST /api/admin/sync-users
 *
 * Checks all Firestore user documents against Firebase Auth.
 * Finds orphaned users (exist in Firestore but deleted from Firebase Auth)
 * and optionally removes them from Firestore.
 *
 * Body: { idToken: string, action: 'check' | 'cleanup' }
 * - 'check'   → returns list of orphaned users without deleting
 * - 'cleanup' → deletes orphaned users from Firestore
 *
 * Uses dynamic imports for firebase-admin to avoid Turbopack ESM bundling issues.
 */

import { NextResponse } from 'next/server';

const ADMIN_EMAIL = 'noamhemo2001@gmail.com';

export async function POST(request: Request) {
  try {
    const { idToken, action = 'check' } = await request.json();

    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Missing idToken' }, { status: 400 });
    }

    // Dynamic imports — prevents Turbopack from bundling firebase-admin
    const { getAdminAuth, getAdminDb } = await import('@/lib/firebase-admin');
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Verify caller is admin
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    if (decodedToken.email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all user documents from Firestore
    const usersSnap = await adminDb.collection('users').get();
    const firestoreUsers = usersSnap.docs.map(doc => {
      const data = doc.data() as { name?: string; displayName?: string; email?: string };
      return { id: doc.id, name: data.name ?? data.displayName, email: data.email };
    });

    // Check Firestore users against Firebase Auth in batches of 100 (API limit)
    const orphanedUsers: { id: string; name?: string; email?: string }[] = [];
    const BATCH_SIZE = 100;

    for (let i = 0; i < firestoreUsers.length; i += BATCH_SIZE) {
      const batch = firestoreUsers.slice(i, i + BATCH_SIZE);
      const result = await adminAuth.getUsers(batch.map(u => ({ uid: u.id })));
      const notFound = new Set(
        result.notFound.map(identifier => (identifier as { uid: string }).uid)
      );
      for (const user of batch) {
        if (notFound.has(user.id)) orphanedUsers.push(user);
      }
    }

    if (action === 'cleanup' && orphanedUsers.length > 0) {
      // Delete orphaned users from Firestore
      const batch = adminDb.batch();
      for (const user of orphanedUsers) {
        batch.delete(adminDb.collection('users').doc(user.id));
      }
      await batch.commit();

      return NextResponse.json({
        success: true,
        action: 'cleanup',
        cleaned: orphanedUsers.length,
        users: orphanedUsers,
        message: `נמחקו ${orphanedUsers.length} משתמשים יתומים מ-Firestore`,
      });
    }

    return NextResponse.json({
      success: true,
      action: 'check',
      total: firestoreUsers.length,
      orphaned: orphanedUsers.length,
      users: orphanedUsers,
    });

  } catch (error: unknown) {
    console.error('[sync-users] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
