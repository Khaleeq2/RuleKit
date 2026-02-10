'use client';

import { PenLine, Upload, ShieldCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    num: '1',
    icon: <PenLine className="h-5 w-5" />,
    title: 'Write your rules',
    desc: '"Every expense over $25 needs a receipt." Write checks in plain English and group them into reusable rule sets. No code required.',
  },
  {
    num: '2',
    icon: <Upload className="h-5 w-5" />,
    title: 'Send any content',
    desc: 'Drop a PDF, paste a URL, or call the API. RuleKit extracts what it needs and maps your rules automatically.',
  },
  {
    num: '3',
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Get fast verdicts, backed by evidence.',
    desc: 'Pass or fail — with the exact text, values, and line numbers that triggered each result. Seconds, not hours.',
  },
];

export function HowItWorksV2Section() {
  return (
    <section className="py-16 lg:py-20" id="how-it-works">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="rounded-3xl border border-slate-200/60 bg-white px-8 py-16 sm:px-12 sm:py-20">
          <div className="text-center">
            <p className="text-[13px] font-medium tracking-widest uppercase text-slate-300">
              How it works
            </p>
            <h2 className="mt-3 text-[2.75rem] font-medium tracking-tight text-slate-900 sm:text-[3.25rem]">
              Three steps to{' '}
              <span className="bg-gradient-to-r from-[#2b4c7e] via-[#3d6bab] to-[#4a7bc7] bg-clip-text text-transparent">
                total clarity
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[15px] leading-relaxed text-slate-500">
              Go from scattered checklists to automated, auditable verdicts in under two minutes.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-[1060px] grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="group relative rounded-2xl bg-slate-50/60 px-7 py-8 ring-1 ring-slate-900/[0.03] transition-all duration-300 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:ring-slate-900/[0.06]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-[32px] font-bold leading-none text-[var(--brand)]/20">
                    {step.num}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/[0.08] text-[var(--brand)]">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-[17px] font-semibold tracking-tight text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-500">
                  {step.desc}
                </p>

                {i < STEPS.length - 1 && (
                  <div className="absolute -right-[14px] top-1/2 z-10 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
