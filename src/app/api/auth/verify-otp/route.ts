import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { uid, code } = await request.json();

    if (!uid || !code) {
      return NextResponse.json({ error: 'חסרים נתונים' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();

    const otpDocRef = adminDb.collection('otps').doc(uid);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      return NextResponse.json({ error: 'לא נמצא קוד אימות בתוקף או שהקוד פג' }, { status: 400 });
    }

    const otpData = otpDoc.data();
    
    // Check if expired
    const expiresAt = new Date(otpData?.expiresAt);
    if (expiresAt < new Date()) {
      await otpDocRef.delete();
      return NextResponse.json({ error: 'הקוד פג תוקף, אנא בקש קוד חדש' }, { status: 400 });
    }

    // Verify code
    if (otpData?.code !== code) {
      return NextResponse.json({ error: 'הקוד שהוזן שגוי' }, { status: 400 });
    }

    // Success! Update user's emailVerified status in Firebase Auth
    await adminAuth.updateUser(uid, {
      emailVerified: true,
    });

    // Also update in our users collection just in case we need it
    await adminDb.collection('users').doc(uid).update({
      emailVerified: true,
      updatedAt: new Date().toISOString()
    });

    // Delete the OTP doc so it can't be reused
    await otpDocRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 });
  }
}
