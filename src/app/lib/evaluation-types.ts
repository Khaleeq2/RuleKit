// ============================================
// Evaluation Types
// Structured outputs from Groq-powered rule evaluation
// ============================================

// --- Per-rule evaluation ---

export interface EvidenceSpan {
  text: string;
  start: number;
  end: number;
}

export interface AbsenceProof {
  scanned_sections: string[];
  statement: string;
}

export type RuleVerdict = 'pass' | 'fail' | 'flag' | 'low' | 'medium' | 'high' | 'critical';

export interface RuleEvaluation {
  rule_id: string;
  rule_name: string;
  verdict: RuleVerdict;
  confidence: number;
  reason: string;
  suggestion: string | null;
  evidence_spans: EvidenceSpan[];
  absence_proof: AbsenceProof | null;
}

// --- Overall evaluation result ---

export interface EvaluationResult {
  id: string;
  rulebook_id: string;
  rulebook_name: string;
  input: string;
  verdict: RuleVerdict;
  reason: string;
  evaluations: RuleEvaluation[];
  model_meta: ModelMeta;
  latency_ms: number;
  timestamp: string;
}

export interface ModelMeta {
  model: string;
  prompt_version: string;
  tokens_in: number;
  tokens_out: number;
  reasoning_effort: string;
}

// --- Raw Groq response shape (before normalization) ---

export interface RawGroqEvaluation {
  rule_id: string;
  rule_name: string;
  verdict: string;
  confidence: number;
  reason: string;
  suggestion?: string;
  evidence_spans?: Array<{
    text?: string;
    start?: number;
    end?: number;
  }>;
  absence_proof?: {
    scanned_sections?: string[];
    statement?: string;
  } | null;
}

export interface RawGroqResponse {
  verdict: string;
  reason: string;
  evaluations: RawGroqEvaluation[];
}

// --- Rule shape sent to the evaluator (client → server) ---

export interface EvaluatorRule {
  id: string;
  name: string;
  description: string;
  reason: string;
}

// --- API request/response ---

export interface EvaluateRequest {
  input: string;
  rulebook_id: string;
  rulebook_name: string;
  rules: EvaluatorRule[];
  output_type?: 'pass_fail' | 'pass_flag_fail' | 'risk_level';
}

export interface EvaluateResponse {
  success: boolean;
  result?: EvaluationResult;
  error?: string;
  error_type?: 'config' | 'transient' | 'validation' | 'unknown';
}
