'use client';

import { FileText, Zap, Eye, Lock, Code2, RefreshCw } from 'lucide-react';

const HERO_FEATURES = [
  {
    icon: <Eye className="h-6 w-6" />,
    title: 'Evidence, not opinions',
    desc: 'Every pass or fail comes with the exact evidence that triggered it — highlighted text, line numbers, specific values. Nothing is a black box.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Results in seconds',
    desc: 'Rules run in parallel across every document. Complex evaluations finish in under two seconds — not minutes of manual review.',
  },
];

const FEATURES = [
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Any content type',
    desc: 'PDFs, Word docs, HTML, Markdown, images, URLs — upload anything.',
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: 'Audit-ready logs',
    desc: 'Every evaluation is timestamped, versioned, and stored. Full history.',
  },
  {
    icon: <Code2 className="h-5 w-5" />,
    title: 'API',
    desc: 'Trigger evaluations from CI, Slack, Zapier, or internal tools.',
  },
  {
    icon: <RefreshCw className="h-5 w-5" />,
    title: 'Rules that evolve',
    desc: 'Update once — every future evaluation uses the latest version instantly.',
  },
];

export function ProductUISection() {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="rounded-3xl bg-[#f0f3f8] px-8 py-16 sm:px-12 sm:py-20">
          <div className="text-center">
            <p className="text-[13px] font-medium tracking-widest uppercase text-slate-300">
              Why RuleKit
            </p>
            <h2 className="mt-3 text-[2.75rem] font-medium tracking-tight text-slate-900 sm:text-[3.25rem]">
              Engineered for{' '}
              <span className="bg-gradient-to-r from-[#2b4c7e] via-[#3d6bab] to-[#4a7bc7] bg-clip-text italic text-transparent">
                trust
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[15px] leading-relaxed text-slate-500">
              Content extraction, rule matching, evidence collection — the hard parts are handled so your team focuses on judgment.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-[1060px]">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {HERO_FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl bg-white px-8 py-8 shadow-sm ring-1 ring-slate-900/[0.05] transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)]/[0.08] text-[var(--brand)]">
                    {f.icon}
                  </div>
                  <h3 className="mt-5 text-[19px] font-semibold tracking-tight text-slate-900">
                    {f.title}
                  </h3>
                  <p className="mt-2.5 max-w-[42ch] text-[14.5px] leading-relaxed text-slate-500">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl bg-white/60 px-6 py-6 ring-1 ring-slate-900/[0.04] transition-all duration-300 hover:bg-white hover:shadow-sm hover:ring-slate-900/[0.07]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/[0.08] text-[var(--brand)]">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-slate-900">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
