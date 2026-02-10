'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  LayoutDashboard,
  List,
  FileCode,
  TestTube,
  Code,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { rulebooksRepo } from '@/app/lib/rulebooks';
import { Rulebook } from '@/app/lib/types';

// ============================================
// Rulebook Detail Layout
// ============================================

export default function RulebookStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const rulebookId = params.id as string;

  const [rulebook, setRulebook] = useState<Rulebook | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rulebookData = await rulebooksRepo.getById(rulebookId);
        setRulebook(rulebookData);
      } catch (error) {
        console.error('Failed to load rulebook:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const unsubscribe = rulebooksRepo.subscribe(() => {
      loadData();
    });

    return unsubscribe;
  }, [rulebookId]);

  // Determine navigation context
  const basePath = `/rulebooks/${rulebookId}`;
  const isOverview = pathname === basePath;
  const isSecondaryPage = !isOverview;

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-pulse text-[var(--muted-foreground)]">Loading...</div>
      </div>
    );
  }

  if (!rulebook) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Rulebook not found
          </h2>
          <p className="text-[var(--muted-foreground)] mb-4">
            The rulebook you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/rulebooks">Back to rulebooks</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)]/60 bg-[var(--card)]/95 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="w-8 h-8" asChild>
                <Link href={isOverview ? '/rulebooks' : basePath}>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>

              <div className="flex items-center gap-2.5">
                <h1 className="text-[15px] font-bold text-[var(--foreground)] tracking-tight">
                  {rulebook.name}
                </h1>
                <StatusBadge status={rulebook.status} />
              </div>
            </div>

          </div>

          {/* Tab navigation — horizontally scrollable on mobile */}
          <nav className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mb-px" role="tablist">
            {[
              { label: 'Overview', href: basePath, icon: LayoutDashboard, match: pathname === basePath },
              { label: 'Rules', href: `${basePath}/rules`, icon: List, match: pathname === `${basePath}/rules` },
              { label: 'Schema', href: `${basePath}/schema`, icon: FileCode, match: pathname === `${basePath}/schema` },
              { label: 'Tests', href: `${basePath}/tests`, icon: TestTube, match: pathname === `${basePath}/tests` },
              { label: 'API', href: `${basePath}/api`, icon: Code, match: pathname === `${basePath}/api` },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  role="tab"
                  aria-selected={tab.match}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors
                    ${tab.match
                      ? 'border-[var(--brand)] text-[var(--brand)]'
                      : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border)]'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function StatusBadge({ status }: { status: Rulebook['status'] }) {
  if (status === 'published') {
    return (
      <span className="badge-tactile bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
        <span className="w-[5px] h-[5px] rounded-full bg-emerald-500 animate-pulse-soft" />
        Published
      </span>
    );
  }
  return (
    <span className="badge-tactile bg-[var(--muted)] text-[var(--muted-foreground)]/70 border-[var(--border)]">
      Draft
    </span>
  );
}
