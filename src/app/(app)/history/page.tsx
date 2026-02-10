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
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
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
import { rulebooksRepo } from '@/app/lib/rulebooks';
import { sessionsRepo, type Session } from '@/app/lib/sessions';
import { Run, Rulebook, Environment, RunTrigger, ENVIRONMENTS } from '@/app/lib/types';
import { formatRelativeTime } from '@/app/lib/time-utils';

// ============================================
// History Page
// ============================================

type HistoryTab = 'sessions' | 'runs';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('sessions');
  const [runs, setRuns] = useState<Run[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [rulebooks, setRulebooks] = useState<Rulebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rulebookFilter, setRulebookFilter] = useState<string>('all');
  const [envFilter, setEnvFilter] = useState<'all' | Environment>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail'>('all');

  // Load runs, sessions, and rulebooks
  useEffect(() => {
    const loadData = async () => {
      try {
        const [runsData, sessionsData, rulebooksData] = await Promise.all([
          runsRepo.list({ limit: 200 }),
          sessionsRepo.list(),
          rulebooksRepo.list(),
        ]);
        setRuns(runsData);
        setSessions(sessionsData);
        setRulebooks(rulebooksData);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoadError('Failed to load history. Check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = sessionsRepo.subscribe(() => {
      sessionsRepo
        .list()
        .then(setSessions)
        .catch(() => {});
    });
    return unsubscribe;
  }, []);

  // Apply filters
  const filteredRuns = runs.filter((run) => {
    if (rulebookFilter !== 'all' && run.rulebookId !== rulebookFilter) return false;
    if (envFilter !== 'all' && run.environment !== envFilter) return false;
    if (statusFilter !== 'all' && run.output.verdict !== statusFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (
        !run.rulebookName.toLowerCase().includes(query) &&
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
    const [runsData, sessionsData] = await Promise.all([
      runsRepo.list({ limit: 200 }),
      sessionsRepo.list(),
    ]);
    setRuns(runsData);
    setSessions(sessionsData);
    setIsLoading(false);
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (rulebookFilter !== 'all' && s.rulebookId !== rulebookFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'pass' && s.verdict !== 'pass') return false;
      if (statusFilter === 'fail' && s.verdict !== 'fail') return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (
        !s.title.toLowerCase().includes(query) &&
        !s.rulebookName.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  // Stats — runs
  const runStats = {
    total: filteredRuns.length,
    passed: filteredRuns.filter(r => r.output.verdict === 'pass').length,
    failed: filteredRuns.filter(r => r.output.verdict === 'fail').length,
    avgLatency: filteredRuns.length > 0
      ? Math.round(filteredRuns.reduce((sum, r) => sum + r.latencyMs, 0) / filteredRuns.length)
      : 0,
    totalCredits: filteredRuns.reduce((sum, r) => sum + r.creditsActual, 0),
  };

  // Stats — sessions
  const sessionStats = {
    total: filteredSessions.length,
    passed: filteredSessions.filter(s => s.verdict === 'pass').length,
    failed: filteredSessions.filter(s => s.verdict === 'fail').length,
    totalMessages: filteredSessions.reduce((sum, s) => sum + s.messageCount, 0),
    avgMessages: filteredSessions.length > 0
      ? Math.round(filteredSessions.reduce((sum, s) => sum + s.messageCount, 0) / filteredSessions.length)
      : 0,
  };

  return (
    <div className="min-h-full">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-[-0.01em] leading-tight">
              History
            </h1>
            <p className="text-[13px] text-[var(--muted-foreground)] mt-1 leading-relaxed">
              Review past checks and their results
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {loadError && (
          <div className="mb-6 p-6 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">
            <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[var(--foreground)] mb-1 tracking-tight">
              Something went wrong
            </h3>
            <p className="text-[13px] text-[var(--muted-foreground)] mb-4">
              {loadError}
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        )}

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 mb-5 bg-[var(--muted)]/50 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'sessions'
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
            Conversations
            {sessions.length > 0 && (
              <span className="ml-1.5 text-xs text-[var(--muted-foreground)]">{sessions.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('runs')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'runs'
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
            Individual checks
            {runs.length > 0 && (
              <span className="ml-1.5 text-xs text-[var(--muted-foreground)]">{runs.length}</span>
            )}
          </button>
        </div>

        {/* Stats — adapts to active tab */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
          {activeTab === 'sessions' ? (
            <>
              <StatCard label="Conversations" value={sessionStats.total} />
              <StatCard label="Passed" value={sessionStats.passed} icon={CheckCircle2} variant="success" />
              <StatCard label="Failed" value={sessionStats.failed} icon={XCircle} variant="error" />
              <StatCard label="Total messages" value={sessionStats.totalMessages} icon={MessageSquare} />
              <StatCard label="Avg. length" value={sessionStats.avgMessages} icon={Clock} />
            </>
          ) : (
            <>
              <StatCard label="Total checks" value={runStats.total} />
              <StatCard label="Passed" value={runStats.passed} icon={CheckCircle2} variant="success" />
              <StatCard label="Failed" value={runStats.failed} icon={XCircle} variant="error" />
              <StatCard label="Avg latency" value={`${runStats.avgLatency}ms`} icon={Clock} />
              <StatCard label="Credits used" value={runStats.totalCredits} icon={Coins} />
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by rulebook name or result..."
              className="pl-10 h-11 bg-[var(--card)] border-[var(--border)] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)] focus:shadow-[0_4px_12px_-4px_rgb(0_0_0/0.1)] transition-all"
            />
          </div>
          <Select value={rulebookFilter} onValueChange={setRulebookFilter}>
            <SelectTrigger className="w-full md:w-[240px] h-11 bg-[var(--card)] border-[var(--border)] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]">
              <SelectValue placeholder="All rulebooks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rulebooks</SelectItem>
              {rulebooks.map((rb) => (
                <SelectItem key={rb.id} value={rb.id}>{rb.name}</SelectItem>
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

        {/* Sessions list */}
        {activeTab === 'sessions' && (
          isLoading ? (
            <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden">
              <div className="divide-y divide-[var(--border)]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </Card>
          ) : filteredSessions.length === 0 ? (
            <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-4" />
                <p className="text-[var(--muted-foreground)]">
                  {sessions.length === 0
                    ? 'No conversations yet. Try running a check from the Home page.'
                    : 'No conversations match your filters'}
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/home">Run your first check</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden">
              <div className="divide-y divide-[var(--border)]">
                {filteredSessions.map((session, idx) => (
                  <SessionRow key={session.id} session={session} isEven={idx % 2 === 0} />
                ))}
              </div>
            </Card>
          )
        )}

        {/* Runs list */}
        {activeTab === 'runs' && (
          isLoading ? (
            <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden">
              <div className="hidden md:grid grid-cols-[24px_120px_1fr_92px_80px_90px_80px_24px] gap-4 items-center px-4 py-3 bg-[var(--muted)]/50 text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">
                <span></span>
                <span>When</span>
                <span>Rulebook</span>
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
                <Clock className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-4" />
                <p className="text-[var(--muted-foreground)]">
                  {runs.length === 0
                    ? 'No checks yet. Results will appear here after you run a rulebook.'
                    : 'No checks match your filters'}
                </p>
                {runs.length === 0 && (
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/home">Run your first check</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden">
              <div className="hidden md:grid grid-cols-[24px_120px_1fr_92px_80px_90px_80px_24px] gap-4 items-center px-4 py-3 bg-[var(--muted)]/50 text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">
                <span></span>
                <span>When</span>
                <span>Rulebook</span>
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
          )
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
              {run.output.verdict === 'pass' ? (
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
                    href={`/rulebooks/${run.rulebookId}`}
                    className="text-[length:var(--font-size-body)] font-medium text-[var(--foreground)] hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {run.rulebookName}
                  </Link>
                  <span className="hidden md:inline text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] font-mono">v{run.versionNumber}</span>
                </div>
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)] truncate leading-[var(--line-height-body-sm)]">
                  {run.output.reason}
                </p>
                <div className="md:hidden mt-2 flex items-center gap-3 text-[length:var(--font-size-meta)] text-[var(--muted-foreground)]">
                  <span className="capitalize">{run.environment}</span>
                  <span className="text-[var(--border)]">&middot;</span>
                  <span>{triggerLabels[run.trigger]}</span>
                  <span className="text-[var(--border)]">&middot;</span>
                  <span>{run.latencyMs}ms</span>
                  <span className="text-[var(--border)]">&middot;</span>
                  <span>{run.creditsActual} credits</span>
                </div>
              </div>

              <div className="hidden md:block">
                <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0.5 capitalize">
                  {run.environment}
                </Badge>
              </div>

              <div className="hidden md:block">
                {run.output.verdict === 'pass' ? (
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

// ============================================
// Session Row
// ============================================

function SessionRow({ session, isEven }: { session: Session; isEven: boolean }) {
  const reason = session.messages.find((m: { evaluation?: { reason?: string } }) => m.evaluation)?.evaluation?.reason;

  return (
    <Link
      href={`/home?session=${session.id}`}
      aria-label={`Open session: ${session.title} — ${session.verdict === 'pass' ? 'Passed' : session.verdict === 'fail' ? 'Failed' : 'Pending'}`}
      className={`flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)]/40 hover:-translate-y-[0.5px] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30 focus-visible:ring-offset-1 transition-all duration-200 ${
        isEven ? '' : 'bg-[var(--muted)]/20'
      }`}
    >
      {/* Verdict icon */}
      <div className="flex-shrink-0" aria-hidden="true">
        {session.verdict === 'pass' ? (
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        ) : session.verdict === 'fail' ? (
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[var(--muted-foreground)]" />
          </div>
        )}
      </div>

      {/* Title + verdict badge + rulebook + reason */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--foreground)] truncate">
            {session.title}
          </p>
          {session.verdict && (
            session.verdict === 'pass' ? (
              <Badge className="rounded-full bg-emerald-100 text-emerald-700 border-emerald-200 text-[11px] px-2 py-0.5 font-semibold dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 flex-shrink-0">
                Pass
              </Badge>
            ) : (
              <Badge className="rounded-full bg-red-100 text-red-700 border-red-200 text-[11px] px-2 py-0.5 font-semibold dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 flex-shrink-0">
                Fail
              </Badge>
            )
          )}
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
          {session.rulebookName}
          <span className="mx-1.5 text-[var(--border)]">&middot;</span>
          {session.messageCount} message{session.messageCount !== 1 ? 's' : ''}
          {reason && (
            <>
              <span className="mx-1.5 text-[var(--border)]">&middot;</span>
              {reason}
            </>
          )}
        </p>
      </div>

      {/* Timestamp */}
      <div className="flex-shrink-0 text-xs text-[var(--muted-foreground)]">
        {formatRelativeTime(session.updatedAt).relative}
      </div>

      <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
    </Link>
  );
}
