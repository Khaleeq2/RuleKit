'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  LayoutTemplate,
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
import { rulebooksRepo } from '@/app/lib/rulebooks';
import { RulebookWithStats, RulebookStatus } from '@/app/lib/types';
import { formatRelativeTime } from '@/app/lib/time-utils';
import { toast } from 'sonner';

export default function RulebooksPage() {
  const router = useRouter();
  const [rulebooks, setRulebooks] = useState<RulebookWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RulebookStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load rulebooks
  useEffect(() => {
    const loadRulebooks = async () => {
      try {
        const data = await rulebooksRepo.listWithStats();
        setRulebooks(data);
      } catch (error) {
        console.error('Failed to load rulebooks:', error);
        const message =
          error instanceof Error
            ? error.message
            : (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string')
              ? (error as any).message
              : 'Failed to load rulebooks. Check your connection and try again.';
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadRulebooks();

    const unsubscribe = rulebooksRepo.subscribe(() => {
      loadRulebooks();
    });

    return unsubscribe;
  }, []);

  // Filter rulebooks
  const filteredRulebooks = useMemo(() => {
    let result = rulebooks;

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
  }, [rulebooks, searchQuery, statusFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await rulebooksRepo.remove(id);
      toast.success('Rulebook deleted');
    } catch (error) {
      console.error('Failed to delete rulebook:', error);
      toast.error('Failed to delete rulebook');
    }
  };

  const handleDuplicate = async (rb: RulebookWithStats) => {
    try {
      const supabase = (await import('@/app/lib/supabase-browser')).getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      const newRulebook = await rulebooksRepo.create({
        name: `${rb.name} (copy)`,
        description: rb.description,
        status: 'draft',
        createdBy: user?.id || 'unknown',
      });
      toast.success('Rulebook duplicated');
      router.push(`/rulebooks/${newRulebook.id}`);
    } catch (error) {
      console.error('Failed to duplicate rulebook:', error);
      toast.error('Failed to duplicate rulebook');
    }
  };


  return (
    <div className="min-h-full">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header — deliberate typographic hierarchy */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-[-0.01em] leading-tight">
              Rulebooks
            </h1>
            <p className="text-[13px] text-[var(--muted-foreground)] mt-1 leading-relaxed">
              Create, manage, and test your rulebooks
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" className="h-9 text-[13px] font-medium" asChild>
              <Link href="/rulebooks/new?templates=true">
                <LayoutTemplate className="w-3.5 h-3.5" />
                Templates
              </Link>
            </Button>
            <Button size="sm" className="h-9 text-[13px] font-medium" asChild>
              <Link href="/rulebooks/new">
                <Plus className="w-3.5 h-3.5" />
                New Rulebook
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
              placeholder="Search rulebooks..."
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

        {/* Card Grid */}
        {loadError ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <RulebookCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredRulebooks.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="py-20 text-center px-6">
              {rulebooks.length === 0 ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--muted)] to-[var(--background)] border border-[var(--border)] flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <LayoutTemplate className="w-6 h-6 text-[var(--muted-foreground)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1.5 tracking-tight">
                    Create your first rulebook
                  </h3>
                  <p className="text-[13px] text-[var(--muted-foreground)]/70 mb-8 max-w-sm mx-auto leading-relaxed">
                    Define rules, test them against real data, and deploy — all in one place.
                  </p>
                  <div className="flex items-center justify-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-9 text-[13px]" asChild>
                      <Link href="/rulebooks/new?templates=true">
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        Start from template
                      </Link>
                    </Button>
                    <Button size="sm" className="h-9 text-[13px]" asChild>
                      <Link href="/rulebooks/new">
                        <Plus className="w-3.5 h-3.5" />
                        New rulebook
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRulebooks.map((rb) => (
              <RulebookCard
                key={rb.id}
                rulebook={rb}
                onDelete={() => handleDelete(rb.id, rb.name)}
                onDuplicate={() => handleDuplicate(rb)}
              />
            ))}
          </div>
        )}

        {/* Stats footer */}
        {rulebooks.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-[12px] text-[var(--muted-foreground)]/50">
            <span>
              <span className="data-mono">{filteredRulebooks.length}</span> of <span className="data-mono">{rulebooks.length}</span> rulebooks
            </span>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="data-mono">{rulebooks.filter(d => d.status === 'published').length}</span> published
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)]/30" />
                <span className="data-mono">{rulebooks.filter(d => d.status === 'draft').length}</span> drafts
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Rulebook Card
// ============================================

function RulebookCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-[22px] w-[60px] rounded-full" />
      </div>
      <Skeleton className="h-3 w-full mb-1.5" />
      <Skeleton className="h-3 w-2/3 mb-4" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

function RulebookCard({
  rulebook,
  onDelete,
  onDuplicate,
}: {
  rulebook: RulebookWithStats;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-200 hover:shadow-md hover:border-[var(--muted-foreground)]/25">
      <Link href={`/rulebooks/${rulebook.id}`} className="absolute inset-0 z-0 rounded-xl" />

      {/* Top row: name + status */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-[14px] font-semibold text-[var(--foreground)] tracking-tight leading-snug line-clamp-1">
          {rulebook.name}
        </h3>
        <StatusBadge status={rulebook.status} />
      </div>

      {/* Description */}
      <p className="text-[12px] text-[var(--muted-foreground)]/60 leading-relaxed line-clamp-2 mb-4 min-h-[2.5em]">
        {rulebook.description || 'No description'}
      </p>

      {/* Footer: meta + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-[var(--muted-foreground)]/45">
          <span className="data-mono">{formatRelativeTime(rulebook.updatedAt).relative}</span>
          {rulebook.failuresLast24h > 0 && (
            <span className="data-mono text-red-500 font-semibold">{rulebook.failuresLast24h} failures</span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative z-10 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/rulebooks/${rulebook.id}`}>
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
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RulebookStatus }) {
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
