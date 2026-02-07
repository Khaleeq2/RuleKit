// ============================================
// Groq Cloud API Client
// Fetch-based, OpenAI-compatible. No SDK dependency.
// ============================================

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
export const GROQ_MODEL = 'openai/gpt-oss-20b';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChatRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  reasoning_effort?: 'low' | 'medium' | 'high';
  max_completion_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
  stream?: boolean;
}

export interface GroqChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

export interface GroqUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  queue_time?: number;
  prompt_time?: number;
  completion_time?: number;
  total_time?: number;
}

export interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GroqChoice[];
  usage: GroqUsage;
}

export class GroqConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroqConfigError';
  }
}

export class GroqTransientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GroqTransientError';
    this.status = status;
  }
}

export class GroqValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroqValidationError';
  }
}

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new GroqConfigError(
      'No Groq API key configured. Add GROQ_API_KEY to your .env.local file.'
    );
  }
  return key;
}

export async function createGroqChatCompletion(
  request: GroqChatRequest
): Promise<GroqChatResponse> {
  const apiKey = getApiKey();

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => 'Unknown error');

    // Rate limit or server error → transient, safe to retry
    if (res.status === 429 || res.status >= 500) {
      throw new GroqTransientError(
        `Groq API error ${res.status}: ${body}`,
        res.status
      );
    }

    // Auth error → config problem, fail fast
    if (res.status === 401 || res.status === 403) {
      throw new GroqConfigError(
        `Groq API authentication failed (${res.status}). Check your GROQ_API_KEY.`
      );
    }

    // 400 or other client error → validation problem
    throw new GroqValidationError(
      `Groq API request failed (${res.status}): ${body}`
    );
  }

  const data: GroqChatResponse = await res.json();
  return data;
}
