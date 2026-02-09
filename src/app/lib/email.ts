import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResendClient(): Resend {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is not configured. Add it to your .env.local file. Get one at https://resend.com/api-keys'
    );
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
}
