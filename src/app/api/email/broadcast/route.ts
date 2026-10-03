import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'noamhemo2001@gmail.com';

export async function POST(request: Request) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    // ✅ Secure: Verify Firebase ID Token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.replace('Bearer ', '');

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if (decodedToken.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { subject, message, targetUserIds } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Missing subject or message' }, { status: 400 });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'BookToTable <onboarding@resend.dev>';

    // Fetch target emails from Firestore Admin SDK
    const emails: { id: string; email: string; name: string }[] = [];

    if (targetUserIds && targetUserIds.length > 0) {
      // Send to specific users
      for (const uid of targetUserIds) {
        const docSnap = await adminDb.collection('users').doc(uid).get();
        if (docSnap.exists) {
          const data = docSnap.data()!;
          if (data.email) emails.push({ id: uid, email: data.email, name: data.name || data.email });
        }
      }
    } else {
      // Send to ALL users
      const snap = await adminDb.collection('users').get();
      snap.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        if (data.email) emails.push({ id: doc.id, email: data.email, name: data.name || data.email });
      });
    }

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
    }

    // Build HTML template
    const htmlTemplate = (name: string) => `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #16a34a, #047857); color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">📚 סיפור קרוב</h1>
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">הודעה מצוות BookToTable</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; margin-bottom: 8px;">שלום ${name},</p>
          <div style="font-size: 15px; line-height: 1.7; white-space: pre-wrap; color: #374151;">
${message}
          </div>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 13px;">
            בברכה, צוות <strong>סיפור קרוב</strong> | 
            <a href="https://www.booktotable.com" style="color: #16a34a;">booktotable.com</a>
          </p>
        </div>
      </div>
    `;

    // Send emails (batch with rate limiting)
    const results: { email: string; success: boolean; error?: string }[] = [];
    
    for (const recipient of emails) {
      try {
        const { error } = await resend.emails.send({
          from: fromEmail,
          to: [recipient.email],
          subject,
          html: htmlTemplate(recipient.name),
        });
        if (error) {
          console.error(`[Broadcast] Failed to send to ${recipient.email}:`, error);
        }
        results.push({ email: recipient.email, success: !error, error: error?.message });
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 300));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[Broadcast] Exception sending to ${recipient.email}:`, message);
        results.push({ email: recipient.email, success: false, error: message });
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const failureReasons = results
      .filter(r => !r.success)
      .map(r => `${r.email}: ${r.error || 'Unknown error'}`);

    if (failureReasons.length > 0) {
      console.error('[Broadcast] Failures:', failureReasons);
    }

    return NextResponse.json({
      success: true,
      total: emails.length,
      succeeded,
      failed,
      results,
      failureReasons,
    });
  } catch (err: unknown) {
    console.error('Broadcast Email Error:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}
