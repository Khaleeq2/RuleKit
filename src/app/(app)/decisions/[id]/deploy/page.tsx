'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Rocket,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  History,
  Shield,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { versionsRepo, deploymentsRepo } from '@/app/lib/versions';
import { testsRepo } from '@/app/lib/tests';
import { Version, Deployment, Environment, ENVIRONMENTS, TestStatus } from '@/app/lib/types';
import { formatRelativeTime } from '@/app/lib/time-utils';
import { toast } from 'sonner';

// ============================================
// Deploy Tab
// ============================================

export default function DeployPage() {
  const params = useParams();
  const decisionId = params.id as string;

  const [versions, setVersions] = useState<Version[]>([]);
  const [deployments, setDeployments] = useState<Record<Environment, Deployment | null>>({
    draft: null,
    live: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [createVersionOpen, setCreateVersionOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [requireTestsForProd, setRequireTestsForProd] = useState(true);

  // Load versions and deployments
  useEffect(() => {
    const loadData = async () => {
      try {
        const [versionsData, deploymentsData] = await Promise.all([
          versionsRepo.listByDecisionId(decisionId),
          deploymentsRepo.getActiveDeployments(decisionId),
        ]);
        setVersions(versionsData);
        setDeployments(deploymentsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load deployment data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [decisionId]);

  const handleCreateVersion = async (releaseNotes: string) => {
    try {
      const newVersion = await versionsRepo.create(decisionId, releaseNotes);
      setVersions([newVersion, ...versions]);
      setCreateVersionOpen(false);
      toast.success(`Version ${newVersion.versionNumber} created`);
    } catch (error) {
      console.error('Failed to create version:', error);
      toast.error('Failed to create version');
    }
  };

  const handlePromote = async (versionId: string, environment: Environment) => {
    try {
      // Check if tests pass for prod
      if (environment === 'live' && requireTestsForProd) {
        const version = versions.find(v => v.id === versionId);
        if (version?.testStatus !== 'passing') {
          toast.error('Tests must be passing to make live');
          return;
        }
      }

      const deployment = await deploymentsRepo.promote(decisionId, versionId, environment);
      setDeployments({ ...deployments, [environment]: deployment });
      setPromoteOpen(false);
      setSelectedVersion(null);
      toast.success(`Deployed to ${environment}`);
    } catch (error: any) {
      console.error('Failed to promote:', error);
      toast.error(error.message || 'Failed to deploy');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-medium text-[var(--foreground)] tracking-[-0.01em]">Deploy</h2>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
            Create versions and promote to environments
          </p>
        </div>
        <Dialog open={createVersionOpen} onOpenChange={setCreateVersionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              Create version
            </Button>
          </DialogTrigger>
          <CreateVersionDialog onSubmit={handleCreateVersion} onCancel={() => setCreateVersionOpen(false)} />
        </Dialog>
      </div>

      {/* Active Deployments */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Active Deployments</CardTitle>
          <CardDescription>
            Currently deployed versions per environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {ENVIRONMENTS.map((env) => {
              const deployment = deployments[env];
              return (
                <EnvironmentCard
                  key={env}
                  environment={env}
                  deployment={deployment}
                  versions={versions}
                  onPromote={(versionId) => handlePromote(versionId, env)}
                  requireTestsForProd={requireTestsForProd && env === 'live'}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Safety */}
      <Card className="mb-8">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[var(--muted-foreground)]" />
              <div>
                <p className="font-medium text-[var(--foreground)]">Require passing tests to go live</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Prevent making live unless all tests pass
                </p>
              </div>
            </div>
            <Switch
              checked={requireTestsForProd}
              onCheckedChange={setRequireTestsForProd}
            />
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4" />
                Version History
              </CardTitle>
              <CardDescription>
                All versions of this decision
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--muted-foreground)] mb-4">
                No versions created yet. Create a version to deploy your decision.
              </p>
              <Button onClick={() => setCreateVersionOpen(true)}>
                <Plus className="w-4 h-4" />
                Create first version
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <VersionRow
                  key={version.id}
                  version={version}
                  deployments={deployments}
                  onPromote={() => {
                    setSelectedVersion(version);
                    setPromoteOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promote Dialog */}
      <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        {selectedVersion && (
          <PromoteDialog
            version={selectedVersion}
            deployments={deployments}
            requireTestsForProd={requireTestsForProd}
            onPromote={(env) => handlePromote(selectedVersion.id, env)}
            onCancel={() => {
              setPromoteOpen(false);
              setSelectedVersion(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

// ============================================
// Environment Card
// ============================================

function EnvironmentCard({
  environment,
  deployment,
  versions,
  onPromote,
  requireTestsForProd,
}: {
  environment: Environment;
  deployment: Deployment | null;
  versions: Version[];
  onPromote: (versionId: string) => void;
  requireTestsForProd: boolean;
}) {
  const envLabels: Record<Environment, string> = {
    draft: 'Draft',
    live: 'Live',
  };

  const envColors: Record<Environment, string> = {
    draft: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    live: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };

  return (
    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between mb-3">
        <Badge className={envColors[environment]}>
          {envLabels[environment]}
        </Badge>
        {environment === 'live' && requireTestsForProd && (
          <Shield className="w-4 h-4 text-[var(--muted-foreground)]" />
        )}
      </div>
      
      {deployment ? (
        <div>
          <p className="text-2xl font-semibold text-[var(--foreground)] mb-1">
            v{deployment.versionNumber}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Deployed {formatRelativeTime(deployment.deployedAt).relative}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-lg text-[var(--muted-foreground)] mb-1">Not deployed</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            No version active
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Version Row
// ============================================

function VersionRow({
  version,
  deployments,
  onPromote,
}: {
  version: Version;
  deployments: Record<Environment, Deployment | null>;
  onPromote: () => void;
}) {
  const activeEnvs = ENVIRONMENTS.filter(env => 
    deployments[env]?.activeVersionId === version.id
  );

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-[var(--muted-foreground)]" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-semibold text-[var(--foreground)]">
              v{version.versionNumber}
            </span>
            <TestStatusBadge status={version.testStatus} />
            {activeEnvs.map(env => (
              <Badge key={env} variant="outline" className="text-xs capitalize">
                {env}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {version.releaseNotes || 'No release notes'}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Created {formatRelativeTime(version.createdAt).relative}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onPromote}>
        <Rocket className="w-4 h-4" />
        Deploy
      </Button>
    </div>
  );
}

// ============================================
// Test Status Badge
// ============================================

function TestStatusBadge({ status }: { status: TestStatus }) {
  switch (status) {
    case 'passing':
      return (
        <Badge className="bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Passing
        </Badge>
      );
    case 'failing':
      return (
        <Badge className="bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20">
          <XCircle className="w-3 h-3 mr-1" />
          Failing
        </Badge>
      );
    case 'running':
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Running
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Unknown
        </Badge>
      );
  }
}

// ============================================
// Create Version Dialog
// ============================================

function CreateVersionDialog({
  onSubmit,
  onCancel,
}: {
  onSubmit: (releaseNotes: string) => void;
  onCancel: () => void;
}) {
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async () => {
    setIsCreating(true);
    await onSubmit(releaseNotes);
    setIsCreating(false);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new version</DialogTitle>
        <DialogDescription>
          Create a snapshot of your current schema and rules
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Label htmlFor="releaseNotes">Release notes (optional)</Label>
        <Textarea
          id="releaseNotes"
          value={releaseNotes}
          onChange={(e) => setReleaseNotes(e.target.value)}
          placeholder="What changed in this version?"
          rows={3}
          className="mt-2"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create version'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============================================
// Promote Dialog
// ============================================

function PromoteDialog({
  version,
  deployments,
  requireTestsForProd,
  onPromote,
  onCancel,
}: {
  version: Version;
  deployments: Record<Environment, Deployment | null>;
  requireTestsForProd: boolean;
  onPromote: (env: Environment) => void;
  onCancel: () => void;
}) {
  const [selectedEnv, setSelectedEnv] = useState<Environment>('draft');
  const [isDeploying, setIsDeploying] = useState(false);

  const canDeployToProd = !requireTestsForProd || version.testStatus === 'passing';

  const handleDeploy = async () => {
    setIsDeploying(true);
    await onPromote(selectedEnv);
    setIsDeploying(false);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Deploy v{version.versionNumber}</DialogTitle>
        <DialogDescription>
          Choose an environment to deploy this version
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="space-y-2">
          <Label>Environment</Label>
          <Select value={selectedEnv} onValueChange={(v) => setSelectedEnv(v as Environment)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="live" disabled={!canDeployToProd}>
                Live {!canDeployToProd && '(requires passing tests)'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedEnv === 'live' && !canDeployToProd && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20">
            <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
            <span className="text-sm text-[var(--warning)]">
              Tests must be passing to go live
            </span>
          </div>
        )}

        {deployments[selectedEnv] && (
          <div className="p-3 rounded-lg bg-[var(--muted)]">
            <p className="text-sm text-[var(--muted-foreground)]">
              This will replace <strong>v{deployments[selectedEnv]!.versionNumber}</strong> currently deployed to {selectedEnv}
            </p>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleDeploy} disabled={isDeploying || (selectedEnv === 'live' && !canDeployToProd)}>
          {isDeploying ? 'Deploying...' : `Deploy to ${selectedEnv}`}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
