import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { buildPublicMetadata } from '../../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'Plans & Pricing',
  description:
    'Transparent pricing aligned to team maturity. Start free, scale predictably.',
  canonicalPath: '/pricing/plans',
});

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals exploring decision logic.',
    cta: { label: 'Get started', href: '/auth/sign-up' },
    highlight: false,
    features: [
      '50 evaluations / month',
      '3 decisions',
      '10 rules per decision',
      'Community support',
      'Single user',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/ month',
    description: 'For teams shipping decisions to production.',
    cta: { label: 'Start free trial', href: '/auth/sign-up' },
    highlight: true,
    features: [
      '2,000 evaluations / month',
      'Unlimited decisions',
      'Unlimited rules',
      'Version history & deployments',
      'Priority support',
      'Up to 5 team members',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with governance and scale requirements.',
    cta: { label: 'Contact sales', href: '/company/contact' },
    highlight: false,
    features: [
      'Unlimited evaluations',
      'Unlimited everything',
      'SSO & SAML',
      'Audit logs & compliance',
      'Dedicated support',
      'Custom SLA',
      'On-premise option',
    ],
  },
] as const;

const CREDIT_PACKS = [
  { name: 'Starter', credits: 50, price: 10 },
  { name: 'Growth', credits: 200, price: 25, popular: true },
  { name: 'Scale', credits: 500, price: 50 },
];

export default function PricingPlansPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)] mb-3">
          Pricing
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-[var(--muted-foreground)]">
          Start free, upgrade when your team and usage grow. No hidden fees, no surprises.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-20">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`
              relative rounded-2xl border p-8 flex flex-col
              ${plan.highlight
                ? 'border-[var(--brand)] bg-[var(--brand)]/[0.03] shadow-lg shadow-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20'
                : 'border-[var(--border)] bg-[var(--card)]'
              }
            `}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand)] px-4 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-[var(--foreground)]"
                >
                  <Check className="w-4 h-4 mt-0.5 text-[var(--brand)] flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={plan.cta.href}
              className={`
                block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-all duration-200
                ${plan.highlight
                  ? 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] shadow-md shadow-[var(--brand)]/20'
                  : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                }
              `}
            >
              {plan.cta.label}
            </Link>
          </div>
        ))}
      </div>

      {/* Credit Packs */}
      <div className="border-t border-[var(--border)] pt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Need more evaluations?
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Top up with credit packs. Credits never expire.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.name}
              className={`
                rounded-xl border p-6 text-center
                ${pack.popular
                  ? 'border-[var(--brand)]/40 bg-[var(--brand)]/[0.03] ring-1 ring-[var(--brand)]/15'
                  : 'border-[var(--border)] bg-[var(--card)]'
                }
              `}
            >
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                {pack.name}
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                {pack.credits}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">credits</p>
              <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                ${pack.price}
              </p>
              {pack.popular && (
                <span className="mt-2 inline-block rounded-full bg-[var(--brand)]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--brand)]">
                  Best value
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ teaser */}
      <div className="mt-16 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          Questions?{' '}
          <Link
            href="/pricing/faq"
            className="text-[var(--brand)] hover:underline font-medium"
          >
            Read the FAQ
          </Link>{' '}
          or{' '}
          <Link
            href="/company/contact"
            className="text-[var(--brand)] hover:underline font-medium"
          >
            contact us
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
