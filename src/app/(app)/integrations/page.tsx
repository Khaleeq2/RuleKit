import Link from 'next/link';

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-tight">
        Integrations
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
        Integration management is currently decision-centric. Open a decision and
        use the API tab for endpoint details and execution examples.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/decisions"
          className="inline-flex items-center rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)]"
        >
          Open decisions
        </Link>
        <Link
          href="/developers/quickstart"
          className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
        >
          Developer quickstart
        </Link>
      </div>
    </div>
  );
}
