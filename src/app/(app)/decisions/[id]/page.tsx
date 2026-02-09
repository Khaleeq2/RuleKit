'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  Rocket,
  Clock,
  Coins,
  CheckCircle2,
  FileCode,
  ListChecks,
  TestTube,
  Upload,
  Code,
  ArrowRight,
  Pencil,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { decisionsRepo, schemasRepo, rulesRepo } from '@/app/lib/decisions';
import { versionsRepo, deploymentsRepo } from '@/app/lib/versions';
import { testsRepo } from '@/app/lib/tests';
import { runsRepo } from '@/app/lib/runs';
import { Decision, Schema, Rule, Version, Deployment, Test } from '@/app/lib/types';
import { formatRelativeTime } from '@/app/lib/time-utils';
import { toast } from 'sonner';

// ============================================
// Overview Tab (Decision Studio Home)
// ============================================

export default function DecisionOverviewPage() {
  const params = useParams();
  const decisionId = params.id as string;

  const [decision, setDecision] = useState<Decision | null>(null);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [latestVersion, setLatestVersion] = useState<Version | null>(null);
  const [deployments, setDeployments] = useState<Record<string, Deployment | null>>({});
  const [runStats, setRunStats] = useState<{ failures: number; avgLatency: number; creditsUsed: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          decisionData,
          schemaData,
          rulesData,
          testsData,
          versions,
          deploys,
          stats,
        ] = await Promise.all([
          decisionsRepo.getById(decisionId),
          schemasRepo.getByDecisionId(decisionId),
          rulesRepo.listByDecisionId(decisionId),
          testsRepo.listByDecisionId(decisionId),
          versionsRepo.listByDecisionId(decisionId),
          deploymentsRepo.getActiveDeployments(decisionId),
          runsRepo.getStats(decisionId),
        ]);

        setDecision(decisionData);
        setSchema(schemaData);
        setRules(rulesData);
        setTests(testsData);
        setLatestVersion(versions[0] || null);
        setDeployments(deploys);
        setRunStats({
          failures: stats.failed,
          avgLatency: stats.avgLatency,
          creditsUsed: stats.totalCredits,
        });
        setDescription(decisionData?.description || '');
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [decisionId]);

  const handleSaveDescription = async () => {
    if (!decision) return;

    try {
      await decisionsRepo.update(decisionId, { description });
      setIsEditing(false);
      toast.success('Description updated');
    } catch (error) {
      console.error('Failed to update description:', error);
      toast.error('Failed to update description');
    }
  };

  // Calculate progress
  const hasSchema = !!(schema && schema.fields.length > 0);
  const hasRules = rules.length > 0;
  const hasTests = tests.length > 0;
  const isPublished = decision?.status === 'published';
  const hasProdDeployment = !!deployments.prod;

  const completedSteps = [hasSchema, hasRules, hasTests, isPublished, hasProdDeployment].filter(Boolean).length;
  const totalSteps = 5;

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description Card */}
          <Card className="surface-grain">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-semibold tracking-tight">What this decision does</CardTitle>
                {!isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this decision evaluates and when to use it..."
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSaveDescription}>Save</Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDescription(decision?.description || '');
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[var(--muted-foreground)]">
                  {description || 'No description yet. Click edit to add one.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Health Metrics — layered surfaces, mono data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Failures (24h)"
              value={runStats?.failures || 0}
              icon={AlertTriangle}
              status={runStats?.failures && runStats.failures > 0 ? 'warning' : 'good'}
            />
            <MetricCard
              label="Last deploy"
              value={deployments.prod?.deployedAt 
                ? formatRelativeTime(deployments.prod.deployedAt).relative 
                : 'Never'}
              icon={Rocket}
              status="muted"
            />
            <MetricCard
              label="Avg latency"
              value={runStats?.avgLatency ? `${runStats.avgLatency}ms` : '—'}
              icon={Clock}
              status="muted"
            />
            <MetricCard
              label="Credits (7d)"
              value={runStats?.creditsUsed || 0}
              icon={Coins}
              status="muted"
            />
          </div>

          {/* Quick Links — tactile cards with depth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <QuickLinkCard
              href={`/decisions/${decisionId}/schema`}
              icon={FileCode}
              title="Schema"
              description={`${schema?.fields.length || 0} fields defined`}
              status={hasSchema ? 'complete' : 'incomplete'}
            />
            <QuickLinkCard
              href={`/decisions/${decisionId}/rules`}
              icon={ListChecks}
              title="Rules"
              description={`${rules.length} rules configured`}
              status={hasRules ? 'complete' : 'incomplete'}
            />
            <QuickLinkCard
              href={`/decisions/${decisionId}/tests`}
              icon={TestTube}
              title="Tests"
              description={`${tests.length} test cases`}
              status={hasTests ? 'complete' : 'incomplete'}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Progress — incomplete items first for momentum */}
          {completedSteps < totalSteps && (() => {
            const remaining = totalSteps - completedSteps;
            const allSteps = [
              { label: 'Define input schema', completed: hasSchema, href: `/decisions/${decisionId}/schema` },
              { label: 'Add rules', completed: hasRules, href: `/decisions/${decisionId}/rules` },
              { label: 'Create test cases', completed: hasTests, href: `/decisions/${decisionId}/tests` },
              { label: 'Make it live', completed: isPublished, href: undefined },
            ];
            const incomplete = allSteps.filter(s => !s.completed);
            const complete = allSteps.filter(s => s.completed);
            return (
              <Card className="bg-gradient-to-br from-[var(--brand)]/6 to-[var(--brand)]/2 border-[var(--brand)]/15 border-l-2 border-l-[var(--brand)]/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    Your progress
                    <span className="data-mono text-sm font-semibold text-[var(--brand)]">
                      {completedSteps}/{totalSteps}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {remaining} step{remaining > 1 ? 's' : ''} remaining
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {incomplete.map(s => (
                      <NextStepItem key={s.label} label={s.label} completed={false} href={s.href} />
                    ))}
                    {complete.length > 0 && (
                      <div className="pt-2 border-t border-[var(--border)]/50 space-y-3">
                        {complete.map(s => (
                          <NextStepItem key={s.label} label={s.label} completed={true} href={s.href} />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Version Info */}
          {latestVersion && (
            <Card className="surface-grain">
              <CardHeader className="pb-3">
                <CardTitle className="text-[13px] font-semibold tracking-tight">Current version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[var(--muted-foreground)]/60">Version</span>
                    <span className="data-mono text-[12px] font-bold">v{latestVersion.versionNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[var(--muted-foreground)]/60">Created</span>
                    <span className="data-mono text-[12px] text-[var(--muted-foreground)]">{formatRelativeTime(latestVersion.createdAt).relative}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[var(--muted-foreground)]/60">Tests</span>
                    <TestStatusBadge status={latestVersion.testStatus} />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4 h-8 text-[12px]" asChild>
                  <Link href={`/decisions/${decisionId}/deploy`}>
                    View version history
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status */}
          <Card className="surface-grain">
            <CardHeader className="pb-3">
              <CardTitle className="text-[13px] font-semibold tracking-tight">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {(['draft', 'live'] as const).map((env) => {
                  const deployment = deployments[env];
                  return (
                    <div key={env} className="flex items-center justify-between">
                      <span className="text-[12px] text-[var(--muted-foreground)]/60 capitalize">{env === 'draft' ? 'Draft' : 'Live'}</span>
                      {deployment ? (
                        <span className="data-mono text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                          v{deployment.versionNumber}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[var(--muted-foreground)]/25">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* API Quick Access */}
          <Card className="surface-grain">
            <CardHeader className="pb-3">
              <CardTitle className="text-[13px] font-semibold tracking-tight">API endpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block p-3 rounded-lg bg-[var(--muted)]/50 text-[11px] font-mono break-all text-[var(--muted-foreground)] leading-relaxed">
                POST /api/decisions/{decisionId}/run
              </code>
              <Button variant="outline" size="sm" className="w-full mt-4 h-8 text-[12px]" asChild>
                <Link href={`/decisions/${decisionId}/api`}>
                  <Code className="w-3.5 h-3.5" />
                  View API docs
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function MetricCard({
  label,
  value,
  icon: Icon,
  status,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  status?: 'good' | 'warning' | 'critical' | 'muted';
}) {
  const isMuted = status === 'muted';
  return (
    <Card className={`surface-grain ${isMuted ? 'opacity-60' : ''}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-9 h-9 rounded-lg flex items-center justify-center
            ${status === 'warning' ? 'bg-[var(--warning)]/10' : 
              status === 'critical' ? 'bg-[var(--destructive)]/10' : 
              'bg-[var(--muted)]/60'}
          `}>
            <Icon className={`w-4 h-4 ${
              status === 'warning' ? 'text-[var(--warning)]' : 
              status === 'critical' ? 'text-[var(--destructive)]' : 
              'text-[var(--muted-foreground)]/50'
            }`} />
          </div>
          <div>
            <p className="text-[11px] text-[var(--muted-foreground)]/60 font-medium">{label}</p>
            <p className={`data-mono font-bold ${
              status === 'warning' ? 'text-lg text-[var(--warning)]' : 
              status === 'critical' ? 'text-lg text-[var(--destructive)]' : 
              isMuted ? 'text-[14px] text-[var(--muted-foreground)]' :
              'text-[15px] text-[var(--foreground)]'
            }`}>
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
  status,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  status: 'complete' | 'incomplete';
}) {
  return (
    <Link href={href}>
      <div className="surface-layered surface-grain h-full cursor-pointer group p-4">
        <div className="flex items-start gap-3">
          <div className={`
            w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
            ${status === 'complete' ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-[var(--brand)]/8'}
          `}>
            <Icon className={`w-4 h-4 ${
              status === 'complete' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--brand)]/70'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[var(--foreground)] tracking-tight">{title}</p>
            <p className="text-[12px] text-[var(--muted-foreground)]/60 mt-0.5">{description}</p>
          </div>
          {status === 'complete' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5 text-[var(--muted-foreground)]/30 chevron-slide flex-shrink-0 mt-0.5" />
          )}
        </div>
      </div>
    </Link>
  );
}

function NextStepItem({
  label,
  completed,
  href,
}: {
  label: string;
  completed: boolean;
  href?: string;
}) {
  const content = (
    <div className={`flex items-center gap-3 py-1.5 ${href && !completed ? 'cursor-pointer hover:opacity-80' : ''}`}>
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-[var(--brand)]/30" />
      )}
      <span className={`text-sm ${completed ? 'text-[var(--muted-foreground)] line-through' : 'text-[var(--foreground)]'}`}>
        {label}
      </span>
    </div>
  );

  if (href && !completed) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function TestStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'passing':
      return (
        <span className="inline-flex items-center gap-1 text-sm text-[var(--success)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Passing
        </span>
      );
    case 'failing':
      return (
        <span className="inline-flex items-center gap-1 text-sm text-[var(--destructive)]">
          <AlertTriangle className="w-3.5 h-3.5" />
          Failing
        </span>
      );
    default:
      return (
        <span className="text-sm text-[var(--muted-foreground)]">Unknown</span>
      );
  }
}
