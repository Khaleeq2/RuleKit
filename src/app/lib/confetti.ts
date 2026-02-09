'use client';

import confetti from 'canvas-confetti';

// ============================================
// Confetti Effects
// Lightweight celebration animations for onboarding milestones
// ============================================

/**
 * Standard celebration burst — used for first evaluation, checklist items
 */
export function celebrationBurst() {
  const defaults = {
    spread: 60,
    ticks: 80,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#34d399', '#fbbf24'],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    origin: { x: 0.3, y: 0.6 },
    angle: 55,
  });
  confetti({
    ...defaults,
    particleCount: 40,
    origin: { x: 0.7, y: 0.6 },
    angle: 125,
  });
}

/**
 * Full-screen celebration — used for completing all onboarding steps
 */
export function fullCelebration() {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#34d399', '#fbbf24'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#34d399', '#fbbf24'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
