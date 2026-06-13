import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_DTeFKd2R_ByHXKUvq9EBb5mk1sEU52xWo');

export async function POST(request: Request) {
  try {
    const { email, name, orderId, trackingNumber, bookTitle } = await request.json();

    if (!email || !orderId || !trackingNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-w-xl; margin: 0 auto;">
        <div style="text-align: center; padding: 24px; background-color: #2563eb; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">הספר שלך יצא לדרך! 🚚</h1>
        </div>
        
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">שלום ${name || 'קורא/ת יקר/ה'},</p>
          <p style="font-size: 16px;">אנו שמחים לעדכן אותך שהסופר ארז את ההזמנה שלך (<strong>${bookTitle || `הזמנה מס' ${orderId}`}</strong>) ומסר אותה לחברת המשלוחים.</p>
          
          <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">מספר מעקב</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: bold; color: #0f172a; letter-spacing: 2px;">${trackingNumber}</p>
          </div>

          <div style="margin-top: 32px; text-align: center;">
            <a href="https://booktotable.co.il/track-order" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">מעקב אחרי ההזמנה באתר</a>
          </div>

          <p style="margin-top: 32px; font-size: 14px; color: #6b7280; text-align: center;">תודה שתמכת בספרות מקורית עצמאית!</p>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: 'BookToTable Updates <onboarding@resend.dev>',
      to: [email],
      subject: 'עדכון משלוח: הספר שלך יצא לדרך!',
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error sending tracking email:', error);
    return NextResponse.json({ error: 'Failed to send tracking email' }, { status: 500 });
  }
}
