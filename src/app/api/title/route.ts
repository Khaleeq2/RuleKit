// ============================================
// POST /api/title
// Generates a concise session title from the first user message + decision context.
// Uses a fast, low-token Groq call.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createGroqChatCompletion, GROQ_MODEL } from '@/app/lib/groq-client';
import { checkRateLimit } from '@/app/lib/rate-limit';
import { getAuthenticatedUser } from '@/app/lib/api-auth';

interface TitleRequest {
  userMessage: string;
  decisionName: string;
  verdict: 'pass' | 'fail' | null;
}

interface TitleResponse {
  success: boolean;
  title?: string;
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<TitleResponse>> {
  try {
    // Auth check
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = checkRateLimit(`title:${ip}`, { maxRequests: 30, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body: TitleRequest = await req.json();

    if (!body.userMessage || !body.decisionName) {
      return NextResponse.json(
        { success: false, error: 'Missing userMessage or decisionName' },
        { status: 400 }
      );
    }

    const truncatedInput = body.userMessage.slice(0, 300);
    const verdictHint = body.verdict ? ` (verdict: ${body.verdict})` : '';

    const result = await createGroqChatCompletion({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: `Generate a short 3-5 word title for this evaluation session. Output ONLY the title text — nothing else. No quotes, no punctuation, no pipe characters, no explanation.

Good examples:
- Low Credit Loan Check
- High Value Fraud Screen
- Missing Employment Data
- Full Eligibility Review`,
        },
        {
          role: 'user',
          content: `Decision: ${body.decisionName}${verdictHint}\nUser input: ${truncatedInput}`,
        },
      ],
      temperature: 0.3,
      reasoning_effort: 'low',
      max_completion_tokens: 40,
    });

    let title = result.choices[0]?.message?.content?.trim() || '';

    // Sanitize: strip quotes, pipes, bullet markers, trailing punctuation
    title = title.replace(/["'|•\-]/g, '').replace(/[.!?:]+$/, '').trim();
    // Collapse whitespace
    title = title.replace(/\s+/g, ' ');
    // Clamp to 50 chars
    if (title.length > 50) title = title.slice(0, 47).trimEnd() + '...';

    if (!title) {
      return NextResponse.json({ success: false, error: 'Empty title response' });
    }

    return NextResponse.json({ success: true, title });
  } catch (error) {
    console.error('[/api/title] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
