import Link from 'next/link';

interface PublicPageTemplateProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
}

export function PublicPageTemplate({
  eyebrow,
  title,
  description,
  bullets,
  primaryCta,
  secondaryCta,
}: PublicPageTemplateProps) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-relaxed text-[var(--muted-foreground)]">
        {description}
      </p>

      <ul className="mt-8 space-y-3">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)]"
          >
            {bullet}
          </li>
        ))}
      </ul>

      {(primaryCta || secondaryCta) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {primaryCta && (
            <Link
              href={primaryCta.href}
              className="inline-flex items-center rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)]"
            >
              {primaryCta.label}
            </Link>
          )}
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      )}

      {/* TODO: Replace template content with real page copy, visuals, and interactive elements */}
      <div className="mt-12 rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 text-center">
        <p className="text-xs text-[var(--muted-foreground)]">
          This page is under development. Full content coming soon.
        </p>
      </div>
    </section>
  );
}
