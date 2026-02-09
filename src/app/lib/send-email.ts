import { getResendClient, getFromEmail } from './email';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { ContactSubmissionEmail } from '@/emails/ContactSubmissionEmail';
import { ContactConfirmationEmail } from '@/emails/ContactConfirmationEmail';
import { PasswordResetEmail } from '@/emails/PasswordResetEmail';

const TEAM_EMAIL = 'team@rulekit.io';

export async function sendWelcomeEmail(to: string, name: string) {
  const resend = getResendClient();
  return resend.emails.send({
    from: `RuleKit <${getFromEmail()}>`,
    to,
    subject: 'Welcome to RuleKit',
    react: WelcomeEmail({ name }),
  });
}

export async function sendContactFormEmails(
  name: string,
  email: string,
  message: string
) {
  const resend = getResendClient();
  const from = `RuleKit <${getFromEmail()}>`;

  const [internal, confirmation] = await Promise.allSettled([
    resend.emails.send({
      from,
      to: TEAM_EMAIL,
      subject: `Contact: ${name}`,
      replyTo: email,
      react: ContactSubmissionEmail({ name, email, message }),
    }),
    resend.emails.send({
      from,
      to: email,
      subject: "We got your message — RuleKit",
      react: ContactConfirmationEmail({ name }),
    }),
  ]);

  return { internal, confirmation };
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  const resend = getResendClient();
  return resend.emails.send({
    from: `RuleKit <${getFromEmail()}>`,
    to,
    subject: 'Reset your password — RuleKit',
    react: PasswordResetEmail({ name, resetUrl }),
  });
}
