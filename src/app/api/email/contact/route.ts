import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/emails';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple per-instance rate limit: max 3 messages per IP per 10 minutes.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    if (rateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, message, attachment } = body;

    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string' || !name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (name.length > 100 || email.length > 200 || message.length > 5000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Optional screenshot attachment (base64, images only, max ~3MB)
    let attachments: { filename: string; content: string }[] | undefined;
    if (attachment != null) {
      const { filename, contentType, content } = attachment as Record<string, unknown>;
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (
        typeof filename !== 'string' || typeof contentType !== 'string' || typeof content !== 'string' ||
        !allowedTypes.includes(contentType) ||
        !/^[A-Za-z0-9+/=]+$/.test(content) ||
        content.length > Math.ceil((3 * 1024 * 1024 * 4) / 3) + 4
      ) {
        return NextResponse.json({ error: 'Invalid attachment' }, { status: 400 });
      }
      const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
      const safeBase = filename.replace(/\.[^.]*$/, '').replace(/[^\w\u0590-\u05FF-]+/g, '_').slice(0, 60) || 'screenshot';
      attachments = [{ filename: `${safeBase}.${ext}`, content }];
    }

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">פנייה חדשה מאתר BookToTable</h1>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;"><strong>שם:</strong> ${escapeHtml(name)}</p>
          <p style="font-size: 16px;"><strong>אימייל לחזרה:</strong> ${escapeHtml(email)}</p>
          <h3 style="margin-top: 20px; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">תוכן הפנייה:</h3>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; white-space: pre-wrap; line-height: 1.5; font-size: 15px; border: 1px solid #e5e7eb;">
${escapeHtml(message)}
          </div>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'BookToTable Contact <onboarding@resend.dev>', // Free tier restricted
      to: ['noamhemo2001@gmail.com'], // Always sent only to the site owner
      subject: `פנייה חדשה מאת ${name.slice(0, 80)} - BookToTable`,
      replyTo: email,
      html: htmlContent,
      ...(attachments ? { attachments } : {}),
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: 'Failed to send' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Contact API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
