// ============================================
// POST /api/chat
// Conversational follow-up via Groq SSE streaming.
// Handles: explain results, what-if modifications, general questions.
// Server-side only — protects GROQ_API_KEY.
// ============================================

import { NextRequest } from 'next/server';
import { GroqConfigError } from '@/app/lib/groq-client';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = 'openai/gpt-oss-20b';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  context?: {
    decision_name?: string;
    last_evaluation?: {
      verdict: string;
      reason: string;
      evaluations: Array<{
        rule_name: string;
        verdict: string;
        reason: string;
      }>;
    };
  };
}

const CHAT_SYSTEM_PROMPT = `You are a rules evaluation assistant for RuleKit. You help users understand evaluation results, explore "what-if" scenarios, and make informed decisions.

## Your Role
- You have access to the context of the most recent rule evaluation.
- Answer questions about why rules passed or failed.
- When users ask "what if" questions, explain what would change and why.
- Be concise, direct, and evidence-based. No fluff.
- Use the evaluation context provided to ground your answers.
- If you don't have enough context to answer, say so honestly.

## Style
- Short paragraphs. No bullet-point walls.
- Accessible language — write for business users, not developers.
- Use natural field names like "transaction amount" or "credit score", never code-style names like "transaction_amount" or "credit_score".
- Never make up rule results — only reference what's in the evaluation context.
- When discussing rule outcomes, always cite the specific rule name.
- Never mention the underlying AI model, tokens, or implementation details.`;

function buildContextMessage(context: ChatRequest['context']): string {
  if (!context?.last_evaluation) return '';

  const eval_ = context.last_evaluation;
  const lines = [
    `## Current Evaluation Context`,
    `**Decision**: ${context.decision_name || 'Unknown'}`,
    `**Overall Verdict**: ${eval_.verdict}`,
    `**Reason**: ${eval_.reason}`,
    '',
    '**Per-rule results:**',
  ];

  for (const e of eval_.evaluations) {
    lines.push(`- **${e.rule_name}**: ${e.verdict} — ${e.reason}`);
  }

  return lines.join('\n');
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

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = getApiKey();

    // Build messages array with system prompt + evaluation context
    const messages: ChatMessage[] = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
    ];

    // Inject evaluation context if available
    const contextText = buildContextMessage(body.context);
    if (contextText) {
      messages.push({ role: 'user', content: contextText });
      messages.push({
        role: 'assistant',
        content: 'I have the evaluation context. How can I help you understand these results?',
      });
    }

    // Add conversation history (limit to last 10 messages to control context size)
    const recentMessages = body.messages.slice(-10);
    messages.push(...recentMessages);

    // Call Groq with streaming
    const groqRes = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.3,
        max_completion_tokens: 4096,
        stream: true,
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text().catch(() => 'Unknown error');

      if (groqRes.status === 401 || groqRes.status === 403) {
        return new Response(
          JSON.stringify({ error: 'Groq API authentication failed. Check your GROQ_API_KEY.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (groqRes.status === 429 || groqRes.status >= 500) {
        return new Response(
          JSON.stringify({ error: 'Groq API is temporarily unavailable. Please try again.' }),
          { status: 502, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Groq API error: ${errorText}` }),
        { status: groqRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response as SSE
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = groqRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === 'data: [DONE]') continue;
              if (!trimmed.startsWith('data: ')) continue;

              try {
                const json = JSON.parse(trimmed.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // Skip malformed SSE chunks
              }
            }
          }
        } catch (err) {
          console.error('[/api/chat] Stream error:', err);
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[/api/chat] Error:', error);

    if (error instanceof GroqConfigError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
