import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-6 py-20">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold tracking-wide text-[var(--muted-foreground)]">
        <Search className="h-3.5 w-3.5" />
        404 — Not found
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
        This page doesn’t exist
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)]">
        The link may be outdated or the page may have moved. Use one of the options below to get back on track.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
        >
          Go to homepage
          <ArrowRight className="h-4 w-4 opacity-60" />
        </Link>
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)]"
        >
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/auth/sign-up"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
        >
          Sign up
          <ArrowRight className="h-4 w-4 opacity-60" />
        </Link>
      </div>
    </main>
  );
}
