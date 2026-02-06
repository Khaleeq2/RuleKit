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
  Rocket,
  Activity,
  Code,
  ChevronDown,
  Coins,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
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
import { AppLayout } from '@/app/components/AppLayout';
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
      <AppLayout>
        <div className="min-h-full flex items-center justify-center">
          <div className="animate-pulse text-[var(--muted-foreground)]">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!decision) {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TooltipProvider delayDuration={0}>
        <div className="min-h-full flex flex-col">
          {/* Studio Header */}
          <header className="border-b border-[var(--border)] bg-[var(--card)]">
            <div className="max-w-[1400px] mx-auto px-6">
              {/* Top Row */}
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="/decisions">
                          <ArrowLeft className="w-5 h-5" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Back to decisions</TooltipContent>
                  </Tooltip>

                  <div className="flex items-center gap-3">
                    <h1 className="text-lg font-semibold text-[var(--foreground)]">
                      {decision.name}
                    </h1>
                    <StatusBadge status={decision.status} />
                    {latestVersion && (
                      <Badge variant="outline" className="text-xs font-mono">
                        v{latestVersion.versionNumber}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Credits Estimate */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--muted)] text-sm">
                    <Coins className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span className="text-[var(--muted-foreground)]">~1 credit/run</span>
                  </div>

                  {/* Primary Actions */}
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Run test
                  </Button>

                  <Button size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Make Live
                  </Button>
                </div>
              </div>

              {/* Tab Navigation */}
              <nav className="flex items-center gap-1 -mb-px">
                {STUDIO_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTabId === tab.id;
                  const href = `/decisions/${decisionId}${tab.href}`;

                  return (
                    <Link
                      key={tab.id}
                      href={href}
                      className={`
                        flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                        ${isActive
                          ? 'text-[var(--foreground)] border-[var(--foreground)]'
                          : 'text-[var(--muted-foreground)] border-transparent hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)]/30'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
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
    </AppLayout>
  );
}

// ============================================
// Sub-Components
// ============================================

function StatusBadge({ status }: { status: Decision['status'] }) {
  if (status === 'published') {
    return (
      <Badge className="bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 text-xs">
        Published
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      Draft
    </Badge>
  );
}
