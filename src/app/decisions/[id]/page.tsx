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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">What this decision does</CardTitle>
                {!isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="w-4 h-4 mr-1" />
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

          {/* Health Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            />
            <MetricCard
              label="Avg latency"
              value={runStats?.avgLatency ? `${runStats.avgLatency}ms` : '—'}
              icon={Clock}
            />
            <MetricCard
              label="Credits (7d)"
              value={runStats?.creditsUsed || 0}
              icon={Coins}
            />
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {/* Next Steps */}
          {completedSteps < totalSteps && (
            <Card className="bg-gradient-to-br from-[var(--primary)]/5 to-transparent border-[var(--primary)]/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Next steps
                  <span className="text-sm font-normal text-[var(--muted-foreground)]">
                    {completedSteps}/{totalSteps}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <NextStepItem
                    label="Define input schema"
                    completed={hasSchema}
                    href={`/decisions/${decisionId}/schema`}
                  />
                  <NextStepItem
                    label="Add rules"
                    completed={hasRules}
                    href={`/decisions/${decisionId}/rules`}
                  />
                  <NextStepItem
                    label="Create test cases"
                    completed={hasTests}
                    href={`/decisions/${decisionId}/tests`}
                  />
                  <NextStepItem
                    label="Make it live"
                    completed={isPublished}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Version Info */}
          {latestVersion && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Current version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">Version</span>
                    <span className="text-sm font-mono font-medium">v{latestVersion.versionNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">Created</span>
                    <span className="text-sm">{formatRelativeTime(latestVersion.createdAt).relative}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">Tests</span>
                    <TestStatusBadge status={latestVersion.testStatus} />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link href={`/decisions/${decisionId}/deploy`}>
                    View version history
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(['draft', 'live'] as const).map((env) => {
                  const deployment = deployments[env];
                  return (
                    <div key={env} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{env === 'draft' ? 'Draft' : 'Live'}</span>
                      {deployment ? (
                        <span className="text-sm font-mono text-[var(--success)]">
                          v{deployment.versionNumber}
                        </span>
                      ) : (
                        <span className="text-sm text-[var(--muted-foreground)]">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* API Quick Access */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">API endpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block p-3 rounded-lg bg-[var(--muted)] text-xs font-mono break-all">
                POST /api/decisions/{decisionId}/run
              </code>
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link href={`/decisions/${decisionId}/api`}>
                  <Code className="w-4 h-4 mr-2" />
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
  status?: 'good' | 'warning' | 'critical';
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${status === 'warning' ? 'bg-[var(--warning)]/10' : 
              status === 'critical' ? 'bg-[var(--destructive)]/10' : 
              'bg-[var(--muted)]'}
          `}>
            <Icon className={`w-5 h-5 ${
              status === 'warning' ? 'text-[var(--warning)]' : 
              status === 'critical' ? 'text-[var(--destructive)]' : 
              'text-[var(--muted-foreground)]'
            }`} />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
            <p className={`text-lg font-semibold ${
              status === 'warning' ? 'text-[var(--warning)]' : 
              status === 'critical' ? 'text-[var(--destructive)]' : 
              'text-[var(--foreground)]'
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
      <Card className="h-full hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--muted-foreground)]/30 transition-all cursor-pointer">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${status === 'complete' ? 'bg-[var(--success)]/10' : 'bg-[var(--muted)]'}
            `}>
              <Icon className={`w-5 h-5 ${
                status === 'complete' ? 'text-[var(--success)]' : 'text-[var(--muted-foreground)]'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--foreground)]">{title}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
            </div>
            {status === 'complete' && (
              <CheckCircle2 className="w-5 h-5 text-[var(--success)] flex-shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>
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
        <div className="w-4 h-4 rounded-full border-2 border-[var(--muted-foreground)]/30" />
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
