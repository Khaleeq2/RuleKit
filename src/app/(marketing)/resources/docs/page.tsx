import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Code2, FlaskConical, GitBranch, Rocket, Key, BarChart3, Webhook } from 'lucide-react';
import { buildPublicMetadata } from '../../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'Documentation — RuleKit',
  description:
    'Learn how to build, test, deploy, and integrate decisions with RuleKit. Guides, API reference, and examples.',
  canonicalPath: '/resources/docs',
});

const DOC_SECTIONS = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Create your account, build your first decision, and run your first evaluation in under 5 minutes.',
    links: [
      { label: 'Quickstart guide', href: '/developers/quickstart' },
      { label: 'Core concepts', href: '/product/how-it-works' },
    ],
  },
  {
    icon: Code2,
    title: 'Decision Studio',
    description: 'Define input schemas with typed fields, build ordered rule chains, and configure pass/fail outcomes.',
    links: [
      { label: 'Schema reference', href: '/product/decision-studio' },
      { label: 'Rule conditions', href: '/product/decision-studio' },
    ],
  },
  {
    icon: FlaskConical,
    title: 'Testing',
    description: 'Author test cases with expected verdicts, run individual tests or full suites, and review execution traces.',
    links: [
      { label: 'Test case guide', href: '/product/how-it-works' },
      { label: 'Running suites', href: '/product/how-it-works' },
    ],
  },
  {
    icon: GitBranch,
    title: 'Versioning',
    description: 'Snapshot schema + rules into immutable versions. Compare versions side by side.',
    links: [
      { label: 'Version lifecycle', href: '/product/how-it-works' },
    ],
  },
  {
    icon: Rocket,
    title: 'Deployments',
    description: 'Promote versions to draft or live environments. Roll back instantly if needed.',
    links: [
      { label: 'Deployment guide', href: '/product/how-it-works' },
      { label: 'Environment model', href: '/product/how-it-works' },
    ],
  },
  {
    icon: Key,
    title: 'API Keys & Auth',
    description: 'Create scoped API keys for draft and live environments. Rotate and revoke keys securely.',
    links: [
      { label: 'API key management', href: '/developers/quickstart' },
    ],
  },
  {
    icon: BarChart3,
    title: 'Run History',
    description: 'Every evaluation is logged with input, output, fired rule, trace, latency, and credits. Filter and export.',
    links: [
      { label: 'History overview', href: '/product/how-it-works' },
    ],
  },
  {
    icon: Webhook,
    title: 'Webhooks & Integrations',
    description: 'Subscribe to run events and push verdicts to Slack, Zapier, or your own endpoints.',
    links: [
      { label: 'Webhook setup', href: '/developers/quickstart' },
    ],
  },
] as const;

export default function ResourcesDocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)] mb-3">
          Resources
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Documentation
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-base leading-relaxed text-[var(--muted-foreground)]">
          Everything you need to build, test, deploy, and integrate business decisions with RuleKit.
        </p>
      </section>

      {/* Doc grid */}
      <section className="py-12 border-t border-[var(--border)]">
        <div className="grid sm:grid-cols-2 gap-6">
          {DOC_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 hover:border-[var(--brand)]/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-[var(--brand)]" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  {section.title}
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)] mb-4">
                {section.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-xs font-medium text-[var(--brand)] hover:underline"
                  >
                    {link.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Help */}
      <section className="py-16 border-t border-[var(--border)] text-center">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)] mb-2">
          Can&apos;t find what you need?
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Reach out and we&apos;ll help you get unblocked.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] shadow-md shadow-[var(--brand)]/20 transition-all"
          >
            Contact support
          </Link>
          <Link
            href="/developers/quickstart"
            className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-all"
          >
            API quickstart
          </Link>
        </div>
      </section>
    </div>
  );
}
