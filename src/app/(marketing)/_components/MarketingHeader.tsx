'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/product/overview', label: 'Product' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/pricing/plans', label: 'Pricing' },
  { href: '/developers/quickstart', label: 'Developers' },
  { href: '/resources/docs', label: 'Resources' },
  { href: '/company/about', label: 'Company' },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`fixed inset-x-6 top-0 z-50 mx-auto mt-3 max-w-[1400px] rounded-2xl px-6 transition-all duration-500 ${
        transparent
          ? 'bg-[var(--brand)]/100 backdrop-blur-xl shadow-lg shadow-[var(--brand)]/10'
          : 'border border-[var(--brand)]/10 bg-[var(--brand)]/[0.04] backdrop-blur-xl'
      }`}
    >
      <div className="relative flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={transparent ? '/RuleKit-White.svg' : '/RuleKit-Slate-Blue.svg'}
            alt="RuleKit"
            width={116}
            height={24}
            className="h-9 w-auto transition-opacity duration-300"
            priority
          />
          <span className={`text-lg font-semibold tracking-tight transition-colors duration-300 ${
            transparent ? 'text-white' : 'text-slate-900'
          }`}>
            RuleKit
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-300 ${
                transparent
                  ? 'text-white/85 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/auth/sign-in"
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
              transparent
                ? 'border-white/25 text-white hover:border-white/40 hover:bg-white/10'
                : 'border-[var(--brand)]/15 text-slate-700 hover:bg-[var(--brand)]/[0.06]'
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${
              transparent
                ? 'bg-white text-[var(--brand)] hover:bg-white/90'
                : 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] hover:shadow-[0_12px_30px_-14px_rgba(43,76,126,0.75)]'
            }`}
          >
            Start for free
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors lg:hidden ${
            transparent
              ? 'text-white hover:bg-white/10'
              : 'text-slate-700 hover:bg-[var(--brand)]/[0.06]'
          }`}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-2">
            <Link
              href="/auth/sign-in"
              className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-center text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="flex-1 rounded-lg bg-[var(--brand)] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[var(--brand-hover)]"
            >
              Start for free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
