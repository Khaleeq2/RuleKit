'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  LayoutTemplate,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { decisionsRepo } from '@/app/lib/decisions';
import { DecisionWithStats, DecisionStatus } from '@/app/lib/types';
import { formatRelativeTime } from '@/app/lib/time-utils';
import { toast } from 'sonner';

export default function DecisionsPage() {
  const router = useRouter();
  const [decisions, setDecisions] = useState<DecisionWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DecisionStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load decisions
  useEffect(() => {
    const loadDecisions = async () => {
      try {
        const data = await decisionsRepo.listWithStats();
        setDecisions(data);
      } catch (error) {
        console.error('Failed to load decisions:', error);
        toast.error('Failed to load decisions');
      } finally {
        setIsLoading(false);
      }
    };

    loadDecisions();

    const unsubscribe = decisionsRepo.subscribe(() => {
      loadDecisions();
    });

    return unsubscribe;
  }, []);

  // Filter decisions
  const filteredDecisions = useMemo(() => {
    let result = decisions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    return result;
  }, [decisions, searchQuery, statusFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await decisionsRepo.remove(id);
      toast.success('Decision deleted');
    } catch (error) {
      console.error('Failed to delete decision:', error);
      toast.error('Failed to delete decision');
    }
  };

  const handleDuplicate = async (decision: DecisionWithStats) => {
    try {
      const newDecision = await decisionsRepo.create({
        name: `${decision.name} (copy)`,
        description: decision.description,
        status: 'draft',
        createdBy: 'user-1',
      });
      toast.success('Decision duplicated');
      router.push(`/decisions/${newDecision.id}`);
    } catch (error) {
      console.error('Failed to duplicate decision:', error);
      toast.error('Failed to duplicate decision');
    }
  };

  return (
    <div className="min-h-full">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-[length:var(--font-size-h1)] font-semibold text-[var(--foreground)] tracking-tight leading-[var(--line-height-h1)]">
              Rules
            </h1>
            <p className="text-[length:var(--font-size-body)] text-[var(--muted-foreground)] mt-1 leading-[var(--line-height-body)]">
              Create, manage, and test your rule logic
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/decisions/new?templates=true">
                <LayoutTemplate className="w-4 h-4 mr-2" />
                Templates
              </Link>
            </Button>
            <Button asChild>
              <Link href="/decisions/new">
                <Plus className="w-4 h-4 mr-2" />
                New Rule
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules..."
              className="pl-10 h-11 bg-[var(--card)] border-[var(--border)] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)] focus:shadow-[0_4px_12px_-4px_rgb(0_0_0/0.1)] transition-all"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full md:w-[180px] h-11 bg-[var(--card)] border-[var(--border)] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Decisions */}
        {isLoading ? (
          <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_120px_120px_140px_72px] gap-4 px-4 py-3 bg-[var(--muted)]/50 text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">
              <span>Rule</span>
              <span>Status</span>
              <span className="text-right">Failures (24h)</span>
              <span className="text-right">Updated</span>
              <span></span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {[1, 2, 3, 4, 5].map((i) => (
                <DecisionRowSkeleton key={i} />
              ))}
            </div>
          </Card>
        ) : filteredDecisions.length === 0 ? (
          <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
            <CardContent className="py-16 text-center">
              {decisions.length === 0 ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-[length:var(--font-size-h3)] font-semibold text-[var(--foreground)] mb-2">
                    No rules yet
                  </h3>
                  <p className="text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto leading-[var(--line-height-body-sm)]">
                    Create your first rule to start standardizing your business logic.
                  </p>
                  <Button asChild>
                    <Link href="/decisions/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create rule
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Search className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-4" />
                  <h3 className="text-[length:var(--font-size-h3)] font-semibold text-[var(--foreground)] mb-2">
                    No matches found
                  </h3>
                  <p className="text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)]">
                    Try adjusting your search or filters
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_120px_120px_140px_72px] gap-4 px-4 py-3 bg-[var(--muted)]/50 text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">
              <span>Rule</span>
              <span>Status</span>
              <span className="text-right">Failures (24h)</span>
              <span className="text-right">Updated</span>
              <span></span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {filteredDecisions.map((decision, idx) => (
                <DecisionRow
                  key={decision.id}
                  decision={decision}
                  isEven={idx % 2 === 0}
                  onDelete={() => handleDelete(decision.id, decision.name)}
                  onDuplicate={() => handleDuplicate(decision)}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Stats Footer */}
        {decisions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
              <span>
                {filteredDecisions.length} of {decisions.length} rules
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  {decisions.filter(d => d.status === 'published').length} published
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {decisions.filter(d => d.status === 'draft').length} drafts
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Decision Row
// ============================================

function DecisionRowSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_140px_72px] gap-4 items-center px-4 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-[70%]" />
      </div>
      <div className="hidden md:block">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="hidden md:flex justify-end">
        <Skeleton className="h-4 w-8" />
      </div>
      <div className="hidden md:flex justify-end">
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="hidden md:flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
}

function DecisionRow({
  decision,
  isEven,
  onDelete,
  onDuplicate,
}: {
  decision: DecisionWithStats;
  isEven: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-[1fr_120px_120px_140px_72px] gap-4 items-center px-4 py-4 transition-colors group ${isEven ? 'bg-[var(--card)]' : 'bg-[var(--muted)]/20'} hover:bg-[var(--muted)]/60`}
    >
      <Link href={`/decisions/${decision.id}`} className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-medium text-[var(--foreground)] text-[length:var(--font-size-body)] truncate">
            {decision.name}
          </h3>
          <div className="md:hidden">
            <StatusBadge status={decision.status} />
          </div>
        </div>
        <p className="text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)] truncate leading-[var(--line-height-body-sm)]">
          {decision.description || 'No description'}
        </p>
        <div className="md:hidden mt-2 flex items-center gap-3 text-[length:var(--font-size-meta)] text-[var(--muted-foreground)]">
          <span>{formatRelativeTime(decision.updatedAt).relative}</span>
          <span className="text-[var(--muted-foreground)]/50">•</span>
          {decision.failuresLast24h > 0 ? (
            <span className="text-red-600 font-medium">{decision.failuresLast24h} failures</span>
          ) : (
            <span>0 failures</span>
          )}
        </div>
      </Link>

      <div className="hidden md:block">
        <StatusBadge status={decision.status} />
      </div>

      <div className="hidden md:block text-right">
        {decision.failuresLast24h > 0 ? (
          <span className="text-[length:var(--font-size-body)] font-medium text-red-600">
            {decision.failuresLast24h}
          </span>
        ) : (
          <span className="text-[length:var(--font-size-body)] text-[var(--muted-foreground)]">—</span>
        )}
      </div>

      <div className="hidden md:block text-right">
        <span className="text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)]">
          {formatRelativeTime(decision.updatedAt).relative}
        </span>
      </div>

      <div className="hidden md:flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/decisions/${decision.id}`}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-[var(--destructive)]">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href={`/decisions/${decision.id}`} className="opacity-70 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DecisionStatus }) {
  if (status === 'published') {
    return (
      <Badge className="rounded-full bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 font-medium dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
        Published
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0.5 font-medium bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
      Draft
    </Badge>
  );
}
