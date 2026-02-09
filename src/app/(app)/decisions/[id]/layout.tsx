'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Upload,
  LayoutDashboard,
  FileCode,
  ListChecks,
  TestTube,
  Code,
  Coins,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { decisionsRepo } from '@/app/lib/decisions';
import { versionsRepo, deploymentsRepo } from '@/app/lib/versions';
import { Decision, Version, Environment, ENVIRONMENTS } from '@/app/lib/types';

// ============================================
// Studio Tabs
// ============================================

const STUDIO_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '' },
  { id: 'schema', label: 'Schema', icon: FileCode, href: '/schema' },
  { id: 'rules', label: 'Rules', icon: ListChecks, href: '/rules' },
  { id: 'tests', label: 'Tests', icon: TestTube, href: '/tests' },
  { id: 'api', label: 'API', icon: Code, href: '/api' },
] as const;

// ============================================
// Decision Studio Layout
// ============================================

export default function DecisionStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const decisionId = params.id as string;

  const [decision, setDecision] = useState<Decision | null>(null);
  const [latestVersion, setLatestVersion] = useState<Version | null>(null);
  const [selectedEnv, setSelectedEnv] = useState<Environment>('draft');
  const [isLoading, setIsLoading] = useState(true);

  // Load decision data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [decisionData, versions] = await Promise.all([
          decisionsRepo.getById(decisionId),
          versionsRepo.listByDecisionId(decisionId),
        ]);

        setDecision(decisionData);
        setLatestVersion(versions[0] || null);
      } catch (error) {
        console.error('Failed to load decision:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const unsubscribe = decisionsRepo.subscribe(() => {
      loadData();
    });

    return unsubscribe;
  }, [decisionId]);

  // Determine active tab
  const getActiveTabId = () => {
    const basePath = `/decisions/${decisionId}`;
    if (pathname === basePath) return 'overview';
    
    for (const tab of STUDIO_TABS) {
      if (tab.href && pathname === `${basePath}${tab.href}`) {
        return tab.id;
      }
    }
    return 'overview';
  };

  const activeTabId = getActiveTabId();

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-pulse text-[var(--muted-foreground)]">Loading...</div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Decision not found
          </h2>
          <p className="text-[var(--muted-foreground)] mb-4">
            The decision you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/decisions">Back to decisions</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
        <div className="min-h-full flex flex-col">
          {/* Studio Header — layered glass surface */}
          <header className="sticky top-0 z-20 border-b border-[var(--border)]/60 bg-[var(--card)]/95 backdrop-blur-sm surface-grain">
            <div className="max-w-[1400px] mx-auto px-6">
              {/* Top Row */}
              <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8" asChild>
                        <Link href="/decisions">
                          <ArrowLeft className="w-4 h-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Back to rules</TooltipContent>
                  </Tooltip>

                  <div className="flex items-center gap-2.5">
                    <h1 className="text-[15px] font-bold text-[var(--foreground)] tracking-tight">
                      {decision.name}
                    </h1>
                    <StatusBadge status={decision.status} />
                    {latestVersion && (
                      <span className="data-mono text-[11px] text-[var(--muted-foreground)]/50 px-1.5 py-0.5 rounded bg-[var(--muted)]/50">
                        v{latestVersion.versionNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Credits — quiet, informational */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] text-[var(--muted-foreground)]/50">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="data-mono">~1 credit/run</span>
                  </div>

                  <Button variant="outline" size="sm" className="h-8 text-[12px] font-medium">
                    <Play className="w-3.5 h-3.5" />
                    Run test
                  </Button>

                  <Button size="sm" className="h-8 text-[12px] font-medium bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white">
                    <Upload className="w-3.5 h-3.5" />
                    Make Live
                  </Button>
                </div>
              </div>

              {/* Tab Navigation — refined underline, purposeful spacing */}
              <nav className="flex items-center gap-0.5 -mb-px">
                {STUDIO_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTabId === tab.id;
                  const href = `/decisions/${decisionId}${tab.href}`;

                  return (
                    <Link
                      key={tab.id}
                      href={href}
                      className={`
                        flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium border-b-[1.5px] transition-all duration-200
                        ${isActive
                          ? 'text-[var(--foreground)] border-[var(--foreground)]'
                          : 'text-[var(--muted-foreground)]/60 border-transparent hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)]/20'
                        }
                      `}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? '' : 'opacity-50'}`} />
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          {/* Tab Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
    </TooltipProvider>
  );
}

// ============================================
// Sub-Components
// ============================================

function StatusBadge({ status }: { status: Decision['status'] }) {
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
