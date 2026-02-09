'use client';

import { motion } from 'motion/react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  TrendingDown,
  Equal,
} from 'lucide-react';
import type { EvaluationResult, RuleVerdict } from '@/app/lib/evaluation-types';

// ============================================
// ComparisonCard — Diff between two evaluations
// ============================================

interface ComparisonCardProps {
  previous: EvaluationResult;
  current: EvaluationResult;
}

type RuleDelta = 'improved' | 'regressed' | 'unchanged';

interface RuleComparison {
  ruleId: string;
  ruleName: string;
  previousVerdict: RuleVerdict;
  currentVerdict: RuleVerdict;
  delta: RuleDelta;
  previousConfidence: number;
  currentConfidence: number;
}

function computeComparisons(
  previous: EvaluationResult,
  current: EvaluationResult
): RuleComparison[] {
  const prevMap = new Map(
    previous.evaluations.map(e => [e.rule_id, e])
  );

  return current.evaluations.map(curr => {
    const prev = prevMap.get(curr.rule_id);
    const previousVerdict = prev?.verdict ?? 'fail';
    const currentVerdict = curr.verdict;

    const positive = new Set(['pass', 'low']);
    const negative = new Set(['fail', 'critical', 'high']);
    let delta: RuleDelta = 'unchanged';
    if (negative.has(previousVerdict) && positive.has(currentVerdict)) delta = 'improved';
    if (positive.has(previousVerdict) && negative.has(currentVerdict)) delta = 'regressed';

    return {
      ruleId: curr.rule_id,
      ruleName: curr.rule_name,
      previousVerdict,
      currentVerdict,
      delta,
      previousConfidence: prev?.confidence ?? 0,
      currentConfidence: curr.confidence,
    };
  });
}

function DeltaIcon({ delta }: { delta: RuleDelta }) {
  switch (delta) {
    case 'improved':
      return (
        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        </div>
      );
    case 'regressed':
      return (
        <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <ArrowDownRight className="w-3 h-3 text-red-600 dark:text-red-400" />
        </div>
      );
    case 'unchanged':
      return (
        <div className="w-5 h-5 rounded-full bg-[var(--muted)] flex items-center justify-center">
          <Minus className="w-3 h-3 text-[var(--muted-foreground)]" />
        </div>
      );
  }
}

const VERDICT_BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pass: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Pass' },
  fail: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Fail' },
  flag: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Flag' },
  low: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Low' },
  medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Medium' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'High' },
  critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Critical' },
};

function VerdictBadge({ verdict }: { verdict: RuleVerdict }) {
  const style = VERDICT_BADGE_STYLES[verdict] || VERDICT_BADGE_STYLES.fail;
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

export function ComparisonCard({ previous, current }: ComparisonCardProps) {
  const comparisons = computeComparisons(previous, current);
  const improved = comparisons.filter(c => c.delta === 'improved').length;
  const regressed = comparisons.filter(c => c.delta === 'regressed').length;
  const unchanged = comparisons.filter(c => c.delta === 'unchanged').length;

  // Overall verdict change
  const verdictChanged = previous.verdict !== current.verdict;
  const overallImproved = previous.verdict === 'fail' && current.verdict === 'pass';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {overallImproved ? (
            <TrendingUp className="w-[18px] h-[18px] text-emerald-600 dark:text-emerald-400" />
          ) : verdictChanged ? (
            <TrendingDown className="w-[18px] h-[18px] text-red-600 dark:text-red-400" />
          ) : (
            <Equal className="w-[18px] h-[18px] text-[var(--muted-foreground)]" />
          )}
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {overallImproved
                ? 'All checks now passing'
                : verdictChanged
                  ? 'Verdict changed'
                  : 'Comparison with previous check'}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {improved > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400">{improved} improved</span>
              )}
              {improved > 0 && (regressed > 0 || unchanged > 0) && ' · '}
              {regressed > 0 && (
                <span className="text-red-600 dark:text-red-400">{regressed} regressed</span>
              )}
              {regressed > 0 && unchanged > 0 && ' · '}
              {unchanged > 0 && (
                <span>{unchanged} unchanged</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Rule-by-rule comparison */}
      <div className="px-1.5 py-1.5">
        {comparisons.map((comp, i) => (
          <div
            key={comp.ruleId}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg ${
              comp.delta === 'improved'
                ? 'bg-emerald-50/50 dark:bg-emerald-900/5'
                : comp.delta === 'regressed'
                  ? 'bg-red-50/50 dark:bg-red-900/5'
                  : ''
            }`}
          >
            <DeltaIcon delta={comp.delta} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">
                {comp.ruleName}
              </p>
            </div>

            {/* Before → After badges */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <VerdictBadge verdict={comp.previousVerdict} />
              <span className="text-[10px] text-[var(--muted-foreground)]">→</span>
              <VerdictBadge verdict={comp.currentVerdict} />
            </div>

            {/* Confidence delta */}
            <div className="w-12 text-right flex-shrink-0">
              {comp.delta !== 'unchanged' ? (
                <span className={`text-[10px] tabular-nums font-medium ${
                  comp.currentConfidence > comp.previousConfidence
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {comp.currentConfidence > comp.previousConfidence ? '+' : ''}
                  {Math.round((comp.currentConfidence - comp.previousConfidence) * 100)}%
                </span>
              ) : (
                <span className="text-[10px] tabular-nums text-[var(--muted-foreground)]">
                  {Math.round(comp.currentConfidence * 100)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Divider between rows */}
      {comparisons.length > 1 && (
        <div className="px-3.5">
          {/* Spacer handled by py on parent */}
        </div>
      )}
    </motion.div>
  );
}
