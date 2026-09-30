import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name, uid } = await request.json();

    if (!email || !uid) {
      return NextResponse.json({ error: 'חסרים נתונים' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Save to Firestore
    await adminDb.collection('otps').doc(uid).set({
      code: otp,
      expiresAt: expiresAt.toISOString(),
      email
    });

    // Send Email
    const { error } = await resend.emails.send({
      from: 'BookToTable <hello@booktotable.com>',
      to: [email],
      subject: 'קוד האימות שלך ל-BookToTable',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #166534;">ברוכים הבאים ל-BookToTable, ${name || 'סופר יקר'}!</h2>
          <p style="font-size: 16px; color: #333;">כדי להשלים את ההרשמה ולהתחיל למכור את הספרים שלך, אנא הזן את קוד האימות הבא:</p>
          
          <div style="background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #15803d;">${otp}</span>
          </div>
          
          <p style="font-size: 14px; color: #666;">הקוד בתוקף ל-15 דקות. אם לא ביקשת קוד זה, אנא התעלם מהודעה זו.</p>
          
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">צוות BookToTable</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending OTP email:', error);
      return NextResponse.json({ error: 'שגיאה בשליחת המייל' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 });
  }
}
