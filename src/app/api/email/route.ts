import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Hardcoded for MVP based on user's input
const resend = new Resend('re_DTeFKd2R_ByHXKUvq9EBb5mk1sEU52xWo');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { readerDetails, items, orderIds, totalPaid } = body;

    if (!readerDetails || !readerDetails.email) {
      return NextResponse.json({ error: 'Missing email address' }, { status: 400 });
    }

    // Build items list HTML
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.book.title} (x${item.quantity})</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">מאת: ${item.book.authorName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₪${(item.book.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">תודה רבה על הקנייה!</h1>
          <p style="margin-top: 10px; opacity: 0.9;">BookToTable - תומכים בסופרים ישראלים</p>
        </div>
        
        <div style="padding: 30px;">
          <p>שלום ${readerDetails.name},</p>
          <p>ההזמנה שלך התקבלה בהצלחה ומועברת ברגעים אלו ממש לסופרים לאריזה ומשלוח.</p>
          
          <h3 style="margin-top: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">מספרי הזמנה למעקב:</h3>
          <p style="font-weight: bold; letter-spacing: 1px;">
            ${orderIds.map((id: string) => id.substring(0, 8).toUpperCase()).join(', ')}
          </p>

          <h3 style="margin-top: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">סיכום הזמנה:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p style="font-size: 18px;"><strong>סך הכל שולם (כולל דמי משלוח לכל סופר): ₪${totalPaid.toFixed(2)}</strong></p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 30px;">
            <h4 style="margin-top: 0;">פרטי משלוח:</h4>
            <p style="margin: 0;">${readerDetails.address}, ${readerDetails.city} ${readerDetails.zip}</p>
            <p style="margin: 5px 0 0 0;">טלפון: ${readerDetails.phone}</p>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">נשמח לראותך שוב בקרוב!</p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">BookToTable</p>
        </div>
      </div>
    `;

    // Note: Free Resend accounts can only send to verified emails or you must use a verified domain.
    // Assuming the user will configure Resend correctly, we use a default from email for Resend testing.
    // Typically, Resend defaults to sending from "onboarding@resend.dev" on free tier to the registered email.
    
    const { data, error } = await resend.emails.send({
      from: 'BookToTable <onboarding@resend.dev>', // Free tier restricted
      to: [readerDetails.email],
      subject: 'אישור הזמנה - BookToTable 🎉',
      html: htmlContent,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
