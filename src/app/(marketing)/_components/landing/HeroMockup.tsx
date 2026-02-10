'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck, ShieldX, CheckCircle2, XCircle, ChevronRight, Clock,
  FileText, Paperclip, ArrowUp,
} from 'lucide-react';

/* ─── Use-case data ─── */

interface FailedRule {
  name: string;
  desc: string;
  passed: boolean;
  pct: string;
}

interface PassedRule {
  name: string;
  desc: string;
  pct: string;
}

interface UseCase {
  uploadFile: string;
  fixedFile: string;
  rulebookName: string;
  failCount: number;
  failedRules: FailedRule[];
  passedRules: PassedRule[];
  userQuestion: string;
  aiResponse: string;
  evalTime1: string;
  evalTime2: string;
}

const USE_CASES: UseCase[] = [
  {
    uploadFile: 'q3-expense-report.pdf',
    fixedFile: 'q3-expense-report-v2.pdf',
    rulebookName: 'Expense Policy',
    failCount: 2,
    failedRules: [
      { name: 'Receipt Attached', desc: 'No receipt found for expenses over $25', passed: false, pct: '0%' },
      { name: 'Approved Vendor', desc: 'Vendor is on the approved list', passed: true, pct: '100%' },
      { name: 'Budget Limit', desc: 'Amount is within department budget', passed: true, pct: '100%' },
      { name: 'Manager Approval', desc: 'Missing manager sign-off', passed: false, pct: '0%' },
    ],
    passedRules: [
      { name: 'Receipt Attached', desc: 'Receipt verified for all line items', pct: '100%' },
      { name: 'Approved Vendor', desc: 'Vendor is on the approved list', pct: '100%' },
      { name: 'Budget Limit', desc: 'Amount is within department budget', pct: '100%' },
      { name: 'Manager Approval', desc: 'Manager sign-off confirmed', pct: '100%' },
    ],
    userQuestion: "What's missing to get this approved?",
    aiResponse: 'Two items need attention: attach a receipt for the $847 charge (required for anything over $25), and add a manager sign-off. The vendor and budget are both fine.',
    evalTime1: '1243ms',
    evalTime2: '1102ms',
  },
  {
    uploadFile: 'weekly-digest-draft.md',
    fixedFile: 'weekly-digest-final.md',
    rulebookName: 'Content Quality',
    failCount: 2,
    failedRules: [
      { name: 'Subject Line Length', desc: 'Subject line exceeds 60 characters', passed: false, pct: '0%' },
      { name: 'Broken Links', desc: 'All embedded links are valid', passed: true, pct: '100%' },
      { name: 'CTA Present', desc: 'At least one call-to-action found', passed: true, pct: '100%' },
      { name: 'Spelling & Grammar', desc: '3 issues detected in body copy', passed: false, pct: '0%' },
    ],
    passedRules: [
      { name: 'Subject Line Length', desc: 'Subject line is within 60 characters', pct: '100%' },
      { name: 'Broken Links', desc: 'All embedded links are valid', pct: '100%' },
      { name: 'CTA Present', desc: 'At least one call-to-action found', pct: '100%' },
      { name: 'Spelling & Grammar', desc: 'No issues detected', pct: '100%' },
    ],
    userQuestion: 'What do I need to fix before sending?',
    aiResponse: "Shorten the subject line to 60 characters or fewer\u2009—\u2009it's currently 78. Also fix 3 spelling issues: 'recieve' → 'receive', 'seperate' → 'separate', and a repeated word on line 14.",
    evalTime1: '987ms',
    evalTime2: '1045ms',
  },
  {
    uploadFile: 'launch-page-v3.html',
    fixedFile: 'launch-page-v4.html',
    rulebookName: 'Launch Readiness',
    failCount: 2,
    failedRules: [
      { name: 'No Placeholder Text', desc: 'Found "Lorem ipsum" in hero section', passed: false, pct: '0%' },
      { name: 'Screenshots Present', desc: 'All required screenshots included', passed: true, pct: '100%' },
      { name: 'Headline Length', desc: 'Headline is within optimal range', passed: true, pct: '100%' },
      { name: 'Alt Text Coverage', desc: '2 images missing alt text', passed: false, pct: '0%' },
    ],
    passedRules: [
      { name: 'No Placeholder Text', desc: 'No placeholder content found', pct: '100%' },
      { name: 'Screenshots Present', desc: 'All required screenshots included', pct: '100%' },
      { name: 'Headline Length', desc: 'Headline is within optimal range', pct: '100%' },
      { name: 'Alt Text Coverage', desc: 'All images have alt text', pct: '100%' },
    ],
    userQuestion: "What's blocking the launch?",
    aiResponse: "Two things: replace the 'Lorem ipsum' placeholder in the hero section with real copy, and add alt text to the product screenshot and the team photo. Everything else is launch-ready.",
    evalTime1: '1456ms',
    evalTime2: '1328ms',
  },
];

const CYCLE_DURATION = 20_000;

/* ─── Animation wrappers ─── */

function A({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <div className="mockup-animate-in" style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/* ─── Input bar phases ─── */

type InputPhase =
  | 'idle'
  | 'file-1' | 'send-file-1' | 'idle-2'
  | 'typing-q' | 'send-q' | 'idle-3'
  | 'file-2' | 'send-file-2' | 'idle-end';

/* ─── Single use-case render ─── */

function UseCaseScene({ uc }: { uc: UseCase }) {
  const [phase, setPhase] = useState<InputPhase>('idle');

  useEffect(() => {
    // File 1: appear → send → clear
    // Question: type in bar → send → clear
    // File 2: appear → send → clear
    const timers = [
      setTimeout(() => setPhase('file-1'),      500),   // file appears in bar
      setTimeout(() => setPhase('send-file-1'),  2000),  // send pressed
      setTimeout(() => setPhase('idle-2'),       2800),  // bar clears
      setTimeout(() => setPhase('typing-q'),     6500),  // question starts typing in bar
      setTimeout(() => setPhase('send-q'),       8800),  // send pressed
      setTimeout(() => setPhase('idle-3'),       9500),  // bar clears
      setTimeout(() => setPhase('file-2'),       12000), // fixed file appears
      setTimeout(() => setPhase('send-file-2'),  13500), // send pressed
      setTimeout(() => setPhase('idle-end'),     14200), // bar clears
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // What's shown in the input bar
  const showFile = phase === 'file-1' || phase === 'send-file-1' || phase === 'file-2' || phase === 'send-file-2';
  const showTyping = phase === 'typing-q' || phase === 'send-q';
  const showSpinner = phase === 'send-file-1' || phase === 'send-q' || phase === 'send-file-2';
  const barBusy = showFile || showTyping;
  const currentFile = (phase === 'file-1' || phase === 'send-file-1') ? uc.uploadFile : uc.fixedFile;

  return (
    <>
      <div className="mockup-scroll-story flex flex-col gap-3.5 p-5 pb-16 text-[12px] leading-[1.5]">

        {/* ── RUN 1: FAILED ── */}

        {/* Sent file chip */}
        <A delay={2.8}>
          <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3.5 py-2.5">
            <FileText className="h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-[11px] font-medium text-slate-600">{uc.uploadFile}</p>
          </div>
        </A>

        {/* Failed result card */}
        <A delay={3.5}>
          <div className="rounded-xl border border-red-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between rounded-t-xl bg-red-50/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldX className="h-5 w-5 text-red-500" strokeWidth={2} />
                <div>
                  <p className="text-[14px] font-bold text-red-500">Failed</p>
                  <p className="text-[11px] text-slate-500">{uc.rulebookName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-red-500">
                <XCircle className="h-3.5 w-3.5" />
                <span className="text-[12px] font-semibold">{uc.failCount}</span>
              </div>
            </div>

            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="text-[12px] font-medium text-red-600/80">{uc.failCount} rules failed</p>
            </div>

            <div className="divide-y divide-slate-100">
              {uc.failedRules.map((rule, i) => (
                <div
                  key={rule.name}
                  className="mockup-animate-in flex items-center gap-3 px-4 py-3"
                  style={{ animationDelay: `${4 + i * 0.3}s` }}
                >
                  {rule.passed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2} />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red-400" strokeWidth={2} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-slate-800">{rule.name}</p>
                    <p className="text-[10.5px] text-slate-400">{rule.desc}</p>
                  </div>
                  <div className={`flex shrink-0 items-center gap-1 ${rule.passed ? 'text-slate-400' : 'text-red-400'}`}>
                    <span className="text-[11px]">{rule.pct}</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mockup-animate-in flex items-center gap-1.5 border-t border-slate-100 px-4 py-2"
              style={{ animationDelay: '5.3s' }}
            >
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Evaluated in {uc.evalTime1}</span>
            </div>
          </div>
        </A>

        {/* ── FOLLOW-UP: UNDERSTAND ── */}

        {/* Question bubble — appears after typed in input bar and sent */}
        <A delay={9.5}>
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-slate-800 px-4 py-3 text-[11.5px] leading-snug text-white">
              {uc.userQuestion}
            </div>
          </div>
        </A>

        {/* AI response */}
        <A delay={10.8}>
          <div className="space-y-2 px-1">
            <p className="text-[12px] text-slate-700">{uc.aiResponse}</p>
          </div>
        </A>

        {/* ── RUN 2: CORRECTED ── */}

        {/* Sent file chip 2 */}
        <A delay={14.2}>
          <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3.5 py-2.5">
            <FileText className="h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-[11px] font-medium text-slate-600">{uc.fixedFile}</p>
          </div>
        </A>

        {/* All-green result card */}
        <A delay={15}>
          <div className="rounded-xl border border-emerald-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between rounded-t-xl bg-emerald-50/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" strokeWidth={2} />
                <div>
                  <p className="text-[14px] font-bold text-emerald-500">Passed</p>
                  <p className="text-[11px] text-slate-500">{uc.rulebookName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-500">
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.5 3.5 6.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[12px] font-semibold">4</span>
              </div>
            </div>

            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="text-[12px] font-medium text-emerald-600/80">All rules satisfied</p>
            </div>

            <div className="divide-y divide-slate-100">
              {uc.passedRules.map((rule, i) => (
                <div
                  key={`pass-${rule.name}`}
                  className="mockup-animate-in flex items-center gap-3 px-4 py-3"
                  style={{ animationDelay: `${15.5 + i * 0.3}s` }}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-slate-800">{rule.name}</p>
                    <p className="text-[10.5px] text-slate-400">{rule.desc}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-slate-400">
                    <span className="text-[11px]">{rule.pct}</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mockup-animate-in flex items-center gap-1.5 border-t border-slate-100 px-4 py-2"
              style={{ animationDelay: '16.8s' }}
            >
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Evaluated in {uc.evalTime2}</span>
            </div>
          </div>
        </A>
      </div>

      {/* Animated input bar */}
      <div className="absolute bottom-2.5 left-3 right-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative flex items-center gap-2 px-3.5 py-2.5">
          <Paperclip className="h-4 w-4 shrink-0 text-slate-300" />

          <div className="relative min-w-0 flex-1 overflow-hidden">
            {/* Placeholder — fades out when bar is busy */}
            <span
              className={`block text-[11.5px] text-slate-300 transition-opacity duration-200 ${
                barBusy ? 'opacity-0' : 'opacity-100'
              }`}
            >
              Share content to review, or drop a file…
            </span>

            {/* File chip in input bar */}
            {showFile && (
              <div
                key={(phase === 'file-1' || phase === 'send-file-1') ? 'file-1' : 'file-2'}
                className="mockup-file-appear absolute inset-y-0 left-0 flex items-center"
              >
                <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1">
                  <FileText className="h-3 w-3 text-slate-400" />
                  <span className="whitespace-nowrap text-[10.5px] font-medium text-slate-600">
                    {currentFile}
                  </span>
                </div>
              </div>
            )}

            {/* Question typing in input bar */}
            {showTyping && (
              <span className="mockup-type-text mockup-cursor absolute inset-y-0 left-0 flex items-center text-[11.5px] text-slate-700" style={{ animationDelay: '0s' }}>
                {uc.userQuestion}
              </span>
            )}
          </div>

          {/* Send button — press animation + spinner */}
          <div
            key={showSpinner ? `spin-${phase}` : `idle-${phase}`}
            className={`flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-lg bg-[var(--brand)] ${
              showSpinner ? 'mockup-send-press' : ''
            }`}
          >
            {showSpinner ? (
              <svg
                className="h-3.5 w-3.5 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-25"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="currentColor" strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <ArrowUp className="h-3.5 w-3.5 text-white" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main component with rotation ─── */

export function HeroMockup() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % USE_CASES.length);
    }, CYCLE_DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-full w-full flex-col select-none" aria-hidden="true">
      {/* key forces full re-mount → restarts all CSS animations + state */}
      <UseCaseScene key={index} uc={USE_CASES[index]} />
    </div>
  );
}
