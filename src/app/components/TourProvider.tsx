'use client';

import { NextStepProvider, NextStep } from 'nextstepjs';
import { tourSteps } from '@/app/lib/tour-steps';
import { TourCard } from '@/app/components/TourCard';

// ============================================
// Tour Provider
// Wraps the app in NextStepJS context for product tours
// ============================================

export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextStepProvider>
      <NextStep
        steps={tourSteps}
        cardComponent={TourCard}
        shadowRgb="0, 0, 0"
        shadowOpacity="0.3"
      >
        {children}
      </NextStep>
    </NextStepProvider>
  );
}
