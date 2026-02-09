'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

// ============================================
// Welcome Modal
// Shows once on first login, orients the user
// ============================================

interface WelcomeModalProps {
  onStartEvaluating: () => void;
  onTakeTour: () => void;
  onDismiss: () => void;
}

export function WelcomeModal({ onStartEvaluating, onTakeTour, onDismiss }: WelcomeModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = (callback: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      callback();
    }, 200);
  };

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => handleClose(onDismiss)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={() => handleClose(onDismiss)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Gradient header accent */}
            <div className="h-1.5 bg-gradient-to-r from-[var(--brand)] via-purple-500 to-emerald-500" />

            {/* Content */}
            <div className="px-8 pt-8 pb-6">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--brand)]/15 to-purple-500/10 border border-[var(--brand)]/20 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-[var(--brand)]" />
              </div>

              {/* Text */}
              <h2 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight mb-2">
                Welcome to RuleKit
              </h2>
              <p className="text-[15px] text-[var(--muted-foreground)] leading-relaxed mb-1">
                We&apos;ve set up a sample <strong className="text-[var(--foreground)]">Loan Eligibility</strong> decision with 3 rules so you can see RuleKit in action right away.
              </p>
              <p className="text-sm text-[var(--muted-foreground)]/70 leading-relaxed">
                Type a scenario, and AI evaluates it against every rule — with reasoning for each.
              </p>
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 flex flex-col gap-2.5">
              <Button
                onClick={() => handleClose(onStartEvaluating)}
                className="w-full h-11 text-[14px] font-medium bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white rounded-xl"
              >
                Start evaluating
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleClose(onTakeTour)}
                className="w-full h-11 text-[14px] font-medium rounded-xl border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Take a quick tour
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
