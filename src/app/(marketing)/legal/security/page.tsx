import type { Metadata } from 'next';
import { buildPublicMetadata } from '../../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'Security',
  description: 'Security posture and operational safeguards for RuleKit — how we protect your data and rulebooks.',
  canonicalPath: '/legal/security',
});

export default function SecurityPage() {
  return (
    <article className="mx-auto max-w-[720px] px-6 pb-24 pt-16">
      <header className="mb-12">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--brand)]">Legal</p>
        <h1 className="mt-3 text-[2.25rem] font-semibold leading-tight tracking-tight text-slate-900">
          Security
        </h1>
        <p className="mt-3 text-[14px] text-slate-400">Last updated: February 9, 2026</p>
      </header>

      <div className="prose-legal space-y-8 text-[15px] leading-[1.75] text-slate-600 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-slate-800 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">

        <section>
          <h2>Our Approach</h2>
          <p>
            Security is a core part of how RuleKit is built and operated — not an afterthought. We design our systems to protect your data, isolate your rulebooks, and give you confidence that the platform is safe for production use.
          </p>
        </section>

        <section>
          <h2>Infrastructure</h2>
          <ul>
            <li><strong>Hosting</strong> — RuleKit is hosted on Vercel&apos;s edge network with automatic TLS termination. All traffic is encrypted in transit via HTTPS.</li>
            <li><strong>Database</strong> — Data is stored in Supabase (PostgreSQL) with encryption at rest, automated backups, and point-in-time recovery.</li>
            <li><strong>Email</strong> — Transactional emails are sent through Resend with domain-verified DKIM and SPF records.</li>
            <li><strong>AI processing</strong> — Rule evaluations are processed through Groq with server-side API keys that are never exposed to browsers.</li>
          </ul>
        </section>

        <section>
          <h2>Authentication and Access Control</h2>
          <ul>
            <li><strong>Authentication</strong> — powered by Supabase Auth with bcrypt-hashed passwords and secure session tokens.</li>
            <li><strong>Session management</strong> — HTTP-only cookies with automatic expiration and refresh.</li>
            <li><strong>Route protection</strong> — middleware-level auth guards redirect unauthenticated users before any app content loads.</li>
            <li><strong>Row-level security</strong> — database policies ensure users can only access their own data.</li>
          </ul>
        </section>

        <section>
          <h2>Data Isolation</h2>
          <p>
            Each user&apos;s rules, rulebooks, evaluations, and history are logically isolated at the database level. Row-level security (RLS) policies are enforced by Supabase, meaning data isolation is enforced at the database layer — not just the application layer.
          </p>
        </section>

        <section>
          <h2>API Security</h2>
          <ul>
            <li><strong>Rate limiting</strong> — all API endpoints enforce per-IP rate limits to prevent abuse and ensure fair usage.</li>
            <li><strong>Input validation</strong> — all inputs are validated and sanitized server-side before processing.</li>
            <li><strong>Secret management</strong> — API keys (Groq, Resend) are stored as server-side environment variables and are never bundled into client-side code.</li>
          </ul>
        </section>

        <section>
          <h2>Operational Practices</h2>
          <ul>
            <li><strong>Dependency management</strong> — dependencies are regularly reviewed and updated to address known vulnerabilities.</li>
            <li><strong>Error handling</strong> — error boundaries prevent cascading failures. Error details are logged server-side and never leaked to users.</li>
            <li><strong>Maintenance mode</strong> — a built-in maintenance mode allows us to gracefully take the Service offline for updates without data risk.</li>
          </ul>
        </section>

        <section>
          <h2>Responsible Disclosure</h2>
          <p>
            If you discover a security vulnerability in RuleKit, please report it responsibly by emailing{' '}
            <a href="mailto:team@rulekit.io" className="text-[var(--brand)] hover:underline">team@rulekit.io</a>{' '}
            with the subject line &ldquo;Security Report.&rdquo; We will acknowledge your report within 48 hours and work to resolve the issue promptly.
          </p>
          <p>
            Please do not publicly disclose vulnerabilities before we have had a reasonable opportunity to address them.
          </p>
        </section>

        <section>
          <h2>Questions</h2>
          <p>
            For security-related questions, contact us at{' '}
            <a href="mailto:team@rulekit.io" className="text-[var(--brand)] hover:underline">team@rulekit.io</a>.
          </p>
        </section>

      </div>
    </article>
  );
}
