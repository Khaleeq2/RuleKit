// ============================================
// POST /api/evaluate
// Accepts input + rules from client, calls Groq, returns structured result.
// Server-side only — protects GROQ_API_KEY.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { evaluateRules } from '@/app/lib/groq-evaluator';
import { GroqConfigError, GroqTransientError, GroqValidationError } from '@/app/lib/groq-client';
import type { EvaluateRequest, EvaluateResponse } from '@/app/lib/evaluation-types';
import { checkRateLimit } from '@/app/lib/rate-limit';
import { getAuthenticatedUser } from '@/app/lib/api-auth';

export async function POST(req: NextRequest): Promise<NextResponse<EvaluateResponse>> {
  try {
    // Auth check
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', error_type: 'unknown' },
        { status: 401 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed, remaining } = checkRateLimit(`evaluate:${ip}`, { maxRequests: 20, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment.', error_type: 'unknown' },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    const body: EvaluateRequest = await req.json();

    // Validate request shape
    if (!body.input || typeof body.input !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid "input" field', error_type: 'validation' },
        { status: 400 }
      );
    }

    if (!body.rules || !Array.isArray(body.rules) || body.rules.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one rule is required', error_type: 'validation' },
        { status: 400 }
      );
    }

    if (!body.decision_id || !body.decision_name) {
      return NextResponse.json(
        { success: false, error: 'Missing decision_id or decision_name', error_type: 'validation' },
        { status: 400 }
      );
    }

    // Validate each rule has required fields
    for (const rule of body.rules) {
      if (!rule.id || !rule.name) {
        return NextResponse.json(
          { success: false, error: 'Each rule must have "id" and "name"', error_type: 'validation' },
          { status: 400 }
        );
      }
    }

    const result = await evaluateRules(
      body.input,
      body.rules,
      body.decision_id,
      body.decision_name
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[/api/evaluate] Error:', error);

    if (error instanceof GroqConfigError) {
      return NextResponse.json(
        { success: false, error: error.message, error_type: 'config' },
        { status: 503 }
      );
    }

    if (error instanceof GroqTransientError) {
      return NextResponse.json(
        { success: false, error: 'Groq API is temporarily unavailable. Please try again.', error_type: 'transient' },
        { status: 502 }
      );
    }

    if (error instanceof GroqValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, error_type: 'validation' },
        { status: 422 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message, error_type: 'unknown' },
      { status: 500 }
    );
  }
}
