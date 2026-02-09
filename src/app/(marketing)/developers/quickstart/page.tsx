import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPublicMetadata } from '../../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'Developers — API Quickstart',
  description:
    'Integrate RuleKit decisions into any stack. Send JSON, get a verdict. Full REST API with versioned endpoints.',
  canonicalPath: '/developers/quickstart',
});

const CODE_EXAMPLE = `curl -X POST https://api.rulekit.io/v1/evaluate \\
  -H "Authorization: Bearer rk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "decision_id": "d_abc123",
    "input": {
      "credit_score": 720,
      "annual_income": 85000,
      "loan_amount": 25000
    }
  }'`;

const RESPONSE_EXAMPLE = `{
  "verdict": "pass",
  "reason": "Application meets all eligibility criteria",
  "fired_rule": "Default Pass",
  "execution_trace": [
    { "rule": "Min Credit Score", "matched": false },
    { "rule": "Income Ratio",     "matched": false },
    { "rule": "Default Pass",     "matched": true  }
  ],
  "latency_ms": 42,
  "credits_used": 1
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
          One API call. Structured verdict.
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-base leading-relaxed text-[var(--muted-foreground)]">
          Every published decision in RuleKit gets a live REST endpoint. Send JSON input, get back a pass/fail verdict with the exact rule that fired, an execution trace, and latency metrics.
        </p>
      </section>

      {/* Request */}
      <section className="pb-12">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Make a request
        </h2>
        <div className="rounded-xl border border-[var(--border)] bg-[#1e1e2e] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">POST</span>
            <span className="text-xs text-white/60 font-mono">/v1/evaluate</span>
          </div>
          <pre className="p-4 text-[13px] leading-relaxed text-white/90 font-mono overflow-x-auto">
            {CODE_EXAMPLE}
          </pre>
        </div>
      </section>

      {/* Response */}
      <section className="pb-16">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Get a structured response
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
              title: 'Create a decision',
              desc: 'Define your schema and rules in the Decision Studio. Publish when ready.',
            },
            {
              step: '2',
              title: 'Generate an API key',
              desc: 'Go to Settings → API Keys. Create a key scoped to your environment (draft or live).',
            },
            {
              step: '3',
              title: 'Call the endpoint',
              desc: 'POST your input JSON to /v1/evaluate with your API key. Parse the verdict.',
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

      {/* SDK & features */}
      <section className="py-16 border-t border-[var(--border)]">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] text-center mb-10">
          Built for developer experience
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { title: 'Versioned endpoints', desc: 'Pin to a specific decision version for deterministic behavior in production.' },
            { title: 'Execution traces', desc: 'Every response includes the full rule evaluation order, so you can debug without leaving your terminal.' },
            { title: 'Webhook support', desc: 'Subscribe to run.completed and run.failed events to trigger downstream workflows.' },
            { title: 'Credit metering', desc: 'Each response includes credits_used so you can track consumption programmatically.' },
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
          Start building
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
          Create your free account, publish a decision, and make your first API call in under 5 minutes.
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
