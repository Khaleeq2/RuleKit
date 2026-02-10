import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPublicMetadata } from '../../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'Developers — API Quickstart',
  description:
    'Call RuleKit from your signed-in app using session-based auth. Send input + rules and get a structured verdict.',
  canonicalPath: '/developers/quickstart',
});

const CODE_EXAMPLE = `const payload = {
  input: "Applicant: age 28, income 85000, credit score 740",
  rulebook_id: "rb_abc123",
  rulebook_name: "Loan Eligibility",
  rules: [
    {
      id: "rule_min_credit_score",
      name: "Minimum credit score",
      description: "Fail if credit score is below 650",
      reason: "Credit score is below threshold"
    }
  ],
  output_type: "pass_fail"
};

const response = await fetch("/api/evaluate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(payload)
});

const data = await response.json();`;

const RESPONSE_EXAMPLE = `{
  "success": true,
  "result": {
    "id": "run_123",
    "rulebook_id": "rb_abc123",
    "rulebook_name": "Loan Eligibility",
    "verdict": "pass",
    "reason": "All active rules passed.",
    "evaluations": [
      {
        "rule_id": "rule_min_credit_score",
        "rule_name": "Minimum credit score",
        "verdict": "pass",
        "reason": "Credit score meets threshold"
      }
    ],
    "latency_ms": 132,
    "timestamp": "2026-02-10T12:00:00.000Z"
  }
}`;

export default function DevelopersQuickstartPage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)] mb-3">
          Developers
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Session-auth API quickstart
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-base leading-relaxed text-[var(--muted-foreground)]">
          RuleKit currently authenticates API calls with your signed-in Supabase session cookie.
          Call <code className="font-mono">/api/evaluate</code> from your browser app with
          {' '}<code className="font-mono">credentials: &quot;include&quot;</code>.
        </p>
      </section>

      <section className="pb-8">
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-4 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/10 dark:text-amber-200">
          External API keys and server-to-server auth are not available yet.
          Use the in-app API tab for each rulebook to copy a valid payload.
        </div>
      </section>

      {/* Request */}
      <section className="pb-12">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Make a request
        </h2>
        <div className="rounded-xl border border-[var(--border)] bg-[#1e1e2e] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">POST</span>
            <span className="text-xs text-white/60 font-mono">/api/evaluate</span>
          </div>
          <pre className="p-4 text-[13px] leading-relaxed text-white/90 font-mono overflow-x-auto">
            {CODE_EXAMPLE}
          </pre>
        </div>
      </section>

      {/* Response */}
      <section className="pb-16">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Read the response
        </h2>
        <div className="rounded-xl border border-[var(--border)] bg-[#1e1e2e] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400">200 OK</span>
            <span className="text-xs text-white/60 font-mono">application/json</span>
          </div>
          <pre className="p-4 text-[13px] leading-relaxed text-white/90 font-mono overflow-x-auto">
            {RESPONSE_EXAMPLE}
          </pre>
        </div>
      </section>

      {/* Integration steps */}
      <section className="py-16 border-t border-[var(--border)]">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] text-center mb-10">
          Integrate in three steps
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Create a rulebook',
              desc: 'Define schema and rules in Rulebook Studio, then enable the rules you want to run.',
            },
            {
              step: '2',
              title: 'Copy payload from API tab',
              desc: 'Open Rulebooks -> API and copy the payload template with rulebook_id, rulebook_name, and rules.',
            },
            {
              step: '3',
              title: 'Call /api/evaluate',
              desc: 'From your signed-in browser app, send JSON with credentials: include and parse success/result.',
            },
          ].map((s) => (
            <div key={s.step} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-[var(--brand)]/10 text-xs font-bold text-[var(--brand)] mb-3">
                {s.step}
              </span>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1.5">{s.title}</h3>
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Practical notes */}
      <section className="py-16 border-t border-[var(--border)]">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] text-center mb-10">
          Practical notes
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { title: 'Request shape is strict', desc: 'Payload must include input (string), rulebook_id, rulebook_name, and rules array.' },
            { title: 'Session cookie required', desc: 'Unauthenticated calls return 401. Include credentials for browser fetch calls.' },
            { title: 'Rate limits apply', desc: 'When traffic spikes, the endpoint may return 429. Add retry/backoff handling.' },
            { title: 'Deterministic debugging', desc: 'Store input and returned evaluations so users can understand why a verdict happened.' },
          ].map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] mt-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">{f.title}</h3>
                <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-[var(--border)] text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] mb-3">
          Build with the current API model
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
          Start with a signed-in browser integration now. Expand later when external API auth is available.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/auth/sign-up"
            className="rounded-lg bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] shadow-md shadow-[var(--brand)]/20 transition-all"
          >
            Create free account
          </Link>
          <Link
            href="/resources/docs"
            className="rounded-lg border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-all"
          >
            Read the docs
          </Link>
        </div>
      </section>
    </div>
  );
}
