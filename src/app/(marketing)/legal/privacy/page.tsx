import type { Metadata } from 'next';
import { buildPublicMetadata } from '../../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'Privacy Policy',
  description: 'Privacy Policy for RuleKit — how we collect, use, and protect your data.',
  canonicalPath: '/legal/privacy',
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[720px] px-6 pb-24 pt-16">
      <header className="mb-12">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--brand)]">Legal</p>
        <h1 className="mt-3 text-[2.25rem] font-semibold leading-tight tracking-tight text-slate-900">
          Privacy Policy
        </h1>
        <p className="mt-3 text-[14px] text-slate-400">Effective date: February 9, 2026</p>
      </header>

      <div className="prose-legal space-y-8 text-[15px] leading-[1.75] text-slate-600 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-slate-800 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_table]:w-full [&_table]:text-[14px] [&_th]:text-left [&_th]:pb-2 [&_th]:font-semibold [&_th]:text-slate-800 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top">

        <section>
          <h2>1. Introduction</h2>
          <p>
            RuleKit (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding that information when you use our web application, API, and related services (collectively, &ldquo;the Service&rdquo;).
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>

          <h3>Information you provide</h3>
          <ul>
            <li><strong>Account information</strong> — name, email address, and password when you create an account.</li>
            <li><strong>Content</strong> — rules, documents, and other data you upload or create within the Service.</li>
            <li><strong>Contact submissions</strong> — name, email, and message when you use our contact form.</li>
            <li><strong>Payment information</strong> — billing details processed through our payment provider (we do not store card numbers).</li>
          </ul>

          <h3>Information collected automatically</h3>
          <ul>
            <li><strong>Usage data</strong> — pages visited, features used, evaluation counts, and session duration.</li>
            <li><strong>Device information</strong> — browser type, operating system, and screen resolution.</li>
            <li><strong>Log data</strong> — IP address, request timestamps, and referral URLs.</li>
          </ul>

          <h3>Analytics</h3>
          <p>
            We use Vercel Analytics to collect aggregated, anonymized usage data. This helps us understand how the Service is used and where to improve. Vercel Analytics does not use cookies and does not track individual users across websites.
          </p>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <table>
            <thead>
              <tr>
                <th>Purpose</th>
                <th>Data used</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Provide and operate the Service</td>
                <td>Account info, content, usage data</td>
              </tr>
              <tr>
                <td>Authenticate your identity</td>
                <td>Email, password (hashed)</td>
              </tr>
              <tr>
                <td>Send transactional emails (welcome, password reset, contact confirmation)</td>
                <td>Email, name</td>
              </tr>
              <tr>
                <td>Respond to support requests</td>
                <td>Contact submissions</td>
              </tr>
              <tr>
                <td>Improve the Service</td>
                <td>Aggregated usage and analytics data</td>
              </tr>
              <tr>
                <td>Prevent abuse and enforce terms</td>
                <td>Log data, IP address</td>
              </tr>
            </tbody>
          </table>
          <p>
            We do <strong>not</strong> sell your personal information. We do <strong>not</strong> use your content to train machine learning models. Your rules and evaluation data are yours.
          </p>
        </section>

        <section>
          <h2>4. Data Sharing</h2>
          <p>We share information only in these limited circumstances:</p>
          <ul>
            <li><strong>Service providers</strong> — we use Supabase (database and authentication), Resend (email delivery), Vercel (hosting and analytics), and Groq (AI evaluation). These providers process data on our behalf under contractual obligations.</li>
            <li><strong>Legal requirements</strong> — we may disclose information if required by law, regulation, or legal process.</li>
            <li><strong>Business transfers</strong> — in the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>
            We retain your account information and content for as long as your account is active. If you close your account, we will delete your personal information and content within 30 days, except where retention is required for legal or compliance purposes.
          </p>
          <p>
            Aggregated, anonymized data that cannot be used to identify you may be retained indefinitely for analytics and product improvement.
          </p>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information, including:
          </p>
          <ul>
            <li>Encryption in transit (TLS/HTTPS) and at rest.</li>
            <li>Hashed passwords — we never store plaintext passwords.</li>
            <li>Row-level security on database tables to isolate user data.</li>
            <li>Rate limiting on API endpoints to prevent abuse.</li>
            <li>Environment-separated deployment (development, staging, production).</li>
          </ul>
          <p>
            No system is perfectly secure. If you become aware of a security vulnerability, please contact us immediately at <a href="mailto:team@rulekit.io" className="text-[var(--brand)] hover:underline">team@rulekit.io</a>.
          </p>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
            <li><strong>Correction</strong> — ask us to correct inaccurate information.</li>
            <li><strong>Deletion</strong> — request deletion of your personal data.</li>
            <li><strong>Portability</strong> — receive your data in a structured, machine-readable format.</li>
            <li><strong>Objection</strong> — object to certain processing of your data.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at <a href="mailto:team@rulekit.io" className="text-[var(--brand)] hover:underline">team@rulekit.io</a>. We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            RuleKit uses only essential cookies required for authentication and session management. We do not use advertising or tracking cookies. Vercel Analytics operates without cookies.
          </p>
        </section>

        <section>
          <h2>9. Children&apos;s Privacy</h2>
          <p>
            The Service is not directed at children under 16. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us and we will delete it.
          </p>
        </section>

        <section>
          <h2>10. International Transfers</h2>
          <p>
            Your information may be processed in the United States or other countries where our service providers operate. By using the Service, you consent to such transfers. We ensure appropriate safeguards are in place through contractual obligations with our providers.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the revised policy with an updated effective date. Your continued use of the Service after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Questions about this policy? Contact us at{' '}
            <a href="mailto:team@rulekit.io" className="text-[var(--brand)] hover:underline">team@rulekit.io</a>.
          </p>
        </section>

      </div>
    </article>
  );
}
