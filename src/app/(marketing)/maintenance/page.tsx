import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPublicMetadata } from '../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'Maintenance',
  description:
    'RuleKit is temporarily unavailable while scheduled maintenance is in progress.',
  canonicalPath: '/maintenance',
});

export default function MaintenancePage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">
        Temporary Maintenance
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
        We&apos;ll be back shortly.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
        RuleKit is undergoing scheduled updates. The product app remains available
        at <code className="rounded bg-[var(--muted)] px-1.5 py-0.5">/home</code>
        for existing users.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
        >
          Back to homepage
        </Link>
        <Link
          href="/home"
          className="inline-flex items-center rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)]"
        >
          Open app
        </Link>
      </div>
    </section>
  );
}
