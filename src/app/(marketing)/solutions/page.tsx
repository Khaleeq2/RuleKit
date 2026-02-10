import type { Metadata } from 'next';
import Link from 'next/link';
import { Landmark, ShieldAlert, Route, MessageSquareWarning } from 'lucide-react';
import { buildPublicMetadata } from '../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'Solutions — Rule Logic for Every Use Case',
  description:
    'Apply RuleKit to eligibility, fraud screening, routing, moderation, and any workflow where structured rules matter.',
  canonicalPath: '/solutions',
});

const USE_CASES = [
  {
    icon: Landmark,
    title: 'Loan & Credit Eligibility',
    description:
      'Define credit-score thresholds, income ratios, and employment checks as ordered rules. Every approval or rejection returns an explicit reason your compliance team can audit.',
    example: 'Credit score ≥ 650 AND debt-to-income < 0.4 → Approved',
    href: '/solutions/loan-eligibility',
  },
  {
    icon: ShieldAlert,
    title: 'Fraud & Risk Screening',
    description:
      'Flag high-risk transactions with amount limits, geo checks, and velocity rules. Get a structured verdict with the exact rule that fired — not a black-box score.',
    example: 'Amount > $5,000 AND country ≠ home → Flag for review',
    href: '/solutions/fraud-screening',
  },
  {
    icon: Route,
    title: 'Support & Lead Routing',
    description:
      'Route tickets, leads, or tasks to the right team based on urgency, segment, region, or product line. All rules are evaluated and combined into a single result.',
    example: 'Plan = enterprise AND region = EMEA → Route to EMEA CSM',
    href: '/solutions/routing',
  },
  {
    icon: MessageSquareWarning,
    title: 'Content Moderation',
    description:
      'Define moderation policies as testable rules. Flag, escalate, or auto-approve content based on category, keywords, user trust level, and more.',
    example: 'Category = hate_speech OR trust_level < 2 → Escalate',
    href: '/solutions/content-moderation',
  },
] as const;

export default function SolutionsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)] mb-3">
          Solutions
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl max-w-3xl mx-auto">
          Structured rules for every domain
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-base leading-relaxed text-[var(--muted-foreground)]">
          Whether you&apos;re approving loans, screening transactions, routing support tickets, or enforcing content policies — RuleKit gives you testable, explainable logic that your whole team can own.
        </p>
      </section>

      {/* Use cases */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="space-y-16">
          {USE_CASES.map((uc, i) => (
            <div
              key={uc.title}
              className={`flex flex-col lg:flex-row gap-8 items-start ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="flex-1">
                <div className="w-10 h-10 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center mb-4">
                  <uc.icon className="w-5 h-5 text-[var(--brand)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  {uc.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)] mb-4">
                  {uc.description}
                </p>
                <Link
                  href={uc.href}
                  className="text-sm font-medium text-[var(--brand)] hover:underline"
                >
                  Learn more →
                </Link>
              </div>
              <div className="flex-1 w-full">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                    Example rule
                  </p>
                  <code className="text-sm font-mono text-[var(--foreground)] leading-relaxed">
                    {uc.example}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why RuleKit */}
      <section className="py-16 border-t border-[var(--border)]">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] text-center mb-10">
          Why teams choose RuleKit
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { title: 'Explainable', desc: 'Every verdict includes the exact rule that fired and why — no black boxes.' },
            { title: 'Testable', desc: 'Write test cases with expected outcomes. Run suites before every deploy.' },
            { title: 'Auditable', desc: 'Full run history with input, output, execution trace, and timestamps.' },
          ].map((v) => (
            <div key={v.title} className="text-center">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1.5">{v.title}</h3>
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-[var(--border)] text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] mb-3">
          Build your first rulebook in minutes
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
          50 free evaluations per month. No credit card required.
        </p>
        <Link
          href="/auth/sign-up"
          className="inline-block rounded-lg bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] shadow-md shadow-[var(--brand)]/20 transition-all"
        >
          Start for free
        </Link>
      </section>
    </div>
  );
}
