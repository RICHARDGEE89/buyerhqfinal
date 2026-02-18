import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const contactRecipient = process.env.CONTACT_RECIPIENT_EMAIL || 'hello@buyerhq.com.au';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, subject, message } = body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Please complete all fields before sending your message.' },
        { status: 400 }
      );
    }

    if (!resendApiKey) {
      return NextResponse.json(
        {
          error:
            'Email service is not configured yet. Please try again later or contact us directly at hello@buyerhq.com.au.',
        },
        { status: 503 }
      );
    }

    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: 'BuyerHQ Contact <no-reply@buyerhq.com.au>',
      to: contactRecipient,
      replyTo: email,
      subject: `[BuyerHQ Contact] ${subject}`,
      text: [
        `From: ${firstName} ${lastName}`,
        `Email: ${email}`,
        '',
        'Message:',
        message,
      ].join('\n'),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error:
          'Something went wrong while sending your message. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
}

