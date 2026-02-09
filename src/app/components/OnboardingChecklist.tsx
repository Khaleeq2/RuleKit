'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, ChevronUp, Rocket, ArrowRight } from 'lucide-react';
import { type OnboardingState, getChecklistItems, getCompletedCount } from '@/app/lib/onboarding';

// ============================================
// Onboarding Checklist
// Floating card on /home that tracks progress
// ============================================

interface OnboardingChecklistProps {
  state: OnboardingState;
  onDismiss: () => void;
}

export function OnboardingChecklist({ state, onDismiss }: OnboardingChecklistProps) {
  const [expanded, setExpanded] = useState(true);
  const items = getChecklistItems(state);
  const completed = getCompletedCount(state);
  const total = items.length;
  const progress = (completed / total) * 100;
  const allDone = completed === total;

  if (allDone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm"
    >
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--muted)]/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand)]/15 to-purple-500/10 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-[var(--brand)]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--foreground)]">Get started</p>
              <p className="text-[11px] text-[var(--muted-foreground)]">{completed} of {total} complete</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress ring */}
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16" cy="16" r="13"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="3"
                />
                <circle
                  cx="16" cy="16" r="13"
                  fill="none"
                  stroke="var(--brand)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 0.817} 100`}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--foreground)]">
                {completed}
              </span>
            </div>
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" />
            )}
          </div>
        </button>

        {/* Items */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-1">
                {items.map((item, i) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                      ${item.completed
                        ? 'opacity-60'
                        : 'hover:bg-[var(--muted)]/50'
                      }
                    `}
                  >
                    {/* Check circle */}
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${item.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-[var(--border)] group-hover:border-[var(--brand)]/50'
                      }
                    `}>
                      {item.completed && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.completed ? 'line-through text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'}`}>
                        {item.label}
                      </p>
                      {!item.completed && (
                        <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    {!item.completed && (
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Dismiss */}
              <div className="px-4 pb-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                  className="w-full text-center text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-1"
                >
                  Dismiss checklist
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
