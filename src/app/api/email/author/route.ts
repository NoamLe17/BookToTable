import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// We use the same API key as before
const resend = new Resend(process.env.RESEND_API_KEY || 're_DTeFKd2R_ByHXKUvq9EBb5mk1sEU52xWo');

export async function POST(request: Request) {
  try {
    const { authorId, readerDetails, items, orderIds } = await request.json();

    if (!authorId || !readerDetails || !items || !orderIds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderDate = new Date().toLocaleString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      dateStyle: 'short',
      timeStyle: 'short'
    });

    const itemsHtml = items.map((item: any, idx: number) => `
      <div style="margin-bottom: 12px; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111827;">${item.book.title}</p>
        <p style="margin: 4px 0 0 0; color: #4b5563;">כמות: ${item.quantity} | מס' הזמנה: ${orderIds[idx]}</p>
      </div>
    `).join('');

    const buyerNoteHtml = readerDetails.buyerNote ? `
      <div style="margin-top: 24px; padding: 16px; background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 16px;">💬 הערה מהלקוח (חשוב!):</h3>
        <p style="margin: 0; color: #15803d; font-size: 15px; font-weight: 500;">"${readerDetails.buyerNote}"</p>
      </div>
    ` : '';

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-w-xl; margin: 0 auto;">
        <div style="text-align: center; padding: 24px; background-color: #16a34a; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">הזמנה חדשה התקבלה! 🎉</h1>
        </div>
        
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">שלום רב,</p>
          <p style="font-size: 16px;">התקבלה הרגע הזמנה חדשה לספרים שלך דרך BookToTable!</p>
          
          <div style="margin: 24px 0;">
            <h2 style="font-size: 18px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">פרטי ההזמנה</h2>
            <p style="margin: 8px 0;"><strong>תאריך:</strong> ${orderDate}</p>
            <div style="margin-top: 16px;">
              ${itemsHtml}
            </div>
          </div>

          <div style="margin: 24px 0;">
            <h2 style="font-size: 18px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">פרטי משלוח ויצירת קשר</h2>
            <p style="margin: 8px 0;"><strong>שם הלקוח:</strong> ${readerDetails.name}</p>
            <p style="margin: 8px 0;"><strong>כתובת מלאה למשלוח:</strong> ${readerDetails.address}, ${readerDetails.city}, ${readerDetails.zip}</p>
            <p style="margin: 8px 0;"><strong>טלפון:</strong> ${readerDetails.phone}</p>
            <p style="margin: 8px 0;"><strong>אימייל:</strong> ${readerDetails.email}</p>
          </div>

          ${buyerNoteHtml}

          <div style="margin-top: 32px; padding: 16px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">אנא ארוז את הספרים בהקדם והיכנס ללוח הבקרה שלך באתר כדי להזין מספר מעקב למשלוח.</p>
            <p style="margin: 8px 0 0 0; font-weight: bold;"><a href="https://booktotable.co.il/dashboard" style="color: #16a34a; text-decoration: none;">כניסה ללוח הבקרה</a></p>
          </div>
        </div>
      </div>
    `;

    // Resend free tier allows sending to verified domain emails only, so we mock it to user email
    const data = await resend.emails.send({
      from: 'BookToTable Orders <onboarding@resend.dev>',
      to: [readerDetails.email], // In production: Author's email.
      subject: `הזמנה חדשה התקבלה! - ${readerDetails.name}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error sending author notification email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
