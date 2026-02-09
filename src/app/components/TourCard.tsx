'use client';

import React, { useRef, useEffect } from 'react';
import type { CardComponentProps } from 'nextstepjs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

// ============================================
// Custom Tour Card
// Matches RuleKit's design system (shadcn/ui + CSS vars)
// Includes viewport-boundary safety to prevent clipping
// ============================================

export const TourCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const cardRef = useRef<HTMLDivElement>(null);

  // Keep card within viewport bounds
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.bottom > viewH - 12) {
        el.style.transform = `translateY(-${Math.ceil(rect.bottom - viewH + 16)}px)`;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [currentStep]);

  return (
    <Card ref={cardRef} className="w-[340px] border-[var(--border)] shadow-xl bg-[var(--card)] overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-[var(--muted)]">
        <div
          className="h-full bg-[var(--brand)] transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {step.icon && <span className="text-xl">{step.icon}</span>}
            <CardTitle className="text-base font-semibold text-[var(--foreground)]">
              {step.title}
            </CardTitle>
          </div>
          <button
            onClick={() => skipTour?.()}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-3">
        {step.content}
      </CardContent>

      <CardFooter className="px-5 pb-4 flex items-center justify-between">
        <span className="text-[11px] text-[var(--muted-foreground)] font-medium">
          {currentStep + 1} of {totalSteps}
        </span>
        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              className="h-8 text-xs px-3"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back
            </Button>
          )}
          <Button
            size="sm"
            onClick={nextStep}
            className="h-8 text-xs px-3 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white"
          >
            {isLast ? 'Done' : 'Next'}
            {!isLast && <ArrowRight className="w-3 h-3 ml-1" />}
          </Button>
        </div>
      </CardFooter>

      {arrow}
    </Card>
  );
}
