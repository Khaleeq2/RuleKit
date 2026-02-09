import type { Metadata } from 'next';
import { publicMetadataBase } from './_lib/public-metadata';
import { MarketingHeader } from './_components/MarketingHeader';
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: publicMetadataBase,
  title: {
    default: 'RuleKit',
    template: '%s | RuleKit',
  },
  description:
    'RuleKit is a self-serve rules engine to define, test, deploy, and audit decision logic.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Programmatic ambient blobs — fixed to viewport, covers entire page */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background: [
            'radial-gradient(ellipse 45% 40% at 8% 20%, rgba(43,76,126,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 35% 35% at 85% 12%, rgba(74,123,199,0.05) 0%, transparent 70%)',
            'radial-gradient(ellipse 30% 45% at 5% 75%, rgba(61,107,171,0.05) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 30% at 90% 80%, rgba(43,76,126,0.04) 0%, transparent 70%)',
            'radial-gradient(ellipse 25% 25% at 50% 50%, rgba(74,123,199,0.02) 0%, transparent 70%)',
            'radial-gradient(ellipse 20% 20% at 30% 90%, rgba(43,76,126,0.03) 0%, transparent 70%)',
          ].join(', '),
        }}
      />

      <div className="relative z-10">
        <MarketingHeader />

        <main className="pt-16">{children}</main>

      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-8 text-sm text-[var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} RuleKit. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-[var(--foreground)]">Contact</Link>
            <Link href="/legal/terms" className="hover:text-[var(--foreground)]">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-[var(--foreground)]">Privacy</Link>
            <Link href="/legal/security" className="hover:text-[var(--foreground)]">Security</Link>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
