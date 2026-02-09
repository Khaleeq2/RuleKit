// ============================================
// Groq Evaluator
// Builds prompt, calls Groq, validates + normalizes JSON response.
// Ported from Assurium's groq-auditor pattern.
// ============================================

import {
  createGroqChatCompletion,
  GroqValidationError,
  GROQ_MODEL,
} from './groq-client';
import type { GroqMessage, GroqChatResponse } from './groq-client';
import type {
  EvaluatorRule,
  RawGroqResponse,
  RawGroqEvaluation,
  RuleEvaluation,
  EvaluationResult,
  EvidenceSpan,
  AbsenceProof,
  ModelMeta,
  RuleVerdict,
} from './evaluation-types';

// ============================================
// Retry helper (inlined from evaluation-retry.ts)
// ============================================

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * 2 ** attempt));
      }
    }
  }
  throw lastError;
}

// ============================================
// Constants
// ============================================

const PROMPT_VERSION = '1.0.0';
const REASONING_EFFORT = 'medium' as const;
const MAX_COMPLETION_TOKENS = 16384;

// ============================================
// System Prompt
// ============================================

const SYSTEM_PROMPT = `You are a precise rules evaluation engine. You evaluate user-submitted input against a set of rules and return a structured JSON result.

## Your Task
For each rule provided, determine whether the input PASSES or FAILS the rule. Your evaluation must be:
- **Deterministic**: Same input + rules = same result, every time.
- **Evidence-based**: Every PASS must cite exact text from the input. Every FAIL must explain what was looked for and not found.
- **Honest**: If the input is ambiguous or insufficient, FAIL the rule and explain why.

## Output Format
Return a single JSON object with this exact structure:
{
  "verdict": "pass" | "fail",
  "reason": "One-sentence summary of the overall result",
  "evaluations": [
    {
      "rule_id": "string (from the rule definition)",
      "rule_name": "string (from the rule definition)",
      "verdict": "pass" | "fail",
      "confidence": 0.0 to 1.0,
      "reason": "Why this rule passed or failed",
      "evidence_spans": [
        {
          "text": "exact quoted text from the input that supports the verdict",
          "start": 0,
          "end": 10
        }
      ],
      "absence_proof": null | {
        "scanned_sections": ["list of areas/fields checked"],
        "statement": "What was expected but not found"
      },
      "suggestion": "For FAIL verdicts: a specific, actionable sentence telling the user what data to provide to pass this rule. For PASS verdicts: null."
    }
  ]
}

## Rules
- The overall "verdict" is "pass" ONLY if ALL rules pass. If any rule fails, the overall verdict is "fail".
- "evidence_spans" should contain direct quotes from the input for PASS verdicts. For FAIL verdicts, set evidence_spans to an empty array.
- "absence_proof" should be null for PASS verdicts. For FAIL verdicts, provide what you searched for and didn't find.
- "suggestion" should be null for PASS verdicts. For FAIL verdicts, provide a specific, actionable instruction telling the user exactly what data or field to include to pass the rule (e.g., "Include a numeric credit_score field above 700" or "Provide employment_status as 'full-time', 'part-time', or 'self-employed'").
- "confidence" should reflect how certain you are: 1.0 = definitive, 0.5 = borderline, below 0.5 = uncertain.
- Return one evaluation per rule, in the same order as the rules are provided.
- Output ONLY the JSON object. No markdown, no explanation outside the JSON.`;

// ============================================
// Prompt Builder
// ============================================

function buildUserPrompt(input: string, rules: EvaluatorRule[]): string {
  const rulesBlock = rules
    .map(
      (r, i) =>
        `### Rule ${i + 1}: ${r.name}\n- **ID**: ${r.id}\n- **Description**: ${r.description}\n- **Expected behavior**: ${r.reason}`
    )
    .join('\n\n');

  return `## Rules to Evaluate\n\n${rulesBlock}\n\n---\n\n## Input to Evaluate\n\n\`\`\`\n${input}\n\`\`\``;
}

// ============================================
// Validation Helpers (strict, no fallbacks)
// ============================================

function ensureString(val: unknown, field: string): string {
  if (typeof val !== 'string') {
    throw new GroqValidationError(
      `Expected string for "${field}", got ${typeof val}`
    );
  }
  return val;
}

function ensureNumber(val: unknown, field: string): number {
  if (typeof val !== 'number' || isNaN(val)) {
    throw new GroqValidationError(
      `Expected number for "${field}", got ${typeof val}`
    );
  }
  return val;
}

function ensureArray(val: unknown, field: string): unknown[] {
  if (!Array.isArray(val)) {
    throw new GroqValidationError(
      `Expected array for "${field}", got ${typeof val}`
    );
  }
  return val;
}

function normalizeVerdict(raw: string): RuleVerdict {
  const v = raw.toLowerCase().trim();
  if (v === 'pass' || v === 'passed') return 'pass';
  if (v === 'fail' || v === 'failed') return 'fail';
  throw new GroqValidationError(`Invalid verdict: "${raw}"`);
}

// ============================================
// Response Validation
// ============================================

function validateRawResponse(parsed: unknown): RawGroqResponse {
  if (!parsed || typeof parsed !== 'object') {
    throw new GroqValidationError('Groq response is not an object');
  }

  const obj = parsed as Record<string, unknown>;

  const verdict = ensureString(obj.verdict, 'verdict');
  const reason = ensureString(obj.reason, 'reason');
  const evaluations = ensureArray(obj.evaluations, 'evaluations');

  const validatedEvals: RawGroqEvaluation[] = evaluations.map((e, i) => {
    if (!e || typeof e !== 'object') {
      throw new GroqValidationError(`evaluations[${i}] is not an object`);
    }
    const ev = e as Record<string, unknown>;

    return {
      rule_id: ensureString(ev.rule_id, `evaluations[${i}].rule_id`),
      rule_name: ensureString(ev.rule_name, `evaluations[${i}].rule_name`),
      verdict: ensureString(ev.verdict, `evaluations[${i}].verdict`),
      confidence: ensureNumber(ev.confidence, `evaluations[${i}].confidence`),
      reason: ensureString(ev.reason, `evaluations[${i}].reason`),
      evidence_spans: Array.isArray(ev.evidence_spans)
        ? ev.evidence_spans
        : [],
      absence_proof:
        ev.absence_proof && typeof ev.absence_proof === 'object'
          ? (ev.absence_proof as RawGroqEvaluation['absence_proof'])
          : null,
    };
  });

  return { verdict, reason, evaluations: validatedEvals };
}

// ============================================
// Evidence Normalization
// ============================================

function normalizeEvidenceSpans(
  raw: RawGroqEvaluation['evidence_spans'],
  input: string
): EvidenceSpan[] {
  if (!raw || !Array.isArray(raw)) return [];

  return raw
    .filter((s) => s && typeof s.text === 'string' && s.text.trim().length > 0)
    .map((s) => {
      const text = s.text!.trim();
      // Try to locate the span in the input for deterministic offsets
      const idx = input.indexOf(text);
      const start =
        typeof s.start === 'number' && s.start >= 0 ? s.start : Math.max(idx, 0);
      const end =
        typeof s.end === 'number' && s.end > start
          ? s.end
          : start + text.length;
      return { text, start, end };
    });
}

function normalizeAbsenceProof(
  raw: RawGroqEvaluation['absence_proof']
): AbsenceProof | null {
  if (!raw || typeof raw !== 'object') return null;

  return {
    scanned_sections: Array.isArray(raw.scanned_sections)
      ? raw.scanned_sections.filter(
          (s): s is string => typeof s === 'string'
        )
      : [],
    statement:
      typeof raw.statement === 'string' ? raw.statement : 'No details provided',
  };
}

// ============================================
// Transform raw → final
// ============================================

function transformEvaluations(
  raw: RawGroqResponse,
  input: string
): RuleEvaluation[] {
  return raw.evaluations.map((e) => ({
    rule_id: e.rule_id,
    rule_name: e.rule_name,
    verdict: normalizeVerdict(e.verdict),
    confidence: Math.max(0, Math.min(1, e.confidence)),
    reason: e.reason,
    suggestion: typeof e.suggestion === 'string' && e.suggestion.trim() ? e.suggestion.trim() : null,
    evidence_spans: normalizeEvidenceSpans(e.evidence_spans, input),
    absence_proof: normalizeAbsenceProof(e.absence_proof),
  }));
}

// ============================================
// Main Evaluator
// ============================================

export async function evaluateRules(
  input: string,
  rules: EvaluatorRule[],
  decisionId: string,
  decisionName: string
): Promise<EvaluationResult> {
  const startTime = Date.now();

  const userPrompt = buildUserPrompt(input, rules);

  const messages: GroqMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  const baseRequest = {
    model: GROQ_MODEL,
    messages,
    temperature: 0.0,
    reasoning_effort: REASONING_EFFORT,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
  };

  // Call Groq with retry, JSON mode primary, text fallback
  const response = await withRetry<GroqChatResponse>(async () => {
    try {
      return await createGroqChatCompletion({
        ...baseRequest,
        response_format: { type: 'json_object' },
      });
    } catch (primaryError) {
      // If json_object mode fails, retry without it (Assurium fallback pattern)
      const msg =
        primaryError instanceof Error
          ? primaryError.message
          : String(primaryError);
      console.warn(
        '[Evaluator] JSON mode failed, retrying without response_format:',
        msg
      );

      return await createGroqChatCompletion(baseRequest);
    }
  });

  // Extract content
  if (!response.choices.length) {
    throw new GroqValidationError('Groq API returned no choices');
  }

  const first = response.choices[0];
  if (!first?.message?.content) {
    throw new GroqValidationError('Groq response missing message content');
  }

  const content = first.message.content;

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new GroqValidationError(
      `Failed to parse Groq response as JSON: ${content.slice(0, 200)}`
    );
  }

  // Validate and normalize
  const raw = validateRawResponse(parsed);
  const evaluations = transformEvaluations(raw, input);

  const overallVerdict: RuleVerdict = evaluations.every(
    (e) => e.verdict === 'pass'
  )
    ? 'pass'
    : 'fail';

  const modelMeta: ModelMeta = {
    model: response.model || GROQ_MODEL,
    prompt_version: PROMPT_VERSION,
    tokens_in: response.usage?.prompt_tokens ?? 0,
    tokens_out: response.usage?.completion_tokens ?? 0,
    reasoning_effort: REASONING_EFFORT,
  };

  const latencyMs = Date.now() - startTime;

  return {
    id: `eval-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    decision_id: decisionId,
    decision_name: decisionName,
    input,
    verdict: overallVerdict,
    reason: raw.reason,
    evaluations,
    model_meta: modelMeta,
    latency_ms: latencyMs,
    timestamp: new Date().toISOString(),
  };
}
