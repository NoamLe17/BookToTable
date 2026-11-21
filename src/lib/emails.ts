import { Resend } from 'resend';

/**
 * Server-only email helpers.
 *
 * These used to be public API routes (/api/email, /api/email/author) that anyone
 * on the internet could call to send arbitrary emails through our Resend account.
 * They are now plain server functions, called directly from trusted server code
 * (e.g. the checkout route), so there is no public endpoint to abuse.
 */

const resend = new Resend(process.env.RESEND_API_KEY);

/** Escape user-provided text before inserting it into email HTML (prevents HTML injection / phishing links). */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type ReaderDetails = {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  zip?: string;
  phone?: string;
  buyerNote?: string;
};

export type BuyerEmailItem = {
  book: { title: string; authorName?: string; price: number };
  quantity: number;
};

export type AuthorEmailItem = {
  book: { title: string };
  quantity: number;
};

// ── Buyer confirmation ────────────────────────────────────────────────────
export async function sendBuyerConfirmationEmail(params: {
  readerDetails: ReaderDetails;
  items: BuyerEmailItem[];
  orderIds: string[];
  totalPaid: number;
}) {
  const { readerDetails, items, orderIds, totalPaid } = params;
  if (!readerDetails?.email) throw new Error('Missing email address');

  const itemsHtml = items.map((item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(item.book.title)} (x${Number(item.quantity) || 0})</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">מאת: ${escapeHtml(item.book.authorName)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₪${((Number(item.book.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)}</td>
      </tr>
    `).join('');

  const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">תודה רבה על הקנייה!</h1>
          <p style="margin-top: 10px; opacity: 0.9;">BookToTable - תומכים בסופרים ישראלים</p>
        </div>
        
        <div style="padding: 30px;">
          <p>שלום ${escapeHtml(readerDetails.name)},</p>
          <p>ההזמנה שלך התקבלה בהצלחה ומועברת ברגעים אלו ממש לסופרים לאריזה ומשלוח.</p>
          
          <h3 style="margin-top: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">מספרי הזמנה למעקב:</h3>
          <p style="font-weight: bold; letter-spacing: 1px;">
            ${orderIds.map((id) => escapeHtml(id.substring(0, 8).toUpperCase())).join(', ')}
          </p>

          <h3 style="margin-top: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">סיכום הזמנה:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p style="font-size: 18px;"><strong>סך הכל שולם (כולל דמי משלוח לכל סופר): ₪${(Number(totalPaid) || 0).toFixed(2)}</strong></p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 30px;">
            <h4 style="margin-top: 0;">פרטי משלוח:</h4>
            <p style="margin: 0;">${escapeHtml(readerDetails.address)}, ${escapeHtml(readerDetails.city)} ${escapeHtml(readerDetails.zip)}</p>
            <p style="margin: 5px 0 0 0;">טלפון: ${escapeHtml(readerDetails.phone)}</p>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">נשמח לראותך שוב בקרוב!</p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">BookToTable</p>
        </div>
      </div>
    `;

  // IMPORTANT: To send to any email address, you must verify your domain in Resend dashboard.
  // For production, set RESEND_FROM_EMAIL in env vars to: "BookToTable <noreply@booktotable.com>"
  // For testing on free tier, Resend only sends to your registered email.
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'BookToTable <onboarding@resend.dev>';

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [readerDetails.email],
    subject: 'אישור הזמנה - BookToTable 🎉',
    html: htmlContent,
  });
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data;
}

// ── Author notification ───────────────────────────────────────────────────
export async function sendAuthorOrderEmail(params: {
  authorId: string;
  readerDetails: ReaderDetails;
  items: AuthorEmailItem[];
  orderIds: string[];
}) {
  const { readerDetails, items, orderIds } = params;

  const orderDate = new Date().toLocaleString('he-IL', {
    timeZone: 'Asia/Jerusalem',
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const itemsHtml = items.map((item, idx) => `
      <div style="margin-bottom: 12px; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111827;">${escapeHtml(item.book.title)}</p>
        <p style="margin: 4px 0 0 0; color: #4b5563;">כמות: ${Number(item.quantity) || 0} | מס' הזמנה: ${escapeHtml(orderIds[idx])}</p>
      </div>
    `).join('');

  const buyerNoteHtml = readerDetails.buyerNote ? `
      <div style="margin-top: 24px; padding: 16px; background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 16px;">💬 הערה מהלקוח (חשוב!):</h3>
        <p style="margin: 0; color: #15803d; font-size: 15px; font-weight: 500;">"${escapeHtml(readerDetails.buyerNote)}"</p>
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
            <p style="margin: 8px 0;"><strong>שם הלקוח:</strong> ${escapeHtml(readerDetails.name)}</p>
            <p style="margin: 8px 0;"><strong>כתובת מלאה למשלוח:</strong> ${escapeHtml(readerDetails.address)}, ${escapeHtml(readerDetails.city)}, ${escapeHtml(readerDetails.zip)}</p>
            <p style="margin: 8px 0;"><strong>טלפון:</strong> ${escapeHtml(readerDetails.phone)}</p>
            <p style="margin: 8px 0;"><strong>אימייל:</strong> ${escapeHtml(readerDetails.email)}</p>
          </div>

          ${buyerNoteHtml}

          <div style="margin-top: 32px; padding: 16px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
            <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h3 style="color: #991b1b; margin-top: 0;">⚠️ שים לב - אישור תשלום נדרש!</h3>
              <p style="color: #7f1d1d; margin-bottom: 0;">לקוח זה ביצע הזמנה והופנה לקישור התשלום הישיר שלך (Paybox/Bit). <strong>אנא ודא שהכסף אכן נכנס לחשבונך לפני שאתה אורז ושולח את הספר!</strong></p>
            </div>

            <p style="color: #4b5563; font-size: 16px;">
              אפשר להתחיל לארוז! הנה פרטי ההזמנה והמשלוח:
            </p>
            <p style="margin: 8px 0 0 0; font-weight: bold;"><a href="https://booktotable.co.il/dashboard" style="color: #16a34a; text-decoration: none;">כניסה ללוח הבקרה</a></p>
          </div>
        </div>
      </div>
    `;

  // Resend free tier allows sending to verified domain emails only, so we mock it to user email
  const recipientEmail = readerDetails.email || 'noreply@booktotable.com';
  return resend.emails.send({
    from: 'BookToTable Orders <onboarding@resend.dev>',
    to: [recipientEmail], // In production: Author's email.
    subject: `הזמנה חדשה התקבלה! - ${String(readerDetails.name || 'לקוח').slice(0, 80)}`,
    html: htmlContent,
  });
}

// ── Tracking update to buyer ──────────────────────────────────────────────
export async function sendTrackingEmail(params: {
  email: string;
  name?: string;
  orderId: string;
  trackingNumber: string;
  bookTitle?: string;
}) {
  const { email, name, orderId, trackingNumber, bookTitle } = params;

  const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-w-xl; margin: 0 auto;">
        <div style="text-align: center; padding: 24px; background-color: #2563eb; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">הספר שלך יצא לדרך! 🚚</h1>
        </div>
        
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">שלום ${escapeHtml(name || 'קורא/ת יקר/ה')},</p>
          <p style="font-size: 16px;">אנו שמחים לעדכן אותך שהסופר ארז את ההזמנה שלך (<strong>${escapeHtml(bookTitle || `הזמנה מס' ${orderId}`)}</strong>) ומסר אותה לחברת המשלוחים.</p>
          
          <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">מספר מעקב</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: bold; color: #0f172a; letter-spacing: 2px;">${escapeHtml(trackingNumber)}</p>
          </div>

          <div style="margin-top: 32px; text-align: center;">
            <a href="https://booktotable.co.il/track-order" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">מעקב אחרי ההזמנה באתר</a>
          </div>

          <p style="margin-top: 32px; font-size: 14px; color: #6b7280; text-align: center;">תודה שתמכת בספרות מקורית עצמאית!</p>
        </div>
      </div>
    `;

  return resend.emails.send({
    from: 'BookToTable Updates <onboarding@resend.dev>',
    to: [email],
    subject: 'עדכון משלוח: הספר שלך יצא לדרך!',
    html: htmlContent,
  });
}
