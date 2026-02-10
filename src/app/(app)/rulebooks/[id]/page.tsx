'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  List,
  FileCode,
  TestTube,
  Code,
  Rocket,
  Play,
  ArrowRight,
} from 'lucide-react';
import { rulebooksRepo, rulesRepo, schemasRepo } from '@/app/lib/rulebooks';
import { Rulebook, Rule, Schema } from '@/app/lib/types';

// ============================================
// Rulebook Overview — guided entry point
// ============================================

export default function RulebookOverviewPage() {
  const params = useParams();
  const rulebookId = params.id as string;

  const [rulebook, setRulebook] = useState<Rulebook | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rb, rulesList, schemaData] = await Promise.all([
          rulebooksRepo.getById(rulebookId),
          rulesRepo.listByRulebookId(rulebookId),
          schemasRepo.getByRulebookId(rulebookId),
        ]);
        setRulebook(rb);
        setRules(rulesList);
        setSchema(schemaData);
      } catch (error) {
        console.error('Failed to load overview data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [rulebookId]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-pulse text-[var(--muted-foreground)]">Loading...</div>
      </div>
    );
  }

  if (!rulebook) return null;

  const enabledRules = rules.filter(r => r.enabled);
  const schemaFields = schema?.fields?.length ?? 0;

  const actions = [
    {
      icon: List,
      label: 'Rules',
      description: `${enabledRules.length} active rule${enabledRules.length !== 1 ? 's' : ''} · Define what "good" looks like`,
      href: `/rulebooks/${rulebookId}/rules`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      icon: FileCode,
      label: 'Schema',
      description: `${schemaFields} field${schemaFields !== 1 ? 's' : ''} · Describe the shape of your input`,
      href: `/rulebooks/${rulebookId}/schema`,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      icon: TestTube,
      label: 'Tests',
      description: 'Verify your rules with saved test cases',
      href: `/rulebooks/${rulebookId}/tests`,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      icon: Code,
      label: 'API',
      description: 'Integrate this rulebook into your app',
      href: `/rulebooks/${rulebookId}/api`,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight mb-2">
          Overview
        </h2>
        {rulebook.description ? (
          <p className="text-[var(--muted-foreground)] text-[15px] max-w-2xl">
            {rulebook.description}
          </p>
        ) : (
          <p className="text-[var(--muted-foreground)]/60 text-[15px] italic">
            No description yet — add one in settings.
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
          <p className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium mb-1">Rules</p>
          <p className="text-2xl font-semibold text-[var(--foreground)] tabular-nums">{enabledRules.length}<span className="text-sm font-normal text-[var(--muted-foreground)]"> / {rules.length}</span></p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
          <p className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium mb-1">Schema fields</p>
          <p className="text-2xl font-semibold text-[var(--foreground)] tabular-nums">{schemaFields}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
          <p className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium mb-1">Status</p>
          <p className="text-sm font-medium text-[var(--foreground)] capitalize">{rulebook.status}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
          <p className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium mb-1">Created</p>
          <p className="text-sm font-medium text-[var(--foreground)]">{new Date(rulebook.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Try it now — primary CTA */}
      <Link
        href="/home"
        className="flex items-center justify-between p-5 mb-8 rounded-xl bg-gradient-to-r from-[var(--brand)]/[0.06] to-[var(--brand)]/[0.02] border border-[var(--brand)]/20 hover:border-[var(--brand)]/40 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center">
            <Play className="w-5 h-5 text-[var(--brand)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Try it now</p>
            <p className="text-[13px] text-[var(--muted-foreground)]">Run a check against this rulebook on the Home page</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--brand)] group-hover:translate-x-0.5 transition-all" />
      </Link>

      {/* Action cards */}
      <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Configure</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-4 p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--muted-foreground)]/25 hover:-translate-y-[1px] transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)]">{action.label}</p>
                <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
