import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, GitBranch, Zap, FlaskConical, Rocket, BarChart3 } from 'lucide-react';
import { buildPublicMetadata } from '../../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'Product — Decision Engine for Modern Teams',
  description:
    'Model schemas, define rules, test behavior, deploy versions, and review run history — all from one platform.',
  canonicalPath: '/product/overview',
});

const CAPABILITIES = [
  {
    icon: ShieldCheck,
    title: 'Decision Studio',
    description:
      'Define input schemas, build ordered rule chains, and configure pass/fail logic — no code required. Every decision is versioned, testable, and deployable.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Evaluation',
    description:
      'Paste raw data or describe a scenario in plain English. RuleKit\'s Groq-backed evaluator maps your input to the active rule set and returns a structured verdict with evidence.',
  },
  {
    icon: FlaskConical,
    title: 'Test Suites',
    description:
      'Author test cases with expected outcomes. Run individual tests or full suites before deploying. Every result is recorded with execution traces and latency metrics.',
  },
  {
    icon: GitBranch,
    title: 'Versioning & Deployments',
    description:
      'Snapshot schema + rules into immutable versions. Promote to draft or live environments. Roll back in one click if something goes wrong.',
  },
  {
    icon: Rocket,
    title: 'REST API',
    description:
      'Every published decision gets a live API endpoint. Send JSON, get a verdict. Integrate into any backend, webhook, or automation pipeline in minutes.',
  },
  {
    icon: BarChart3,
    title: 'Run History & Analytics',
    description:
      'Every evaluation is logged with input, output, fired rule, execution trace, latency, and credit cost. Filter by decision, status, or time range.',
  },
] as const;

export default function ProductOverviewPage() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)] mb-3">
          Product
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl max-w-3xl mx-auto">
          The decision engine your&nbsp;team actually uses
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-base leading-relaxed text-[var(--muted-foreground)]">
          RuleKit gives product and ops teams a structured way to define, test, deploy, and monitor business decisions — without waiting on engineering sprints.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/auth/sign-up"
            className="rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] shadow-md shadow-[var(--brand)]/20 transition-all"
          >
            Start for free
          </Link>
          <Link
            href="/product/how-it-works"
            className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-all"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* Capabilities grid */}
      <section className="py-16 border-t border-[var(--border)]">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] text-center mb-12">
          Everything you need to ship decisions with confidence
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} className="group">
              <div className="w-10 h-10 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--brand)]/15 transition-colors">
                <cap.icon className="w-5 h-5 text-[var(--brand)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">
                {cap.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it flows */}
      <section className="py-16 border-t border-[var(--border)]">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] text-center mb-4">
          From schema to production in four steps
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] text-center mb-12 max-w-lg mx-auto">
          No complex setup. No YAML files. Just structured decision logic that deploys in minutes.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Define Schema', desc: 'Describe the input fields your decision needs — types, constraints, examples.' },
            { step: '02', title: 'Write Rules', desc: 'Add ordered rules with conditions, outcomes, and reasons. Enable or disable individually.' },
            { step: '03', title: 'Test & Version', desc: 'Run test suites, review traces, then snapshot into an immutable version.' },
            { step: '04', title: 'Deploy & Monitor', desc: 'Promote to live, call via API, and watch every evaluation in real time.' },
          ].map((s) => (
            <div key={s.step} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
              <span className="text-xs font-bold text-[var(--brand)]">{s.step}</span>
              <h3 className="mt-2 text-sm font-semibold text-[var(--foreground)]">{s.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted-foreground)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-[var(--border)] text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] mb-3">
          Ready to take control of your decisions?
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
          Start with 50 free evaluations per month. No credit card required.
        </p>
        <Link
          href="/auth/sign-up"
          className="inline-block rounded-lg bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] shadow-md shadow-[var(--brand)]/20 transition-all"
        >
          Get started free
        </Link>
      </section>
    </div>
  );
}
