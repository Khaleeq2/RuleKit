// ============================================
// Evaluation Retry Logic
// Exponential backoff with fail-fast on config errors.
// Ported from Assurium's audit-runner pattern.
// ============================================

import { GroqConfigError, GroqTransientError } from './groq-client';

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 8000;

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeDelay(attempt: number, baseMs: number, maxMs: number): number {
  const exponential = baseMs * Math.pow(2, attempt);
  const jitter = Math.random() * baseMs;
  return Math.min(exponential + jitter, maxMs);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const maxRetries = options?.maxRetries ?? MAX_RETRIES;
  const baseDelayMs = options?.baseDelayMs ?? BASE_DELAY_MS;
  const maxDelayMs = options?.maxDelayMs ?? MAX_DELAY_MS;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Config errors should fail immediately — no amount of retrying will fix them
      if (err instanceof GroqConfigError) {
        throw err;
      }

      lastError = err;

      // Only retry on transient errors
      if (!(err instanceof GroqTransientError) && attempt > 0) {
        throw err;
      }

      if (attempt < maxRetries) {
        const delayMs = computeDelay(attempt, baseDelayMs, maxDelayMs);
        options?.onRetry?.(attempt + 1, err, delayMs);
        await sleep(delayMs);
      }
    }
  }

  throw lastError ?? new Error('Retry exhausted with no error captured');
}
