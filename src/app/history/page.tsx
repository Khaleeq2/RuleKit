'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Coins,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/app/components/ui/collapsible';
import { runsRepo } from '@/app/lib/runs';
import { decisionsRepo } from '@/app/lib/decisions';
import { Run, Decision, Environment, RunTrigger, ENVIRONMENTS } from '@/app/lib/types';
import { formatRelativeTime } from '@/app/lib/time-utils';

// ============================================
// History Page
// ============================================

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [envFilter, setEnvFilter] = useState<'all' | Environment>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail'>('all');

  // Load runs and decisions
  useEffect(() => {
    const loadData = async () => {
      try {
        const [runsData, decisionsData] = await Promise.all([
          runsRepo.list({ limit: 200 }),
          decisionsRepo.list(),
        ]);
        setRuns(runsData);
        setDecisions(decisionsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters
  const filteredRuns = runs.filter((run) => {
    if (decisionFilter !== 'all' && run.decisionId !== decisionFilter) return false;
    if (envFilter !== 'all' && run.environment !== envFilter) return false;
    if (statusFilter !== 'all' && run.output.decision !== statusFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (
        !run.decisionName.toLowerCase().includes(query) &&
        !run.output.reason.toLowerCase().includes(query) &&
        !run.id.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    const runsData = await runsRepo.list({ limit: 200 });
    setRuns(runsData);
    setIsLoading(false);
  };

  // Stats
  const stats = {
    total: filteredRuns.length,
    passed: filteredRuns.filter(r => r.output.decision === 'pass').length,
    failed: filteredRuns.filter(r => r.output.decision === 'fail').length,
    avgLatency: filteredRuns.length > 0
      ? Math.round(filteredRuns.reduce((sum, r) => sum + r.latencyMs, 0) / filteredRuns.length)
      : 0,
    totalCredits: filteredRuns.reduce((sum, r) => sum + r.creditsActual, 0),
  };

  return (
    <div className="min-h-full">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-[length:var(--font-size-h1)] font-semibold text-[var(--foreground)] tracking-tight leading-[var(--line-height-h1)]">
              History
            </h1>
            <p className="text-[length:var(--font-size-body)] text-[var(--muted-foreground)] mt-1 leading-[var(--line-height-body)]">
              All rule runs across your account
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
          <StatCard label="Total runs" value={stats.total} />
          <StatCard label="Passed" value={stats.passed} icon={CheckCircle2} variant="success" />
          <StatCard label="Failed" value={stats.failed} icon={XCircle} variant="error" />
          <StatCard label="Avg latency" value={`${stats.avgLatency}ms`} icon={Clock} />
          <StatCard label="Credits used" value={stats.totalCredits} icon={Coins} />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by rule, reason, or ID..."
              className="pl-10 h-11 bg-[var(--card)] border-[var(--border)] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)] focus:shadow-[0_4px_12px_-4px_rgb(0_0_0/0.1)] transition-all"
            />
          </div>
          <Select value={decisionFilter} onValueChange={setDecisionFilter}>
            <SelectTrigger className="w-full md:w-[240px] h-11 bg-[var(--card)] border-[var(--border)] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]">
              <SelectValue placeholder="All decisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rules</SelectItem>
              {decisions.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={envFilter} onValueChange={(v) => setEnvFilter(v as any)}>
            <SelectTrigger className="w-full md:w-[180px] h-11 bg-[var(--card)] border-[var(--border)] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All environments</SelectItem>
              {ENVIRONMENTS.map((env) => (
                <SelectItem key={env} value={env} className="capitalize">
                  {env === 'draft' ? 'Draft' : 'Live'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full md:w-[160px] h-11 bg-[var(--card)] border-[var(--border)] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]">
              <SelectValue placeholder="Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All results</SelectItem>
              <SelectItem value="pass">Passed</SelectItem>
              <SelectItem value="fail">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Runs list */}
        {isLoading ? (
          <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden">
            <div className="hidden md:grid grid-cols-[24px_120px_1fr_92px_80px_90px_80px_24px] gap-4 items-center px-4 py-3 bg-[var(--muted)]/50 text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">
              <span></span>
              <span>Time</span>
              <span>Rule</span>
              <span>Env</span>
              <span>Result</span>
              <span className="text-right">Latency</span>
              <span className="text-right">Credits</span>
              <span></span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {[1, 2, 3, 4, 5].map((i) => (
                <RunRowSkeleton key={i} />
              ))}
            </div>
          </Card>
        ) : filteredRuns.length === 0 ? (
          <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-4" />
              <p className="text-[var(--muted-foreground)]">
                {runs.length === 0
                  ? 'No runs yet. Runs will appear here when you execute rules.'
                  : 'No runs match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden">
            <div className="hidden md:grid grid-cols-[24px_120px_1fr_92px_80px_90px_80px_24px] gap-4 items-center px-4 py-3 bg-[var(--muted)]/50 text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">
              <span></span>
              <span>Time</span>
              <span>Rule</span>
              <span>Env</span>
              <span>Result</span>
              <span className="text-right">Latency</span>
              <span className="text-right">Credits</span>
              <span></span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {filteredRuns.map((run, idx) => (
                <RunRow key={run.id} run={run} isEven={idx % 2 === 0} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================
// Stat Card
// ============================================

function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: {
  label: string;
  value: number | string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'error';
}) {
  const colorClass = {
    default: 'text-[var(--foreground)]',
    success: 'text-[var(--success)]',
    error: 'text-[var(--destructive)]',
  }[variant];

  return (
    <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--muted-foreground)]/30 hover:shadow-[0_4px_12px_-4px_rgb(0_0_0/0.1)] transition-all duration-200">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">
          {label}
        </span>
        {Icon && (
          <Icon className={`w-4 h-4 ${variant === 'success' ? 'text-emerald-600' : variant === 'error' ? 'text-red-600' : 'text-[var(--muted-foreground)]'}`} />
        )}
      </div>
      <div className={`text-[28px] font-semibold ${colorClass}`}>{value}</div>
    </div>
  );
}

// ============================================
// Run Row
// ============================================

function RunRowSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[24px_120px_1fr_92px_80px_90px_80px_24px] gap-4 items-center px-4 py-4">
      <Skeleton className="h-5 w-5 rounded-full" />
      <Skeleton className="h-4 w-20" />
      <div className="min-w-0">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-[70%]" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full hidden md:block" />
      <Skeleton className="h-5 w-16 rounded-full hidden md:block" />
      <Skeleton className="h-4 w-16 ml-auto hidden md:block" />
      <Skeleton className="h-4 w-12 ml-auto hidden md:block" />
      <Skeleton className="h-4 w-4 ml-auto hidden md:block" />
    </div>
  );
}

function RunRow({ run, isEven }: { run: Run; isEven: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const triggerLabels: Record<RunTrigger, string> = {
    api: 'API',
    test: 'Test',
    manual: 'Manual',
    webhook: 'Webhook',
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={`${isEven ? 'bg-[var(--card)]' : 'bg-[var(--muted)]/20'}`}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left hover:bg-[var(--muted)]/60 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-[24px_120px_1fr_92px_80px_90px_80px_24px] gap-4 items-center px-4 py-4">
              {run.output.decision === 'pass' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}

              <div className="text-[length:var(--font-size-body-sm)] font-medium text-[var(--foreground)]">
                {formatRelativeTime(run.createdAt).relative}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/decisions/${run.decisionId}`}
                    className="text-[length:var(--font-size-body)] font-medium text-[var(--foreground)] hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {run.decisionName}
                  </Link>
                  <span className="hidden md:inline text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] font-mono">v{run.versionNumber}</span>
                </div>
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)] truncate leading-[var(--line-height-body-sm)]">
                  {run.output.reason}
                </p>
                <div className="md:hidden mt-2 flex items-center gap-3 text-[length:var(--font-size-meta)] text-[var(--muted-foreground)]">
                  <span className="capitalize">{run.environment}</span>
                  <span className="text-[var(--muted-foreground)]/50">•</span>
                  <span>{triggerLabels[run.trigger]}</span>
                  <span className="text-[var(--muted-foreground)]/50">•</span>
                  <span>{run.latencyMs}ms</span>
                  <span className="text-[var(--muted-foreground)]/50">•</span>
                  <span>{run.creditsActual} credits</span>
                </div>
              </div>

              <div className="hidden md:block">
                <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0.5 capitalize">
                  {run.environment}
                </Badge>
              </div>

              <div className="hidden md:block">
                {run.output.decision === 'pass' ? (
                  <Badge className="rounded-full bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 font-medium dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
                    Pass
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-red-100 text-red-700 border-red-200 text-[10px] px-2 py-0.5 font-medium dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 inline-block" />
                    Fail
                  </Badge>
                )}
              </div>

              <div className="hidden md:flex justify-end text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)]">
                {run.latencyMs}ms
              </div>

              <div className="hidden md:flex justify-end text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)]">
                {run.creditsActual}
              </div>

              <div className="hidden md:flex justify-end">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                )}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-6 pb-5 border-t border-[var(--border)] pt-5 bg-[var(--background)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-[length:var(--font-size-meta)] font-medium text-[var(--muted-foreground)] uppercase tracking-[0.02em] mb-2">Input</p>
                <pre className="p-3 rounded-lg bg-[var(--muted)]/60 text-xs font-mono overflow-auto max-h-64 border border-[var(--border)]">
                  {JSON.stringify(run.input, null, 2)}
                </pre>
              </div>

              <div>
                <p className="text-[length:var(--font-size-meta)] font-medium text-[var(--muted-foreground)] uppercase tracking-[0.02em] mb-2">Output</p>
                <pre className="p-3 rounded-lg bg-[var(--muted)]/60 text-xs font-mono overflow-auto max-h-64 border border-[var(--border)]">
                  {JSON.stringify(run.output, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-[length:var(--font-size-meta)] text-[var(--muted-foreground)]">
              <span>Run ID: <code className="font-mono">{run.id}</code></span>
              <span>Trigger: <span className="font-medium text-[var(--foreground)]">{triggerLabels[run.trigger]}</span></span>
              {run.firedRuleName && (
                <span>Fired rule: <span className="font-medium text-[var(--foreground)]">{run.firedRuleName}</span></span>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
