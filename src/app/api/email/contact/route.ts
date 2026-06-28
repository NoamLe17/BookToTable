import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Using the API key from the existing email route
const resend = new Resend('re_DTeFKd2R_ByHXKUvq9EBb5mk1sEU52xWo');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">פנייה חדשה מאתר BookToTable</h1>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;"><strong>שם:</strong> ${name}</p>
          <p style="font-size: 16px;"><strong>אימייל לחזרה:</strong> ${email}</p>
          <h3 style="margin-top: 20px; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">תוכן הפנייה:</h3>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; white-space: pre-wrap; line-height: 1.5; font-size: 15px; border: 1px solid #e5e7eb;">
${message}
          </div>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'BookToTable Contact <onboarding@resend.dev>', // Free tier restricted
      to: ['noamhemo2001@gmail.com'], // Send to the user's email
      subject: `פנייה חדשה מאת ${name} - BookToTable`,
      replyTo: email,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Contact API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
