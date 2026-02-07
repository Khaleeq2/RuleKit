'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import type { EvaluationResult, RuleEvaluation } from '@/app/lib/evaluation-types';

// ============================================
// RuleCheckRow — Individual rule evaluation
// ============================================

interface RuleCheckRowProps {
  evaluation: RuleEvaluation;
  index: number;
  isLast: boolean;
}

function RuleCheckRow({ evaluation, index, isLast }: RuleCheckRowProps) {
  const [expanded, setExpanded] = useState(false);
  const passed = evaluation.verdict === 'pass';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all text-left
          hover:bg-[var(--muted)]/50
          ${passed ? 'bg-[var(--success)]/5' : 'bg-[var(--destructive)]/5'}
        `}
      >
        {/* Status icon */}
        <div className="flex-shrink-0">
          {passed ? (
            <div className="w-5 h-5 rounded-full bg-[var(--success)] flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-[var(--destructive)] flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Rule name + reason preview */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)]">
            {evaluation.rule_name}
          </p>
          {!expanded && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
              {evaluation.reason}
            </p>
          )}
        </div>

        {/* Confidence + expand chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] tabular-nums ${
            evaluation.confidence < 0.7
              ? 'text-amber-600 dark:text-amber-400 font-medium'
              : 'text-[var(--muted-foreground)]'
          }`}>
            {Math.round(evaluation.confidence * 100)}%
          </span>
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3 pt-1 ml-8 space-y-2.5">
              {/* Reason */}
              <p className="text-xs text-[var(--foreground)]/80 leading-relaxed">
                {evaluation.reason}
              </p>

              {/* Evidence spans (for passes) */}
              {evaluation.evidence_spans.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest">
                    Evidence
                  </p>
                  {evaluation.evidence_spans.map((span, i) => (
                    <div
                      key={i}
                      className="text-xs bg-[var(--success)]/8 border border-[var(--success)]/20 rounded-md px-2.5 py-1.5 text-[var(--foreground)]/70 font-mono"
                    >
                      &ldquo;{span.text}&rdquo;
                    </div>
                  ))}
                </div>
              )}

              {/* Absence proof (for failures) */}
              {evaluation.absence_proof && (
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest">
                    What was missing
                  </p>
                  <p className="text-xs text-[var(--foreground)]/70">
                    {evaluation.absence_proof.statement}
                  </p>
                  {evaluation.absence_proof.scanned_sections.length > 0 && (
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      Checked: {evaluation.absence_proof.scanned_sections.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Suggestion (for failures) */}
              {evaluation.suggestion && (
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 rounded-md px-2.5 py-2">
                  <Lightbulb className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    {evaluation.suggestion}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider between rows (except last) */}
      {!isLast && !expanded && (
        <div className="mx-3.5 border-b border-[var(--border)]/30" />
      )}
    </motion.div>
  );
}

// ============================================
// RuleResultCard — Full evaluation result
// ============================================

interface RuleResultCardProps {
  result: EvaluationResult;
  onRetry?: (previousInput: string) => void;
}

export function RuleResultCard({ result, onRetry }: RuleResultCardProps) {
  const passed = result.verdict === 'pass';
  const passCount = result.evaluations.filter(e => e.verdict === 'pass').length;
  const failCount = result.evaluations.filter(e => e.verdict === 'fail').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden"
    >
      {/* Header — verdict bar */}
      <div className={`px-4 py-3 flex items-center justify-between ${
        passed
          ? 'bg-[var(--success)]/8 border-b border-[var(--success)]/15'
          : 'bg-[var(--destructive)]/8 border-b border-[var(--destructive)]/15'
      }`}>
        <div className="flex items-center gap-2.5">
          {passed ? (
            <ShieldCheck className="w-[18px] h-[18px] text-[var(--success)]" />
          ) : (
            <ShieldAlert className="w-[18px] h-[18px] text-[var(--destructive)]" />
          )}
          <div>
            <p className={`text-sm font-semibold ${
              passed ? 'text-[var(--success)]' : 'text-[var(--destructive)]'
            }`}>
              {passed ? 'Passed' : 'Needs Review'}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {result.decision_name}
            </p>
          </div>
        </div>

        {/* Pass/fail counts */}
        <div className="flex items-center gap-3 text-xs tabular-nums">
          {passCount > 0 && (
            <span className="flex items-center gap-1 text-[var(--success)]">
              <Check className="w-3 h-3" />
              {passCount}
            </span>
          )}
          {failCount > 0 && (
            <span className="flex items-center gap-1 text-[var(--destructive)]">
              <X className="w-3 h-3" />
              {failCount}
            </span>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="px-4 py-2.5">
        <p className="text-sm text-[var(--foreground)]/80">{result.reason}</p>
      </div>

      {/* Rule checks */}
      <div className="px-1.5 pb-1.5">
        {result.evaluations.map((evaluation, index) => (
          <RuleCheckRow
            key={evaluation.rule_id}
            evaluation={evaluation}
            index={index}
            isLast={index === result.evaluations.length - 1}
          />
        ))}
      </div>

      {/* What to try — recovery section (fail verdicts only) */}
      {!passed && (() => {
        const suggestions = result.evaluations
          .filter(e => e.verdict === 'fail' && e.suggestion)
          .map(e => ({ rule: e.rule_name, suggestion: e.suggestion! }));
        if (suggestions.length === 0) return null;
        return (
          <div className="mx-3 mb-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">What to try</p>
            </div>
            <ul className="space-y-1.5">
              {suggestions.map((s, i) => (
                <li key={i} className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                  <span className="font-medium text-amber-800 dark:text-amber-300">{s.rule}:</span>{' '}
                  {s.suggestion}
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {/* Retry button (fail verdicts only) */}
      {!passed && onRetry && (
        <div className="mx-3 mb-3">
          <button
            onClick={() => onRetry(result.input)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium text-[var(--foreground)] bg-[var(--muted)]/60 hover:bg-[var(--muted)] border border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30 focus-visible:ring-offset-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Adjust &amp; re-check
          </button>
        </div>
      )}

      {/* Footer — minimal metadata */}
      <div className="border-t border-[var(--border)]/50 px-4 py-2 flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
        <Clock className="w-3 h-3" />
        <span>Evaluated in {result.latency_ms}ms</span>
      </div>
    </motion.div>
  );
}

// ============================================
// EvaluationSkeleton — Loading state
// ============================================

interface EvaluationSkeletonProps {
  ruleNames?: string[];
}

export function EvaluationSkeleton({ ruleNames = [] }: EvaluationSkeletonProps) {
  const [step, setStep] = useState(0);
  const totalRules = ruleNames.length;

  // Phase progression: 0=validating, 1..N=checking rule i, N+1=generating verdict
  const totalSteps = totalRules > 0 ? totalRules + 2 : 3;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (totalRules > 0) {
      // Validating input → then each rule → then verdict
      timers.push(setTimeout(() => setStep(1), 800));
      for (let i = 1; i <= totalRules; i++) {
        timers.push(setTimeout(() => setStep(i + 1), 800 + i * 900));
      }
    } else {
      timers.push(setTimeout(() => setStep(1), 1200));
      timers.push(setTimeout(() => setStep(2), 3000));
    }
    return () => timers.forEach(clearTimeout);
  }, [totalRules]);

  // Derive label from step
  let label: string;
  if (step === 0) {
    label = 'Validating input…';
  } else if (totalRules > 0 && step <= totalRules) {
    label = `Checking: ${ruleNames[step - 1]}`;
  } else {
    label = 'Generating verdict…';
  }

  const progress = Math.min(((step + 1) / totalSteps) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden"
    >
      {/* Header — phased status with progress bar */}
      <div className="px-4 py-3 border-b border-[var(--border)]/50">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-[18px] h-[18px] text-[var(--brand)] animate-spin flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {label}
            </p>
            {totalRules > 0 && step > 0 && step <= totalRules && (
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                Rule {step} of {totalRules}
              </p>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 rounded-full bg-[var(--muted)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[var(--brand)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Skeleton rows */}
      <div className="px-4 py-3 space-y-3">
        {(totalRules > 0 ? ruleNames : [1, 2, 3]).map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex-shrink-0 ${
              i < step - 1 ? 'bg-[var(--muted)]' : 'bg-[var(--muted)] animate-pulse'
            }`} />
            <div className="flex-1 space-y-1.5">
              {typeof item === 'string' ? (
                <p className={`text-xs truncate ${i < step - 1 ? 'text-[var(--muted-foreground)]' : 'text-[var(--muted-foreground)]/50'}`}>
                  {item}
                </p>
              ) : (
                <>
                  <div className="h-3 w-2/3 bg-[var(--muted)] rounded animate-pulse" />
                  <div className="h-2.5 w-1/2 bg-[var(--muted)] rounded animate-pulse" />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton footer */}
      <div className="border-t border-[var(--border)]/50 px-4 py-2.5">
        <div className="h-2.5 w-40 bg-[var(--muted)] rounded animate-pulse" />
      </div>
    </motion.div>
  );
}
