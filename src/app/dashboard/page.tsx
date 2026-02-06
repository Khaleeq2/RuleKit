'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BookOpen,
  FolderOpen,
  Plus,
  Zap,
} from 'lucide-react';
import { AskAssistant } from '@/app/dashboard/_components/AskAssistant';
import { Badge } from '@/app/components/ui/badge';
import { formatRelativeTime } from '@/app/lib/time-utils';

interface Stats {
  totalRules: number;
  totalAssets: number;
  validations: number;
  passRate: number;
  passRateTrend: number;
  decisionsTrend: number;
  lastRuleUpdate?: string;
  lastAssetUpload?: string;
}

interface ValidationResult {
  id: string;
  assetName: string;
  status: 'passed' | 'failed';
  passedRules: number;
  failedRules: number;
  timestamp: string;
  ruleName?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalRules: 0,
    totalAssets: 0,
    validations: 0,
    passRate: 0,
    passRateTrend: 0,
    decisionsTrend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [validations, setValidations] = useState<ValidationResult[]>([]);

  useEffect(() => {
    loadStats();
    loadValidations();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadValidations = async () => {
    try {
      const res = await fetch('/api/validations');
      if (!res.ok) return;
      const data = await res.json();
      setValidations(Array.isArray(data) ? data : []);
    } catch {
      setValidations([]);
    }
  };

  const sortedValidations = validations
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Show up to 5 recent decisions
  const recentDecisions = sortedValidations.slice(0, 5);
  const mostRecentValidation = recentDecisions[0];
  const remainingDecisions = recentDecisions.slice(1);
  const failedDecisions = sortedValidations.filter((v) => v.status === 'failed');
  const failedCount = failedDecisions.length;
  const topFailedRules = Array.from(
    failedDecisions.reduce((acc, v) => {
      const key = (v.ruleName || 'Rules execution').trim();
      acc.set(key, (acc.get(key) || 0) + 1);
      return acc;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="px-8 py-10 max-w-[1200px] xl:max-w-[1280px] mx-auto">
      <AskAssistant
        loading={loading}
        stats={stats}
        validations={sortedValidations}
        refreshValidations={loadValidations}
        refreshStats={loadStats}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
          At a glance
        </div>
        <Link
          href="/dashboard/validation"
          prefetch
          className="text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          View all decisions
        </Link>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Link href="/dashboard/validation" prefetch className="block">
          <div
            className={`bg-[var(--card)] p-6 rounded-xl border shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 cursor-pointer ${
              !loading && stats.passRateTrend <= -5
                ? 'border-red-200/80 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/10'
                : 'border-[var(--border)]'
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                {loading ? <span className="inline-block w-16 h-10 bg-[var(--muted)] rounded animate-pulse" /> : `${stats.passRate}%`}
              </span>
              {!loading && stats.passRateTrend !== 0 && (
                <div className="flex flex-col">
                  <span className={`inline-flex items-center text-xs ${
                    stats.passRateTrend > 0 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stats.passRateTrend > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {stats.passRateTrend > 0 ? '+' : ''}{stats.passRateTrend}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">vs last week</span>
                </div>
              )}
            </div>
            <div className="mt-3 text-xs tracking-wide uppercase text-[var(--muted-foreground)]">Pass rate</div>
          </div>
        </Link>
        <Link href="/dashboard/validation" prefetch className="block">
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 cursor-pointer">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                {loading ? <span className="inline-block w-12 h-10 bg-[var(--muted)] rounded animate-pulse" /> : stats.validations}
              </span>
              {!loading && stats.decisionsTrend !== 0 && (
                <div className="flex flex-col">
                  <span className={`inline-flex items-center text-xs ${
                    stats.decisionsTrend > 0 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stats.decisionsTrend > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {stats.decisionsTrend > 0 ? '+' : ''}{stats.decisionsTrend}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">vs last week</span>
                </div>
              )}
            </div>
            <div className="mt-3 text-xs tracking-wide uppercase text-[var(--muted-foreground)]">Decisions</div>
          </div>
        </Link>
        <Link href="/dashboard/rules" prefetch className="block">
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 cursor-pointer">
            <div className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {loading ? <span className="inline-block w-10 h-10 bg-[var(--muted)] rounded animate-pulse" /> : stats.totalRules}
            </div>
            <div className="mt-3 text-xs tracking-wide uppercase text-[var(--muted-foreground)]">Rules</div>
          </div>
        </Link>
        <Link href="/dashboard/assets" prefetch className="block">
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 cursor-pointer">
            <div className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {loading ? <span className="inline-block w-10 h-10 bg-[var(--muted)] rounded animate-pulse" /> : stats.totalAssets}
            </div>
            <div className="mt-3 text-xs tracking-wide uppercase text-[var(--muted-foreground)]">Assets</div>
          </div>
        </Link>
      </div>

      {/* Recent Decisions */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]">
        <div className="p-6 border-b border-[var(--border)] spotlight-neutral rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-wide uppercase text-[var(--muted-foreground)]">Recent Decisions</div>
            {recentDecisions.length > 0 && (
              <Link
                href="/dashboard/validation"
                prefetch
                className="text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                View all
              </Link>
            )}
          </div>
        </div>

        {/* Needs attention summary (scales for 10+ failures) */}
        {failedCount > 0 && (
          <div className="px-6 py-3 border-b border-[var(--border)] bg-red-50/50 dark:bg-red-950/10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Needs attention: {failedCount} failed decision{failedCount === 1 ? '' : 's'}
                  </p>
                </div>
                {failedCount > 10 && topFailedRules.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-6">
                    {topFailedRules.map(([name, count]) => (
                      <Badge
                        key={name}
                        variant="outline"
                        className="border-red-200/70 dark:border-red-900/40 bg-white/60 dark:bg-transparent text-red-800 dark:text-red-200"
                      >
                        {name} · {count}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href="/dashboard/validation"
                prefetch
                className="text-xs font-medium text-red-700 dark:text-red-300 hover:opacity-80 transition-opacity flex-shrink-0 mt-0.5"
              >
                View failures
              </Link>
            </div>
          </div>
        )}
        
        {mostRecentValidation ? (
          <div className="space-y-0">
            {/* Most Recent Decision - Expanded 
                Failed decision prominence: 
                - Red left border accent (border-l-4 border-l-red-500)
                - Larger badge size (px-2.5 py-1 vs px-2 py-0.5)
                - Bolder badge text (font-semibold)
                - Red AlertCircle icon
            */}
            <div className={`p-6 ${mostRecentValidation.status === 'failed' ? 'border-l-4 border-l-red-500' : ''}`}>
              <div className="flex items-start justify-between gap-8">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        mostRecentValidation.status === 'passed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {mostRecentValidation.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        mostRecentValidation.status === 'passed'
                          ? 'bg-emerald-500/5 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'bg-red-500/5 text-red-700 border-red-500/20 dark:text-red-400 dark:border-red-500/30'
                      }`}
                    >
                      {mostRecentValidation.status === 'passed' ? 'Passed' : 'Failed'}
                    </div>
                  </div>

                  <div className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                    {mostRecentValidation.ruleName || 'Rules execution'}
                  </div>
                  <div className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {mostRecentValidation.assetName}
                  </div>

                  {(() => {
                    const timeData = formatRelativeTime(mostRecentValidation.timestamp);
                    return (
                      <div className="mt-6 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                        <span className="inline-flex items-center gap-1.5" title={timeData.absolute}>
                          <Clock className="w-3.5 h-3.5" />
                          {timeData.relative}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <Link
                  href={`/dashboard/validation#validation-${mostRecentValidation.id}`}
                  prefetch
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] hover:opacity-70 transition-opacity"
                >
                  Open
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Remaining Decisions - Compact List
                Failed decisions have red left border accent and red status dot for quick identification
            */}
            {remainingDecisions.length > 0 && (
              <div className="border-t border-[var(--border)]">
                {remainingDecisions.map((v) => {
                  const timeData = formatRelativeTime(v.timestamp);
                  return (
                    <Link
                      key={v.id}
                      href={`/dashboard/validation#validation-${v.id}`}
                      prefetch
                      className={`flex items-center justify-between gap-4 p-4 hover:bg-[var(--muted)]/30 transition-all group border-b border-[var(--border)] last:border-b-0 ${
                        v.status === 'failed' ? 'border-l-4 border-l-red-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            v.status === 'passed' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        <span className="text-sm font-medium text-[var(--foreground)] truncate">
                          {v.ruleName || 'Rules execution'}
                        </span>
                        <span className="text-sm text-[var(--muted-foreground)] truncate hidden sm:block">
                          {v.assetName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-[var(--muted-foreground)]" title={timeData.absolute}>
                          {timeData.relative}
                        </span>
                        <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 flex items-center justify-between gap-6">
            <div className="text-[var(--muted-foreground)]">No decisions yet</div>
            <Link
              href="/dashboard/validation"
              prefetch
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)] hover:opacity-70 transition-opacity"
            >
              <Zap className="w-4 h-4" />
              Execute Rules
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 pt-8 border-t border-[var(--border)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative flex items-center gap-4 p-5 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)]/20 transition-colors group">
            <Link href="/dashboard/rules" prefetch className="absolute inset-0 z-0" aria-label="View all rules" />
            <div className="w-10 h-10 rounded-md bg-[var(--muted)] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[var(--foreground)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[var(--foreground)]">Rules</div>
              <div className="text-sm text-[var(--muted-foreground)]">{stats.totalRules} defined</div>
              {stats.lastRuleUpdate && (
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Last updated {formatRelativeTime(stats.lastRuleUpdate).relative}
                </div>
              )}
            </div>
            <Link
              href="/dashboard/rules/new"
              prefetch
              className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Rule
            </Link>
            <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity absolute right-5" />
          </div>
          <div className="relative flex items-center gap-4 p-5 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)]/20 transition-colors group">
            <Link href="/dashboard/assets" prefetch className="absolute inset-0 z-0" aria-label="View all assets" />
            <div className="w-10 h-10 rounded-md bg-[var(--muted)] flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-[var(--foreground)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[var(--foreground)]">Assets</div>
              <div className="text-sm text-[var(--muted-foreground)]">{stats.totalAssets} uploaded</div>
              {stats.lastAssetUpload && (
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Last upload {formatRelativeTime(stats.lastAssetUpload).relative}
                </div>
              )}
            </div>
            <Link
              href="/dashboard/assets"
              prefetch
              className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload Asset
            </Link>
            <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity absolute right-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
