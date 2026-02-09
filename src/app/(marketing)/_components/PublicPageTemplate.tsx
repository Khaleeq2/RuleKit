import Link from 'next/link';

export interface ContentSection {
  heading: string;
  body: string;
}

interface PublicPageTemplateProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  sections?: ContentSection[];
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
  sections,
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
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 text-sm text-[var(--foreground)] leading-relaxed"
          >
            {bullet}
          </li>
        ))}
      </ul>

      {sections && sections.length > 0 && (
        <div className="mt-14 space-y-10">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">
                {section.heading}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {(primaryCta || secondaryCta) && (
        <div className="mt-10 flex flex-wrap gap-3">
          {primaryCta && (
            <Link
              href={primaryCta.href}
              className="inline-flex items-center rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors"
            >
              {primaryCta.label}
            </Link>
          )}
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
