'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  /** Page title displayed prominently */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Breadcrumb path - array of { label, href } */
  breadcrumb?: { label: string; href?: string }[];
  /** Back navigation - if provided, shows ghost back button */
  backHref?: string;
  /** Tooltip for back button */
  backLabel?: string;
  /** Primary action button (only one filled button per page) */
  primaryAction?: ReactNode;
  /** Secondary actions (outline/ghost buttons) */
  secondaryActions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  backHref,
  backLabel = 'Back',
  primaryAction,
  secondaryActions,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {/* Top row: Back button + Primary action */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          {/* Ghost back button - 40px hit area, visually light */}
          {backHref && (
            <Link
              href={backHref}
              className="w-10 h-10 -ml-2 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)] transition-all duration-200"
              title={backLabel}
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
          
          {/* Page title */}
          <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
            {title}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {secondaryActions}
          {primaryAction}
        </div>
      </div>

      {/* Breadcrumb (optional) */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] ml-11">
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-[var(--border)]">/</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--foreground)]/70">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Subtitle (optional) */}
      {subtitle && !breadcrumb && (
        <p className="text-[var(--muted-foreground)] mt-1 ml-11">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Simple page header without back button - for top-level pages
 */
export function PageHeaderSimple({
  title,
  subtitle,
  primaryAction,
  secondaryActions,
}: {
  title: string;
  subtitle?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[var(--muted-foreground)] mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {secondaryActions}
        {primaryAction}
      </div>
    </div>
  );
}
