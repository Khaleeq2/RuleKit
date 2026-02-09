import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmails } from '@/app/lib/send-email';

const RATE_LIMIT_MS = 60_000;
const recentSubmissions = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required (min 2 characters)' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message is required (min 10 characters)' }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long (max 5000 characters)' }, { status: 400 });
    }

    // Simple rate limiting by email
    const now = Date.now();
    const lastSubmission = recentSubmissions.get(email);
    if (lastSubmission && now - lastSubmission < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Please wait a minute before submitting again' },
        { status: 429 }
      );
    }
    recentSubmissions.set(email, now);

    // Clean up old entries periodically
    if (recentSubmissions.size > 1000) {
      for (const [key, time] of recentSubmissions) {
        if (now - time > RATE_LIMIT_MS * 5) recentSubmissions.delete(key);
      }
    }

    await sendContactFormEmails(name.trim(), email.trim(), message.trim());

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('[/api/contact] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
