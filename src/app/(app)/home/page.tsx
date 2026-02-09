'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import TextareaAutosize from 'react-textarea-autosize';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  ArrowUp,
  GitBranch,
  Loader2,
  Paperclip,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  ChevronRight,
  Lightbulb,
  Upload,
  FileText,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { RuleResultCard, EvaluationSkeleton } from '@/app/components/RuleResultCard';
import { ComparisonCard } from '@/app/components/ComparisonCard';
import MarkdownContent from '@/app/components/MarkdownContent';
import { decisionsRepo, rulesRepo } from '@/app/lib/decisions';
import { DecisionWithStats } from '@/app/lib/types';
import type { EvaluateResponse, EvaluationResult } from '@/app/lib/evaluation-types';
import { sessionsRepo, type Session, type SessionMessage } from '@/app/lib/sessions';
import { formatRelativeTime } from '@/app/lib/time-utils';
import { toast } from 'sonner';

// Types for the execution flow
interface RuleCheck {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
}

interface ExecutionResult {
  id: string;
  decisionName: string;
  input: string;
  verdict: 'pass' | 'fail';
  reason: string;
  rules: RuleCheck[];
  latencyMs: number;
  credits: number;
  timestamp: Date;
  evaluation?: EvaluationResult;
}

interface Message {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: Date;
  execution?: ExecutionResult;
  isStreaming?: boolean;
}

// Default prompt suggestions — shown regardless of which decision is selected
interface PromptSuggestion { title: string; content: string; }
const DEFAULT_SUGGESTIONS: PromptSuggestion[] = [
  { title: 'Paste your data', content: 'Paste your input data here to check against the selected rules' },
  { title: 'Try a JSON payload', content: '{ "name": "Jane Doe", "email": "jane@example.com", "amount": 25000 }' },
  { title: 'Ask a question', content: 'What rules are active for this decision?' },
];

export default function HomePage() {
  const [decisions, setDecisions] = useState<DecisionWithStats[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<string>('');
  const [runInput, setRunInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [activeRuleNames, setActiveRuleNames] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastEvaluationRef = useRef<EvaluationResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const busyLockRef = useRef(false);
  const titleGeneratedRef = useRef(false);
  const forceEvaluateRef = useRef(false);

  const CONTENT_MAX_W = 800;

  // Load session by ID — extracted so it can be called from both URL param and recent session cards
  const loadSessionById = async (id: string) => {
    const session = await sessionsRepo.getById(id);
    if (!session) {
      toast.error('Session not found');
      return;
    }

    const loadedMessages: Message[] = session.messages.map(sm => {
      const msg: Message = {
        id: sm.id,
        type: sm.type,
        content: sm.content,
        timestamp: new Date(sm.timestamp),
      };

      if (sm.evaluation) {
        const ev = sm.evaluation;
        msg.execution = {
          id: ev.id,
          decisionName: session.decisionName,
          input: ev.input || '',
          verdict: ev.verdict,
          reason: ev.reason,
          rules: ev.evaluations.map(e => ({
            id: e.rule_id,
            name: e.rule_name,
            status: e.verdict === 'pass' ? 'passed' as const : 'failed' as const,
            message: e.reason,
          })),
          latencyMs: ev.latency_ms,
          credits: 1,
          timestamp: new Date(sm.timestamp),
          evaluation: ev,
        };
        lastEvaluationRef.current = ev;
      }

      return msg;
    });

    setSelectedDecision(session.decisionId);
    setSessionId(session.id);
    setMessages(loadedMessages);
    titleGeneratedRef.current = true; // Existing session already has a title
    // Move focus to composer after session loads
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // Load decisions + recent sessions
  useEffect(() => {
    const loadData = async () => {
      try {
        const [decisionsData, sessionsData] = await Promise.all([
          decisionsRepo.listWithStats(),
          sessionsRepo.list(),
        ]);
        setDecisions(decisionsData);
        setRecentSessions(sessionsData.slice(0, 3));
        if (decisionsData.length > 0 && !selectedDecision) {
          setSelectedDecision(decisionsData[0].id);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  // Migrate sessions with raw-input titles → AI titles (one-time background)
  useEffect(() => {
    const migrateTitles = async () => {
      const needsTitles = await sessionsRepo.listNeedingTitles();
      for (const s of needsTitles) {
        // Skip the active session — auto-save handles its title via titleGeneratedRef
        if (s.id === sessionId) continue;
        const firstUser = s.messages.find(m => m.type === 'user')?.content;
        const verdict = s.messages.find(m => m.evaluation)?.evaluation?.verdict ?? null;
        if (!firstUser) continue;
        try {
          const res = await fetch('/api/title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage: firstUser, decisionName: s.decisionName, verdict }),
          });
          const data = await res.json();
          if (data.success && data.title) {
            await sessionsRepo.updateTitle(s.id, data.title);
          }
        } catch { /* skip failed titles */ }
      }
      if (needsTitles.length > 0) {
        const fresh = await sessionsRepo.list();
        setRecentSessions(fresh.slice(0, 3));
      }
    };
    migrateTitles();
  }, []);

  // Load session from URL query parameter (e.g., /home?session=abc)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');
    if (!sessionParam) return;
    loadSessionById(sessionParam).catch(console.error);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-save session when messages change
  useEffect(() => {
    if (messages.length === 0 || isStreaming) return;

    const saveSession = async () => {
      const sessionMessages: SessionMessage[] = messages.map(m => ({
        id: m.id,
        type: m.type,
        content: m.content,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
        evaluation: m.execution?.evaluation,
      }));

      const decision = decisions.find(d => d.id === selectedDecision);
      const decisionName = decision?.name || 'Unknown';

      let currentSessionId = sessionId;
      if (sessionId) {
        await sessionsRepo.update(sessionId, sessionMessages);
      } else {
        const session = await sessionsRepo.create(
          selectedDecision,
          decisionName,
          sessionMessages
        );
        setSessionId(session.id);
        currentSessionId = session.id;
      }

      // Generate AI title after first evaluation (background, fire-and-forget)
      const hasEval = sessionMessages.some(m => m.evaluation);
      const firstUserMsg = sessionMessages.find(m => m.type === 'user')?.content;
      if (hasEval && firstUserMsg && !titleGeneratedRef.current && currentSessionId) {
        titleGeneratedRef.current = true;
        const verdict = sessionMessages.find(m => m.evaluation)?.evaluation?.verdict ?? null;
        fetch('/api/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userMessage: firstUserMsg, decisionName, verdict }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.success && data.title) {
              sessionsRepo.updateTitle(currentSessionId!, data.title);
              // Refresh recent sessions so new title appears
              sessionsRepo.list().then(s => setRecentSessions(s.slice(0, 3)));
            }
          })
          .catch(() => {}); // Fail silently — template title remains
      }
    };

    saveSession().catch(console.error);
  }, [messages, isStreaming]);

  // Run real evaluation via Groq API
  const runEvaluation = async (input: string, decisionId: string): Promise<ExecutionResult> => {
    const decision = decisions.find(d => d.id === decisionId);
    const decisionName = decision?.name || 'Unknown Decision';

    // Fetch real rules for this decision
    const decisionRules = await rulesRepo.listByDecisionId(decisionId);
    const enabledRules = decisionRules.filter(r => r.enabled);

    if (enabledRules.length === 0) {
      throw new Error('No active rules found for this ruleset. Add rules in the Rules page first.');
    }

    // Store rule names for the loading skeleton
    setActiveRuleNames(enabledRules.map(r => r.name));

    // Call the Groq evaluation API
    const evaluatorRules = enabledRules.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      reason: r.reason,
    }));

    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        decision_id: decisionId,
        decision_name: decisionName,
        rules: evaluatorRules,
      }),
    });

    const data: EvaluateResponse = await res.json();

    if (!data.success || !data.result) {
      throw new Error(data.error || 'Evaluation failed');
    }

    const result = data.result;

    // Map evaluations to RuleCheck format
    const ruleChecks: RuleCheck[] = result.evaluations.map(e => ({
      id: e.rule_id,
      name: e.rule_name,
      status: e.verdict === 'pass' ? 'passed' as const : 'failed' as const,
      message: e.reason,
    }));

    return {
      id: result.id,
      decisionName,
      input,
      verdict: result.verdict,
      reason: result.reason,
      rules: ruleChecks,
      latencyMs: result.latency_ms,
      credits: 1,
      timestamp: new Date(),
      evaluation: result,
    };
  };

  // Stream a follow-up chat response
  const streamChat = async (userContent: string) => {
    const decision = decisions.find(d => d.id === selectedDecision);
    const msgId = `msg-${crypto.randomUUID()}`;

    // Build conversation history from messages (only user/system text, not evaluation cards)
    const chatHistory = messages
      .filter(m => m.content && !m.execution)
      .map(m => ({
        role: m.type === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }));

    chatHistory.push({ role: 'user', content: userContent });

    // Build evaluation context if available
    const evalCtx = lastEvaluationRef.current;
    const context = evalCtx ? {
      decision_name: decision?.name || 'Unknown',
      last_evaluation: {
        verdict: evalCtx.verdict,
        reason: evalCtx.reason,
        evaluations: evalCtx.evaluations.map(e => ({
          rule_name: e.rule_name,
          verdict: e.verdict,
          reason: e.reason,
        })),
      },
    } : undefined;

    // Add placeholder streaming message
    const streamingMsg: Message = {
      id: msgId,
      type: 'system',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, streamingMsg]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory, context }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Chat request failed' }));
        throw new Error(errorData.error || 'Chat request failed');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

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
            if (json.content) {
              accumulated += json.content;
              setMessages(prev =>
                prev.map(m =>
                  m.id === msgId ? { ...m, content: accumulated } : m
                )
              );
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      // Finalize — remove streaming flag
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (error: any) {
      if (error.name === 'AbortError') return;

      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? { ...m, content: error.message || 'Failed to get response.', isStreaming: false }
            : m
        )
      );
      toast.error(error.message || 'Chat failed');
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Heuristic: does the input look like data to evaluate (JSON, long text) vs a question?
  const looksLikeData = (input: string): boolean => {
    const trimmed = input.trim();
    // JSON-like
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return true;
    // Very long input (>200 chars) is probably data, not a question
    if (trimmed.length > 200) return true;
    return false;
  };

  // Determine if this is a follow-up question or a new evaluation
  const hasEvaluation = lastEvaluationRef.current !== null;

  // Handle run — routes between evaluate (new input) and chat (follow-up)
  const handleRun = async () => {
    // Ref-based lock prevents double-fire (state checks are stale in closures)
    if (busyLockRef.current) return;
    if (!runInput.trim()) {
      toast.error('Enter some input first');
      return;
    }

    busyLockRef.current = true;

    const content = runInput.trim();
    const userMessage: Message = {
      id: `msg-${crypto.randomUUID()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setRunInput('');

    // Route: if we have an evaluation and the input looks like a question, stream chat
    // Otherwise, run a new evaluation. forceEvaluateRef bypasses chat routing (e.g. retry flow).
    const isFollowUp = hasEvaluation && !looksLikeData(content) && !forceEvaluateRef.current;
    forceEvaluateRef.current = false;

    if (isFollowUp) {
      try {
        await streamChat(content);
      } finally {
        busyLockRef.current = false;
      }
      return;
    }

    if (!selectedDecision) {
      toast.error('Select a ruleset first');
      return;
    }

    setIsRunning(true);

    try {
      const execution = await runEvaluation(content, selectedDecision);

      // Track the latest evaluation for follow-up context
      if (execution.evaluation) {
        lastEvaluationRef.current = execution.evaluation;
      }

      const systemMessage: Message = {
        id: `msg-${crypto.randomUUID()}`,
        type: 'system',
        content: execution.reason,
        timestamp: new Date(),
        execution,
      };

      setMessages(prev => [...prev, systemMessage]);
    } catch (error: any) {
      const msg = error.message || '';
      const isNoRules = msg.includes('No active rules');
      const isApiKey = msg.includes('API') || msg.includes('key') || msg.includes('401');
      const isTimeout = msg.includes('timeout') || msg.includes('abort');

      const userFriendly = isNoRules
        ? 'No active rules found for this ruleset. Go to the Rules page and add at least one enabled rule.'
        : isApiKey
        ? 'API configuration issue. Check that your GROQ_API_KEY is set in .env.local and restart the server.'
        : isTimeout
        ? 'The evaluation timed out. Try with shorter input or fewer rules.'
        : msg || 'Evaluation failed. Please try again.';

      const errorMessage: Message = {
        id: `msg-${crypto.randomUUID()}`,
        type: 'system',
        content: userFriendly,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(isNoRules ? 'No rules configured' : isApiKey ? 'API error' : 'Evaluation failed', {
        description: userFriendly,
      });
    } finally {
      setIsRunning(false);
      busyLockRef.current = false;
    }
  };

  // Handle keyboard shortcut — Enter to submit, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRun();
    }
  };

  // Start a fresh session — resets all conversational state
  const startNewSession = async () => {
    setMessages([]);
    setSessionId(null);
    setRunInput('');
    lastEvaluationRef.current = null;
    busyLockRef.current = false;
    titleGeneratedRef.current = false;
    window.history.replaceState(null, '', '/home');
    // Refresh recent sessions so the just-completed session appears
    const fresh = await sessionsRepo.list();
    setRecentSessions(fresh.slice(0, 3));
  };

  const hasMessages = messages.length > 0;
  const isBusy = isRunning || isStreaming;

  return (
    <div className="h-full relative overflow-hidden">
      {hasMessages ? (
        /* ── Chat view: transparent top bar + masked scroll + solid bottom ── */
        <>
          {/* Top bar — fully transparent, button floats over content */}
          <div className="absolute top-0 left-0 right-0 z-10 px-5 pt-2.5 pointer-events-none">
            <button
              onClick={startNewSession}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--brand)] bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--brand)]/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New check
            </button>
          </div>

          {/* Scrollable messages — mask-image fades content at top and bottom edges */}
          <div
            className="h-full overflow-y-auto pt-12 pb-28"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent, black 48px, black calc(100% - 140px), transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 48px, black calc(100% - 140px), transparent)',
            }}
          >
            <div className="p-6">
              <div className="mx-auto w-full space-y-4" style={{ maxWidth: CONTENT_MAX_W }}>
                <AnimatePresence mode="popLayout">
                  {messages.map((message, messageIndex) => {
                    const currentEval = message.execution?.evaluation;
                    let previousEval: EvaluationResult | null = null;
                    if (currentEval) {
                      for (let i = messageIndex - 1; i >= 0; i--) {
                        if (messages[i].execution?.evaluation) {
                          previousEval = messages[i].execution!.evaluation!;
                          break;
                        }
                      }
                    }

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={message.type === 'user' ? 'max-w-[85%]' : 'w-full'}>
                          {message.type === 'user' ? (
                            <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl rounded-br-sm px-4 py-3">
                              <p className="text-sm whitespace-pre-wrap text-[var(--foreground)]">{message.content}</p>
                            </div>
                          ) : currentEval ? (
                            <div className="space-y-4">
                              <RuleResultCard
                                result={currentEval}
                                onRetry={(previousInput) => {
                                  forceEvaluateRef.current = true;
                                  setRunInput(previousInput);
                                  setTimeout(() => {
                                    const ta = textareaRef.current;
                                    if (ta) { ta.focus(); ta.select(); }
                                  }, 100);
                                }}
                              />
                              {previousEval && (
                                <ComparisonCard previous={previousEval} current={currentEval} />
                              )}
                            </div>
                          ) : (
                            <div className="rounded-2xl rounded-bl-sm px-4 py-3">
                              <MarkdownContent content={message.content} />
                              {message.isStreaming && (
                                <span className="inline-block w-1.5 h-4 bg-[var(--brand)] rounded-full animate-pulse ml-0.5 align-text-bottom" />
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Loading skeleton — appears while Groq evaluates */}
                {isRunning && <EvaluationSkeleton ruleNames={activeRuleNames} />}

                {/* Recovery prompt — appears after a failed evaluation */}
                {!isBusy && lastEvaluationRef.current?.verdict === 'fail' && messages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="flex justify-start"
                  >
                    <button
                      onClick={() => setRunInput('What specific data do I need to provide to pass each rule?')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-900/25 focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30 focus-visible:ring-offset-1 transition-colors"
                    >
                      <Lightbulb className="w-3 h-3" />
                      What data do I need to pass?
                    </button>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Bottom composer — solid background, mask handles the visual transition above */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-3 pb-6 bg-[var(--background)]">
            <div className="mx-auto" style={{ maxWidth: CONTENT_MAX_W }}>
              <SuperInput
                value={runInput}
                onChange={setRunInput}
                onSubmit={handleRun}
                onKeyDown={handleKeyDown}
                isFocused={isFocused}
                setIsFocused={setIsFocused}
                isRunning={isBusy}
                decisions={decisions}
                selectedDecision={selectedDecision}
                setSelectedDecision={setSelectedDecision}
                textareaRef={textareaRef}
                minRows={1}
                showDecisionSelector={false}
              />
            </div>
          </div>
        </>
      ) : (
        /* ── Empty state: normal flex layout ── */
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center px-6 pt-4 pb-2">
            <div className="flex items-center bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full p-1" role="tablist" aria-label="Mode">
              <button
                role="tab"
                aria-selected="true"
                aria-current="page"
                className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-[var(--brand)] text-white cursor-default"
              >
                Decide
              </button>
              <Link
                href="/decisions"
                role="tab"
                aria-selected="false"
                className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Rules
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-h-full flex flex-col items-center px-6 pb-6">
              {/* Top spacer — pushes action area toward vertical center */}
              <div className="flex-1" />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full space-y-6"
                style={{ maxWidth: CONTENT_MAX_W }}
              >
                {/* Hero */}
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-semibold text-[var(--foreground)] tracking-tight leading-[1.1]">
                    What are you checking today?
                  </h1>
                  <p className="text-[var(--muted-foreground)] text-[15px]">
                    AI evaluates your input against each rule and explains its reasoning
                  </p>
                </div>

                {/* Super Input Box */}
                <SuperInput
                  value={runInput}
                  onChange={setRunInput}
                  onSubmit={handleRun}
                  onKeyDown={handleKeyDown}
                  isFocused={isFocused}
                  setIsFocused={setIsFocused}
                  isRunning={isBusy}
                  decisions={decisions}
                  selectedDecision={selectedDecision}
                  setSelectedDecision={setSelectedDecision}
                  textareaRef={textareaRef}
                  minRows={4}
                />

                {/* Suggested prompts — short titles, full content fills on click */}
                {(() => {
                  const suggestions = DEFAULT_SUGGESTIONS;
                  return (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[11px] text-[var(--muted-foreground)]">Try:</span>
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setRunInput(s.content)}
                          aria-label={`Fill input with: ${s.content}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--muted-foreground)]/40 hover:bg-[var(--muted)]/40 focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30 focus-visible:ring-offset-1 transition-all"
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>

              {/* Flexible gap — adapts to screen height, min 32px */}
              <div className="flex-1 min-h-8" />

              {/* Recent sessions — visually separated section */}
              {recentSessions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="w-full space-y-2"
                  style={{ maxWidth: CONTENT_MAX_W }}
                >
                  <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide text-center">Recent</p>
                  <div className="grid gap-2 px-1 pb-1 -mx-1 -mb-1">
                    {recentSessions.map(s => {
                      const reason = s.messages.find(m => m.evaluation)?.evaluation?.reason;
                      const verdictLabel = s.verdict === 'pass' ? 'Passed' : s.verdict === 'fail' ? 'Failed' : 'Pending';
                      return (
                        <button
                          key={s.id}
                          onClick={() => loadSessionById(s.id)}
                          aria-label={`Load session: ${s.title} — ${verdictLabel}`}
                          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--muted-foreground)]/25 hover:bg-[var(--muted)]/30 hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30 focus-visible:ring-offset-1 transition-all duration-200 text-left group"
                        >
                          <div className="flex-shrink-0" aria-hidden="true">
                            {s.verdict === 'pass' ? (
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                            ) : s.verdict === 'fail' ? (
                              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                <ShieldAlert className="w-4 h-4 text-red-500 dark:text-red-400" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-[var(--muted-foreground)]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--foreground)] truncate">{s.title}</p>
                            <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                              {s.decisionName}
                              {reason && <> &middot; {reason}</>}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-[10px] text-[var(--muted-foreground)]">
                              {formatRelativeTime(s.updatedAt).relative}
                            </span>
                            {s.verdict && (
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                s.verdict === 'pass'
                                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                              }`}>
                                {verdictLabel}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Super Input - The unified "Devin-style" input box
// ============================================
interface SuperInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  isRunning: boolean;
  decisions: DecisionWithStats[];
  selectedDecision: string;
  setSelectedDecision: (id: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  minRows?: number;
  showDecisionSelector?: boolean;
}

function SuperInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  isFocused,
  setIsFocused,
  isRunning,
  decisions,
  selectedDecision,
  setSelectedDecision,
  textareaRef,
  minRows = 1,
  showDecisionSelector = true,
}: SuperInputProps) {
  const canSubmit = !isRunning && !!selectedDecision && !!value.trim();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const textTypes = [
      'application/json', 'text/plain', 'text/csv', 'text/xml',
      'application/xml', 'text/html', 'text/markdown',
    ];
    const textExtensions = ['.json', '.txt', '.csv', '.xml', '.md', '.yaml', '.yml', '.tsv', '.log'];
    const isText = textTypes.includes(file.type) || textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isText) {
      toast.error(`${file.name} is not a supported text format`, {
        description: 'Try JSON, CSV, TXT, XML, YAML, or Markdown files.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        onChange(content);
        textareaRef.current?.focus();
        toast.success(`Loaded ${file.name}`, { description: `${(file.size / 1024).toFixed(1)} KB` });
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative rounded-xl transition-all duration-300 ease-out overflow-hidden
        bg-[var(--card)] border
        ${isDragging
          ? 'border-[var(--brand)]/50 shadow-[var(--glow-brand)] scale-[1.01]'
          : isFocused
            ? 'border-[var(--brand)]/30 shadow-[var(--glow-brand)]'
            : 'border-[var(--border)] shadow-[var(--shadow-card)] hover:border-[var(--border)]/80'
        }
      `}
    >
      {/* Drag-and-drop overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-[var(--brand)]/[0.04] border-2 border-dashed border-[var(--brand)]/40"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-[var(--brand)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">Drop your file here</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Instantly check against your rules</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textarea - borderless, blank sheet feel */}
      <TextareaAutosize
        ref={textareaRef as any}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        placeholder="Share the content to review, or drop a file here"
        minRows={minRows}
        maxRows={12}
        className="
          w-full px-5 pt-4 pb-2 text-[15px] bg-transparent border-0 resize-none
          outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0
          [&]:focus-visible:outline-none [&]:focus-visible:ring-0
          placeholder:text-[var(--muted-foreground)]/50
          font-normal leading-relaxed text-[var(--foreground)]
        "
        spellCheck={false}
      />

      {/* File format hints — visible only when empty + idle */}
      {!value.trim() && !isFocused && !isDragging && (
        <div className="flex items-center gap-1.5 px-5 pb-2">
          <FileText className="w-3 h-3 text-[var(--muted-foreground)]/40" />
          {['JSON', 'CSV', 'TXT', 'XML', 'YAML'].map(fmt => (
            <span key={fmt} className="text-[10px] font-medium text-[var(--muted-foreground)]/40 px-1.5 py-0.5 rounded border border-[var(--border)]/40">
              {fmt}
            </span>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 border-t border-[var(--border)]/40">
        <div className="flex items-center gap-1">
          {/* Decision Selector — full dropdown in empty state, static label in chat */}
          {showDecisionSelector ? (
            <Select value={selectedDecision} onValueChange={setSelectedDecision}>
              <SelectTrigger className="w-auto h-8 rounded-lg px-3 gap-2 text-xs font-medium bg-[var(--muted)] hover:bg-[var(--secondary-hover)] border border-[var(--border)]/60 shadow-none transition-all focus:ring-0">
                <GitBranch className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <span className="max-w-[140px] truncate text-[var(--foreground)]">
                  {decisions.find(d => d.id === selectedDecision)?.name || "Select ruleset"}
                </span>
              </SelectTrigger>
              <SelectContent align="start" className="min-w-[220px] bg-[var(--popover)] border-[var(--border)] shadow-xl">
                {decisions.map((decision) => (
                  <SelectItem key={decision.id} value={decision.id}>
                    {decision.name}
                  </SelectItem>
                ))}
                <div className="p-1 border-t border-[var(--border)] mt-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs" asChild>
                    <Link href="/decisions/new">
                      <Plus className="w-3 h-3 mr-2" />
                      New rule
                    </Link>
                  </Button>
                </div>
              </SelectContent>
            </Select>
          ) : null}

          {/* Attach file */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt,.csv,.xml,.md,.yaml,.yml,.tsv,.log,.html"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            title="Attach file (JSON, CSV, TXT, XML, YAML)"
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>

        {/* Submit Button - circular ArrowUp */}
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          title="Submit (⌘+Enter)"
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
            ${canSubmit
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 cursor-pointer'
              : 'bg-[var(--muted)] text-[var(--muted-foreground)]/50 cursor-not-allowed'
            }
          `}
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </div>
  );
}
