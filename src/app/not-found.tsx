import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">
        404
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)]">
        The page you requested does not exist or may have moved. Use one of the
        primary entry points below.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
        >
          Public homepage
        </Link>
        <Link
          href="/home"
          className="inline-flex items-center rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)]"
        >
          Open app
        </Link>
      </div>
    </main>
  );
}
