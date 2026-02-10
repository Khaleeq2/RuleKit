'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Coins,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
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
import { Run, Environment, RunTrigger, ENVIRONMENTS } from '@/app/lib/types';
import { formatRelativeTime } from '@/app/lib/time-utils';

// ============================================
// Runs Tab (Rulebook-specific)
// ============================================

export default function RulebookRunsPage() {
  const params = useParams();
  const rulebookId = params.id as string;

  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [envFilter, setEnvFilter] = useState<'all' | Environment>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail'>('all');

  // Load runs
  useEffect(() => {
    const loadRuns = async () => {
      try {
        const runsData = await runsRepo.list({
          rulebookId,
          environment: envFilter === 'all' ? undefined : envFilter,
          limit: 100,
        });
        
        let filtered = runsData;
        if (statusFilter !== 'all') {
          filtered = runsData.filter(r => r.output.verdict === statusFilter);
        }
        
        setRuns(filtered);
      } catch (error) {
        console.error('Failed to load runs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRuns();
  }, [rulebookId, envFilter, statusFilter]);

  const handleRefresh = async () => {
    setIsLoading(true);
    const runsData = await runsRepo.list({
      rulebookId,
      environment: envFilter === 'all' ? undefined : envFilter,
      limit: 100,
    });
    
    let filtered = runsData;
    if (statusFilter !== 'all') {
      filtered = runsData.filter(r => r.output.verdict === statusFilter);
    }
    
    setRuns(filtered);
    setIsLoading(false);
  };

  // Stats
  const stats = {
    total: runs.length,
    passed: runs.filter(r => r.output.verdict === 'pass').length,
    failed: runs.filter(r => r.output.verdict === 'fail').length,
    avgLatency: runs.length > 0 
      ? Math.round(runs.reduce((sum, r) => sum + r.latencyMs, 0) / runs.length)
      : 0,
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-medium text-[var(--foreground)] tracking-[-0.01em]">Runs</h2>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
            Execution history for this rulebook
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/runs">
              View all runs
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total runs" value={stats.total} />
        <StatCard label="Passed" value={stats.passed} variant="success" />
        <StatCard label="Failed" value={stats.failed} variant="error" />
        <StatCard label="Avg latency" value={`${stats.avgLatency}ms`} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--muted-foreground)]" />
          <span className="text-sm text-[var(--muted-foreground)]">Filters:</span>
        </div>
        <Select value={envFilter} onValueChange={(v) => setEnvFilter(v as any)}>
          <SelectTrigger className="w-[150px]">
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
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All results</SelectItem>
            <SelectItem value="pass">Passed</SelectItem>
            <SelectItem value="fail">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Runs list */}
      {runs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-[var(--muted-foreground)]">
              No runs found matching your filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {runs.map((run) => (
            <RunRow key={run.id} run={run} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Stat Card
// ============================================

function StatCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number | string;
  variant?: 'default' | 'success' | 'error';
}) {
  const colorClass = {
    default: 'text-[var(--foreground)]',
    success: 'text-[var(--success)]',
    error: 'text-[var(--destructive)]',
  }[variant];

  return (
    <Card>
      <CardContent className="py-4">
        <p className={`text-2xl font-semibold ${colorClass}`}>{value}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      </CardContent>
    </Card>
  );
}

// ============================================
// Run Row
// ============================================

function RunRow({ run }: { run: Run }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const triggerLabels: Record<RunTrigger, string> = {
    api: 'API',
    test: 'Test',
    manual: 'Manual',
    webhook: 'Webhook',
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            <CardContent className="py-3">
              <div className="flex items-center gap-4">
                {/* Status icon */}
                {run.output.verdict === 'pass' ? (
                  <CheckCircle2 className="w-5 h-5 text-[var(--success)] flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-[var(--destructive)] flex-shrink-0" />
                )}

                {/* Time */}
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {formatRelativeTime(run.createdAt).relative}
                  </p>
                </div>

                {/* Environment */}
                <Badge variant="outline" className="capitalize flex-shrink-0">
                  {run.environment}
                </Badge>

                {/* Version */}
                <span className="text-sm font-mono text-[var(--muted-foreground)] flex-shrink-0">
                  v{run.versionNumber}
                </span>

                {/* Reason */}
                <p className="text-sm text-[var(--muted-foreground)] truncate flex-1 min-w-0">
                  {run.output.reason}
                </p>

                {/* Trigger */}
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {triggerLabels[run.trigger]}
                </Badge>

                {/* Latency */}
                <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] flex-shrink-0 w-16 justify-end">
                  <Clock className="w-3 h-3" />
                  {run.latencyMs}ms
                </div>

                {/* Credits */}
                <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] flex-shrink-0 w-12 justify-end">
                  <Coins className="w-3 h-3" />
                  {run.creditsActual}
                </div>

                {/* Expand indicator */}
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-6 pb-4 border-t border-[var(--border)] pt-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Input */}
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2">Input</p>
                <pre className="p-3 rounded-lg bg-[var(--muted)] text-xs font-mono overflow-auto max-h-48">
                  {JSON.stringify(run.input, null, 2)}
                </pre>
              </div>

              {/* Output */}
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2">Output</p>
                <pre className="p-3 rounded-lg bg-[var(--muted)] text-xs font-mono overflow-auto max-h-48">
                  {JSON.stringify(run.output, null, 2)}
                </pre>
              </div>
            </div>

            {/* Execution trace */}
            {run.executionTrace && run.executionTrace.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2">Execution Trace</p>
                <div className="space-y-1">
                  {run.executionTrace.map((step, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded text-sm ${
                        step.matched
                          ? 'bg-[var(--primary)]/5 border border-[var(--primary)]/20'
                          : 'bg-[var(--muted)]/50'
                      }`}
                    >
                      {step.matched ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[var(--muted-foreground)]/30" />
                      )}
                      <span className="font-medium">{step.ruleName}</span>
                      {step.matched && step.reason && (
                        <span className="text-[var(--muted-foreground)]">→ {step.reason}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-4 flex items-center gap-6 text-xs text-[var(--muted-foreground)]">
              <span>Run ID: <code className="font-mono">{run.id}</code></span>
              {run.firedRuleName && (
                <span>Fired rule: <strong>{run.firedRuleName}</strong></span>
              )}
              <span>Credits: {run.creditsEstimate} estimated, {run.creditsActual} actual</span>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
