'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import TextareaAutosize from 'react-textarea-autosize';
import { motion, AnimatePresence } from 'motion/react';
import { usePanelCallbackRef } from 'react-resizable-panels';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/app/components/ui/resizable';
import {
  Plus,
  ArrowUp,
  ArrowRight,
  Clock,
  Zap,
  GitBranch,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  ChevronRight,
  PanelRightOpen,
  PanelRightClose,
  Check,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { decisionsRepo } from '@/app/lib/decisions';
import { DecisionWithStats } from '@/app/lib/types';
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
}

interface Message {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: Date;
  execution?: ExecutionResult;
}

export default function HomePage() {
  const [decisions, setDecisions] = useState<DecisionWithStats[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<string>('');
  const [runInput, setRunInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentExecution, setCurrentExecution] = useState<ExecutionResult | null>(null);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [resultsPanelRef, setResultsPanelRef] = usePanelCallbackRef();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const CONTENT_MAX_W = 800;
  const RESULTS_DEFAULT_PCT = '35%';
  const RESULTS_MIN_PCT = '25%';
  const RESULTS_MAX_PCT = '55%';

  const collapseResults = useCallback(() => {
    setIsResultsOpen(false);
    resultsPanelRef?.collapse();
  }, [resultsPanelRef]);

  const openResults = useCallback(() => {
    setIsResultsOpen(true);
    resultsPanelRef?.expand();
    resultsPanelRef?.resize(RESULTS_DEFAULT_PCT);
  }, [resultsPanelRef]);

  const toggleResults = useCallback(() => {
    if (isResultsOpen) collapseResults();
    else openResults();
  }, [isResultsOpen, collapseResults, openResults]);

  // Load decisions
  useEffect(() => {
    const loadData = async () => {
      try {
        const decisionsData = await decisionsRepo.listWithStats();
        setDecisions(decisionsData);
        if (decisionsData.length > 0 && !selectedDecision) {
          setSelectedDecision(decisionsData[0].id);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate streaming rule checks
  const simulateExecution = async (input: string, decisionId: string): Promise<ExecutionResult> => {
    const decision = decisions.find(d => d.id === decisionId);
    const decisionName = decision?.name || 'Unknown Decision';
    
    // Create mock rules to check
    const mockRules: RuleCheck[] = [
      { id: '1', name: 'Input Validation', status: 'pending' },
      { id: '2', name: 'Schema Check', status: 'pending' },
      { id: '3', name: 'Business Logic', status: 'pending' },
      { id: '4', name: 'Final Verdict', status: 'pending' },
    ];

    const execution: ExecutionResult = {
      id: `exec-${Date.now()}`,
      decisionName,
      input,
      verdict: 'pass',
      reason: '',
      rules: [...mockRules],
      latencyMs: 0,
      credits: 1,
      timestamp: new Date(),
    };

    setCurrentExecution(execution);
    openResults();

    const startTime = Date.now();

    // Simulate each rule check with streaming effect
    for (let i = 0; i < mockRules.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
      
      const passed = Math.random() > 0.15; // 85% pass rate per rule
      execution.rules[i] = {
        ...execution.rules[i],
        status: passed ? 'passed' : 'failed',
        message: passed ? 'Validation successful' : 'Check failed - criteria not met',
      };
      
      if (!passed && i < mockRules.length - 1) {
        execution.verdict = 'fail';
      }
      
      // Mark next rule as running
      if (i < mockRules.length - 1) {
        execution.rules[i + 1] = { ...execution.rules[i + 1], status: 'running' };
      }
      
      setCurrentExecution({ ...execution });
    }

    execution.latencyMs = Date.now() - startTime;
    execution.verdict = execution.rules.every(r => r.status === 'passed') ? 'pass' : 'fail';
    execution.reason = execution.verdict === 'pass' 
      ? 'All checks passed — approved to proceed.'
      : 'One or more checks flagged — held for review.';

    return execution;
  };

  // Handle run
  const handleRun = async () => {
    if (!selectedDecision || !runInput.trim()) {
      toast.error('Select a ruleset and provide input to review');
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: runInput,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setRunInput('');
    setIsRunning(true);

    try {
      const execution = await simulateExecution(userMessage.content, selectedDecision);
      
      const systemMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'system',
        content: execution.reason,
        timestamp: new Date(),
        execution,
      };
      
      setMessages(prev => [...prev, systemMessage]);
      setCurrentExecution(execution);
    } catch (error: any) {
      toast.error(error.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  // Handle keyboard shortcut — Enter to submit, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRun();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <ResizablePanelGroup
        orientation="horizontal"
        className="flex-1 !overflow-hidden"
      >
        {/* Main Content Panel */}
        <ResizablePanel
          id="main"
          minSize="45%"
        >
          <div className="h-full flex flex-col">

            {/* Content-level context: pill toggle + results panel button */}
            <div className="flex items-center justify-between px-6 pt-8 pb-2">
              <div className="w-8" />
              <div className="flex items-center bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full p-1">
                <button
                  className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-[var(--brand)] text-white"
                >
                  Decide
                </button>
                <Link
                  href="/decisions"
                  className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  Rules
                </Link>
              </div>
              <div className="w-8 flex justify-end">
                {currentExecution && (
                  <button
                    onClick={toggleResults}
                    className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                    title={isResultsOpen ? 'Hide results' : 'Show results'}
                  >
                    {isResultsOpen ? (
                      <PanelRightClose className="w-4 h-4" />
                    ) : (
                      <PanelRightOpen className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Messages Area or Empty State */}
            <div className="flex-1 overflow-y-auto">
              {!hasMessages ? (
                <div className="h-full flex flex-col items-center px-6 pt-[8vh]">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full space-y-10"
                    style={{ maxWidth: CONTENT_MAX_W }}
                  >
                    {/* Hero - Statement only, no icon */}
                    <div className="text-center space-y-3">
                      <h1 className="text-4xl font-semibold text-[var(--foreground)] tracking-tight leading-[1.1]">
                        What are you checking today?
                      </h1>
                      <p className="text-[var(--muted-foreground)] text-[15px]">
                        Submit text, documents, or files to be reviewed against your rules
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
                      isRunning={isRunning}
                      decisions={decisions}
                      selectedDecision={selectedDecision}
                      setSelectedDecision={setSelectedDecision}
                      textareaRef={textareaRef}
                      minRows={4}
                    />

                    {/* Keyboard hint */}
                    <p className="text-center text-xs text-[var(--muted-foreground)]/60">
                      <kbd className="px-1.5 py-0.5 bg-[var(--muted)] rounded text-[10px] font-mono text-[var(--muted-foreground)]">Enter</kbd>
                      <span className="ml-1.5 text-[var(--muted-foreground)]/40">to submit</span>
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="mx-auto w-full space-y-4" style={{ maxWidth: CONTENT_MAX_W }}>
                    <AnimatePresence mode="popLayout">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : ''}`}>
                            {message.type === 'user' ? (
                              <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl rounded-br-sm px-4 py-3">
                                <p className="text-sm whitespace-pre-wrap text-[var(--foreground)]">{message.content}</p>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="rounded-2xl rounded-bl-sm px-4 py-3">
                                  {message.execution && (
                                    <div className="flex items-center gap-2 mb-2">
                                      {message.execution.verdict === 'pass' ? (
                                        <div className="flex items-center gap-1.5 text-[var(--success)]">
                                          <CheckCircle2 className="w-4 h-4" />
                                          <span className="text-sm font-medium">Passed</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 text-[var(--destructive)]">
                                          <XCircle className="w-4 h-4" />
                                          <span className="text-sm font-medium">Needs review</span>
                                        </div>
                                      )}
                                      <span className="text-[var(--muted-foreground)]/50 text-xs">&middot;</span>
                                      <span className="text-[var(--muted-foreground)] text-xs">{message.execution.latencyMs}ms</span>
                                    </div>
                                  )}
                                  <p className="text-sm text-[var(--foreground)]/80">{message.content}</p>
                                </div>
                                {message.execution && !isResultsOpen && (
                                  <button
                                    onClick={() => {
                                      setCurrentExecution(message.execution!);
                                      openResults();
                                    }}
                                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1 ml-1"
                                  >
                                    View check results
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Composer (when has messages) */}
            {hasMessages && (
              <div className="p-4 pb-6">
                <div className="mx-auto" style={{ maxWidth: CONTENT_MAX_W }}>
                  <SuperInput
                    value={runInput}
                    onChange={setRunInput}
                    onSubmit={handleRun}
                    onKeyDown={handleKeyDown}
                    isFocused={isFocused}
                    setIsFocused={setIsFocused}
                    isRunning={isRunning}
                    decisions={decisions}
                    selectedDecision={selectedDecision}
                    setSelectedDecision={setSelectedDecision}
                    textareaRef={textareaRef}
                    minRows={1}
                  />
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>

        {/* Results Panel */}
        {currentExecution && (
          <>
            <ResizableHandle className="w-px bg-[var(--border)] hover:bg-[var(--brand)]/50 transition-colors data-[resize-handle-active]:bg-[var(--brand)] after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2" />
            <ResizablePanel
              id="results"
              defaultSize={RESULTS_DEFAULT_PCT}
              minSize={RESULTS_MIN_PCT}
              maxSize={RESULTS_MAX_PCT}
              collapsible
              collapsedSize="0%"
              panelRef={setResultsPanelRef}
              onResize={(panelSize) => {
                const collapsed = panelSize.asPercentage < 1;
                if (collapsed !== !isResultsOpen) setIsResultsOpen(!collapsed);
              }}
            >
              <div className="h-full flex flex-col border-l border-[var(--border)]">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]/50">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isRunning ? 'bg-[var(--warning)] animate-pulse' :
                      currentExecution.verdict === 'pass' ? 'bg-[var(--success)]' : 'bg-[var(--destructive)]'
                    }`} />
                    <span className="font-medium text-sm text-[var(--foreground)]">
                      {currentExecution.decisionName}
                    </span>
                  </div>
                  <button
                    onClick={collapseResults}
                    className="p-1 hover:bg-[var(--muted)] rounded-md transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Rule Checks */}
                <div className="flex-1 overflow-y-auto p-5 space-y-2">
                  <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest mb-4">
                    Rule Checks
                  </p>

                  {currentExecution.rules.map((rule, index) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className={`
                        flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all
                        ${rule.status === 'running' ? 'bg-[var(--brand)]/5' :
                          rule.status === 'passed' ? 'bg-[var(--success)]/5' :
                          rule.status === 'failed' ? 'bg-[var(--destructive)]/5' :
                          'bg-transparent'
                        }
                      `}
                    >
                      <div className="flex-shrink-0">
                        {rule.status === 'pending' && (
                          <div className="w-5 h-5 rounded-full border-2 border-[var(--border)]" />
                        )}
                        {rule.status === 'running' && (
                          <Loader2 className="w-5 h-5 text-[var(--brand)] animate-spin" />
                        )}
                        {rule.status === 'passed' && (
                          <div className="w-5 h-5 rounded-full bg-[var(--success)] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {rule.status === 'failed' && (
                          <div className="w-5 h-5 rounded-full bg-[var(--destructive)] flex items-center justify-center">
                            <X className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          rule.status === 'pending' ? 'text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'
                        }`}>
                          {rule.name}
                        </p>
                        {rule.message && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{rule.message}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Panel Footer */}
                {!isRunning && (
                  <div className="border-t border-[var(--border)]/50 px-5 py-3.5">
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {currentExecution.latencyMs}ms
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          {currentExecution.credits} credit
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]" asChild>
                        <Link href={`/decisions/${selectedDecision}`}>
                          Full trace
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
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
}: SuperInputProps) {
  const canSubmit = !isRunning && !!selectedDecision && !!value.trim();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

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
    // TODO: wire up file handling
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        rounded-xl transition-all duration-300 ease-out overflow-hidden
        bg-[var(--card)] border
        ${isDragging
          ? 'border-[var(--brand)]/50 shadow-[var(--glow-brand)]'
          : isFocused
            ? 'border-[var(--brand)]/30 shadow-[var(--glow-brand)]'
            : 'border-[var(--border)] shadow-[var(--shadow-card)] hover:border-[var(--border)]/80'
        }
      `}
    >
      {/* Textarea - borderless, blank sheet feel */}
      <TextareaAutosize
        ref={textareaRef as any}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        placeholder="Paste text or drop a file to review..."
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

      {/* Action Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 border-t border-[var(--border)]/40">
        <div className="flex items-center gap-1">
          {/* Decision Selector */}
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

          {/* Attach file */}
          <button
            type="button"
            title="Attach file"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>

        {/* Submit Button - circular ArrowUp */}
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
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
