'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Clock, Sparkles, Zap } from 'lucide-react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  routeAssistantQuery,
  type AssistantResponse,
  type AssistantStats,
  type AssistantValidationResult,
} from '@/app/lib/assistant/router';
import { formatRelativeTime } from '@/app/lib/time-utils';

type ChatMessage =
  | { id: string; role: 'user'; text: string; createdAt: string }
  | { id: string; role: 'assistant'; response: AssistantResponse; createdAt: string };

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function AskAssistant({
  loading,
  stats,
  validations,
  refreshValidations,
  refreshStats,
}: {
  loading: boolean;
  stats: AssistantStats;
  validations: AssistantValidationResult[];
  refreshValidations: () => Promise<void>;
  refreshStats: () => Promise<void>;
}) {
  const router = useRouter();
  const handledAskParamRef = useRef(false);

  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const suggestedPrompts = useMemo(() => {
    const base = [
      'Show failures',
      'Show recent decisions',
      'Execute rules',
      'Create a rule',
      'Upload an asset',
      'Why did my pass rate change?',
    ];
    if (stats.passRateTrend <= -5) {
      return ['Explain the pass rate drop', ...base];
    }
    return base;
  }, [stats.passRateTrend]);

  const submit = async (value?: string) => {
    const q = (value ?? input).trim();
    if (!q || running) return;

    const nowIso = new Date().toISOString();
    const userMsg: ChatMessage = { id: makeId(), role: 'user', text: q, createdAt: nowIso };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const response = routeAssistantQuery(q, { stats, validations });
    const assistantMsg: ChatMessage = {
      id: makeId(),
      role: 'assistant',
      response,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    if (response.intent === 'execute_rules' || response.actions?.some((a) => a.type === 'runValidation')) {
      // Only auto-run when the user explicitly asked to execute.
      if (/(execute|run).*(rules|validation)/i.test(q) || /^execute rules$/i.test(q)) {
        await runValidation();
      }
    }
  };

  const runValidation = async () => {
    if (running) return;
    setRunning(true);
    try {
      const res = await fetch('/api/validations/run', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to run validation');
      await Promise.all([refreshValidations(), refreshStats()]);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: 'assistant',
          createdAt: new Date().toISOString(),
          response: {
            text: 'Done — I refreshed your Recent Decisions.',
            actions: [{ type: 'link', label: 'View results', href: '/dashboard/validation', variant: 'outline' }],
          },
        },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: 'assistant',
          createdAt: new Date().toISOString(),
          response: { text: e?.message || 'Validation failed. Try again from the Validation page.' },
        },
      ]);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ask = new URLSearchParams(window.location.search).get('ask');
    if (!ask) return;
    if (handledAskParamRef.current) return;
    handledAskParamRef.current = true;
    // fire and forget; submit will enqueue messages
    submit(ask);
    router.replace('/dashboard');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const showThread = messages.length > 0;
  const preview = messages.slice(-6);

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-6 mb-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {greetingForNow()}.
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Ask about recent decisions, explain failures, or run validation.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button asChild variant="outline">
            <Link href="/dashboard/validation" prefetch className="gap-2">
              <ArrowUpRight className="w-4 h-4" />
              View results
            </Link>
          </Button>
          <Button
            onClick={runValidation}
            disabled={running}
            className="gap-2 bg-gradient-to-b from-zinc-800 to-zinc-950 border-t border-white/10 shadow-sm hover:from-zinc-700 hover:to-zinc-900 text-white"
          >
            <Zap className="w-4 h-4" />
            {running ? 'Running…' : 'Execute rules'}
          </Button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-card)] p-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask anything… e.g. “Show failures” or “Why did my pass rate change?”"
              className="h-12 text-base rounded-xl"
              disabled={loading || running}
            />
          </div>
          <Button onClick={() => submit()} disabled={loading || running || input.trim().length === 0} size="icon">
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {suggestedPrompts.slice(0, 6).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => submit(p)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {showThread && (
        <div className="mt-4 space-y-3">
          {preview.map((m) => {
            if (m.role === 'user') {
              return (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[720px] rounded-2xl bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm">
                    {m.text}
                  </div>
                </div>
              );
            }

            const r = m.response;
            return (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[900px] w-full">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm">
                    <p className="text-sm text-[var(--foreground)]">{r.text}</p>

                    {r.actions && r.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {r.actions.map((a, idx) => {
                          if (a.type === 'runValidation') {
                            return (
                              <Button key={`${a.type}-${idx}`} onClick={runValidation} variant="outline" className="gap-2">
                                <Zap className="w-4 h-4" />
                                {a.label}
                              </Button>
                            );
                          }
                          return (
                            <Button key={`${a.type}-${idx}`} asChild variant={a.variant ?? 'outline'}>
                              <Link href={a.href} prefetch className="gap-2">
                                {a.label}
                                <ArrowUpRight className="w-4 h-4" />
                              </Link>
                            </Button>
                          );
                        })}
                      </div>
                    )}

                    {r.cards?.map((card, idx) => {
                      if (card.type !== 'validation_list') return null;
                      return (
                        <div key={`${card.type}-${idx}`} className="mt-4 rounded-xl border border-[var(--border)] overflow-hidden">
                          <div className="px-4 py-3 bg-[var(--muted)]/40 border-b border-[var(--border)]">
                            <div className="text-xs font-medium tracking-wide uppercase text-[var(--muted-foreground)]">
                              {card.title}
                            </div>
                          </div>
                          <div>
                            {card.items.map((it) => {
                              const timeData = formatRelativeTime(it.timestamp);
                              return (
                                <Link
                                  key={it.id}
                                  href={it.href}
                                  prefetch
                                  className={`flex items-center justify-between gap-4 p-3 hover:bg-[var(--muted)]/30 transition-all border-b border-[var(--border)] last:border-b-0 ${
                                    it.status === 'failed' ? 'border-l-4 border-l-red-500' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div
                                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                        it.status === 'passed' ? 'bg-emerald-500' : 'bg-red-500'
                                      }`}
                                    />
                                    <span className="text-sm font-medium text-[var(--foreground)] truncate">
                                      {it.primary}
                                    </span>
                                    {it.secondary && (
                                      <span className="text-sm text-[var(--muted-foreground)] truncate hidden sm:block">
                                        {it.secondary}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-[var(--muted-foreground)]" title={timeData.absolute}>
                                      {timeData.relative}
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-[var(--muted-foreground)] opacity-60" />
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    {r.intent === 'execute_rules' && <Badge variant="outline">Automation</Badge>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

