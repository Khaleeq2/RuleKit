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
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Load decisions
  useEffect(() => {
    const loadDecisions = async () => {
      try {
        const data = await decisionsRepo.listWithStats();
        setDecisions(data);
      } catch (error) {
        console.error('Failed to load decisions:', error);
        setLoadError('Failed to load rules. Check your connection and try again.');
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
      const supabase = (await import('@/app/lib/supabase-browser')).getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      const newDecision = await decisionsRepo.create({
        name: `${decision.name} (copy)`,
        description: decision.description,
        status: 'draft',
        createdBy: user?.id || 'unknown',
      });
      toast.success('Decision duplicated');
      router.push(`/decisions/${newDecision.id}`);
    } catch (error) {
      console.error('Failed to duplicate decision:', error);
      toast.error('Failed to duplicate decision');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredDecisions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredDecisions.map(d => d.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected rule${selected.size > 1 ? 's' : ''}? This cannot be undone.`)) return;
    try {
      await Promise.all([...selected].map(id => decisionsRepo.remove(id)));
      toast.success(`${selected.size} rule${selected.size > 1 ? 's' : ''} deleted`);
      setSelected(new Set());
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast.error('Failed to delete some rules');
    }
  };

  return (
    <div className="min-h-full">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header — deliberate typographic hierarchy */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-[-0.01em] leading-tight">
              Rules
            </h1>
            <p className="text-[13px] text-[var(--muted-foreground)] mt-1 leading-relaxed">
              Create, manage, and test your rule logic
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" className="h-9 text-[13px] font-medium" asChild>
              <Link href="/decisions/new?templates=true">
                <LayoutTemplate className="w-3.5 h-3.5" />
                Templates
              </Link>
            </Button>
            <Button size="sm" className="h-9 text-[13px] font-medium" asChild>
              <Link href="/decisions/new">
                <Plus className="w-3.5 h-3.5" />
                New Rule
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters — refined, restrained */}
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules..."
              className="pl-10 h-10 bg-[var(--background)] border-[var(--border)] rounded-lg text-[14px] placeholder:text-[var(--muted-foreground)]/40 focus:border-[var(--foreground)]/20 focus:shadow-[0_0_0_3px_rgb(0_0_0/0.04)] transition-all"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full md:w-[160px] h-10 bg-[var(--background)] border-[var(--border)] rounded-lg text-[13px]">
              <Filter className="w-3.5 h-3.5 mr-1.5 opacity-40" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loadError ? (
          <div className="surface-layered surface-grain">
            <div className="py-16 text-center px-6">
              <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-[var(--foreground)] mb-1 tracking-tight">
                Something went wrong
              </h3>
              <p className="text-[13px] text-[var(--muted-foreground)]/60 mb-4">
                {loadError}
              </p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="surface-layered surface-grain overflow-hidden">
            <div className="glass-header hidden md:grid grid-cols-[1fr_100px_100px_120px_56px] gap-4 px-5 py-2.5 text-[11px] text-[var(--muted-foreground)]/60 uppercase tracking-[0.06em] font-semibold">
              <span>Rule</span>
              <span>Status</span>
              <span className="text-right">Failures</span>
              <span className="text-right">Updated</span>
              <span></span>
            </div>
            <div className="divide-y divide-[var(--border)]/50">
              {[1, 2, 3, 4, 5].map((i) => (
                <DecisionRowSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : filteredDecisions.length === 0 ? (
          <div className="surface-layered surface-grain">
            <div className="py-20 text-center px-6">
              {decisions.length === 0 ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--muted)] to-[var(--background)] border border-[var(--border)] flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <LayoutTemplate className="w-6 h-6 text-[var(--muted-foreground)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1.5 tracking-tight">
                    Build your first rule
                  </h3>
                  <p className="text-[13px] text-[var(--muted-foreground)]/70 mb-8 max-w-sm mx-auto leading-relaxed">
                    Define conditions, test them against real data, and deploy — all in one place.
                  </p>
                  <div className="flex items-center justify-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-9 text-[13px]" asChild>
                      <Link href="/decisions/new?templates=true">
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        Start from template
                      </Link>
                    </Button>
                    <Button size="sm" className="h-9 text-[13px]" asChild>
                      <Link href="/decisions/new">
                        <Plus className="w-3.5 h-3.5" />
                        Create rule
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Search className="w-6 h-6 text-[var(--muted-foreground)]/40 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-[var(--foreground)] mb-1 tracking-tight">
                    No matches
                  </h3>
                  <p className="text-[13px] text-[var(--muted-foreground)]/60">
                    Try adjusting your search or filters
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Bulk action bar — appears when items selected */}
            {selected.size > 0 && (
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 mb-3 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-lg">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {selected.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
                    Clear
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete{selected.size > 1 ? ` (${selected.size})` : ''}
                  </Button>
                </div>
              </div>
            )}

            <div className="surface-layered surface-grain overflow-hidden">
              {/* Glass header — translucent depth signal */}
              <div className="glass-header hidden md:grid grid-cols-[36px_1fr_100px_100px_120px_56px] gap-4 px-5 py-2.5 text-[11px] text-[var(--muted-foreground)]/60 uppercase tracking-[0.06em] font-semibold">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selected.size === filteredDecisions.length && filteredDecisions.length > 0}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-[var(--border)] text-[var(--brand)] focus:ring-[var(--brand)]/30 cursor-pointer accent-[var(--brand)]"
                  />
                </div>
                <span>Rule</span>
                <span>Status</span>
                <span className="text-right">Failures</span>
                <span className="text-right">Updated</span>
                <span></span>
              </div>
              {/* Rows — each a tactile interactive surface */}
              <div className="divide-y divide-[var(--border)]/50">
                {filteredDecisions.map((decision, idx) => (
                  <DecisionRow
                    key={decision.id}
                    decision={decision}
                    isEven={idx % 2 === 0}
                    isSelected={selected.has(decision.id)}
                    onToggleSelect={() => toggleSelect(decision.id)}
                    onDelete={() => handleDelete(decision.id, decision.name)}
                    onDuplicate={() => handleDuplicate(decision)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Stats footer — quiet, informational, monospaced counts */}
        {decisions.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-[12px] text-[var(--muted-foreground)]/50">
            <span>
              <span className="data-mono">{filteredDecisions.length}</span> of <span className="data-mono">{decisions.length}</span> rules
            </span>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="data-mono">{decisions.filter(d => d.status === 'published').length}</span> published
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)]/30" />
                <span className="data-mono">{decisions.filter(d => d.status === 'draft').length}</span> drafts
              </span>
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
    <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_100px_120px_56px] gap-4 items-center px-5 py-4">
      <div className="min-w-0">
        <Skeleton className="h-4 w-44 mb-2" />
        <Skeleton className="h-3 w-[60%]" />
      </div>
      <div className="hidden md:block">
        <Skeleton className="h-[22px] w-[72px] rounded-full" />
      </div>
      <div className="hidden md:flex justify-end">
        <Skeleton className="h-4 w-6" />
      </div>
      <div className="hidden md:flex justify-end">
        <Skeleton className="h-3.5 w-16" />
      </div>
      <div className="hidden md:flex justify-end">
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </div>
  );
}

function DecisionRow({
  decision,
  isEven,
  isSelected = false,
  onToggleSelect,
  onDelete,
  onDuplicate,
}: {
  decision: DecisionWithStats;
  isEven: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-[36px_1fr_100px_100px_120px_56px] gap-4 items-center px-5 py-3.5 row-interactive group ${isSelected ? 'bg-[var(--brand)]/5' : ''}`}
    >
      {/* Checkbox */}
      <div className="hidden md:flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-3.5 h-3.5 rounded border-[var(--border)] text-[var(--brand)] focus:ring-[var(--brand)]/30 cursor-pointer accent-[var(--brand)]"
        />
      </div>

      {/* Rule name + description */}
      <Link href={`/decisions/${decision.id}`} className="min-w-0">
        <h3 className="text-[14px] font-semibold text-[var(--foreground)] truncate tracking-tight leading-snug">
          {decision.name}
        </h3>
        <p className="text-[12px] text-[var(--muted-foreground)]/60 truncate leading-relaxed mt-0.5">
          {decision.description || 'No description'}
        </p>
        {/* Mobile-only meta */}
        <div className="md:hidden mt-2 flex items-center gap-3 text-[11px] text-[var(--muted-foreground)]/50">
          <StatusBadge status={decision.status} />
          <span className="data-mono">{formatRelativeTime(decision.updatedAt).relative}</span>
          {decision.failuresLast24h > 0 && (
            <span className="data-mono text-red-500 font-semibold">{decision.failuresLast24h} failures</span>
          )}
        </div>
      </Link>

      {/* Status — tactile badge */}
      <div className="hidden md:block">
        <StatusBadge status={decision.status} />
      </div>

      {/* Failures — monospace, weight signals severity */}
      <div className="hidden md:block text-right">
        {decision.failuresLast24h > 0 ? (
          <span className="data-mono text-[14px] font-bold text-red-500/90">
            {decision.failuresLast24h}
          </span>
        ) : (
          <span className="text-[13px] text-[var(--muted-foreground)]/25">—</span>
        )}
      </div>

      {/* Updated — quiet monospace timestamp */}
      <div className="hidden md:block text-right">
        <span className="data-mono text-[12px] text-[var(--muted-foreground)]/45">
          {formatRelativeTime(decision.updatedAt).relative}
        </span>
      </div>

      {/* Actions — context menu + directional chevron */}
      <div className="hidden md:flex items-center justify-end gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/decisions/${decision.id}`}>
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="w-3.5 h-3.5 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-[var(--destructive)]">
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href={`/decisions/${decision.id}`}>
          <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]/30 chevron-slide" />
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DecisionStatus }) {
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
