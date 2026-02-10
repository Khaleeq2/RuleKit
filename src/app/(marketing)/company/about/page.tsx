import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPublicMetadata } from '../../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'About RuleKit — Our Mission',
  description:
    'RuleKit exists to give every team the power to define, test, and deploy business rules without writing code or waiting on engineering.',
  canonicalPath: '/company/about',
});

const VALUES = [
  {
    title: 'Verdicts should be explicit',
    description:
      'Every verdict should trace back to a named rule with a clear reason. No black boxes, no hidden weights, no "it depends."',
  },
  {
    title: 'Logic should be testable',
    description:
      'If you can\'t write a test case for a business rule, you don\'t understand the rule. RuleKit makes testing a first-class citizen.',
  },
  {
    title: 'Change should be safe',
    description:
      'Version snapshots, environment promotion, and instant rollback give teams the confidence to iterate without fear.',
  },
  {
    title: 'Everyone should have access',
    description:
      'Product managers, compliance officers, and ops leads should be able to read, write, and audit rule logic — not just engineers.',
  },
] as const;

export default function CompanyAboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)] mb-3">
          Company
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl max-w-2xl mx-auto">
          Making business logic visible, testable, and deployable
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-base leading-relaxed text-[var(--muted-foreground)]">
          RuleKit was built because too many critical business rules live in spreadsheets, Slack threads, or buried inside application code that only one engineer understands. We believe there&apos;s a better way.
        </p>
      </section>

      {/* Mission */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] mb-4">
            Our mission
          </h2>
          <p className="text-base leading-relaxed text-[var(--muted-foreground)]">
            Give every team — from startups to enterprises — a structured, auditable way to define and operate business rules. No vendor lock-in. No black-box models. Just clear rules, tested behavior, and versioned deployments.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 border-t border-[var(--border)]">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] text-center mb-10">
          What we believe
        </h2>
        <div className="grid sm:grid-cols-2 gap-8">
          {VALUES.map((v) => (
            <div key={v.title}>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                {v.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The product */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] mb-4">
            The product
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <p>
              RuleKit is a self-serve rules engine. You define input schemas, write ordered rules with conditions and outcomes, test them with automated suites, version and deploy through structured environments, and monitor every evaluation in real time.
            </p>
            <p>
              Every published rulebook exposes a REST API endpoint. Send JSON, get a structured verdict with the exact rule that fired, a full execution trace, and latency metrics. Integrate into any backend, automation, or webhook pipeline.
            </p>
            <p>
              We also support conversational evaluation: paste raw data or describe a scenario in plain English, and RuleKit&apos;s AI-powered evaluator maps your input to the active rule set and returns a verdict with evidence.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-[var(--border)] text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] mb-3">
          Get in touch
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
          Have questions, feedback, or partnership ideas? We&apos;d love to hear from you.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-lg bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] shadow-md shadow-[var(--brand)]/20 transition-all"
          >
            Contact us
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-lg border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-all"
          >
            Try RuleKit free
          </Link>
        </div>
      </section>
    </div>
  );
}
