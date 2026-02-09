'use client';

import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FAQS = [
  {
    q: 'How is this different from writing validation logic in code?',
    a: 'Code requires a developer, a deploy, and a test suite for every change. RuleKit lets anyone write rules in plain English, update them instantly, and apply them to any content type. Changes go live in seconds — no PRs, no waiting.',
  },
  {
    q: 'What kinds of content can I evaluate?',
    a: 'PDFs, Word docs, spreadsheets, HTML pages, Markdown, plain text, images, and URLs. If it carries information, RuleKit can parse it and run your rules against it.',
  },
  {
    q: 'How do I know the results are accurate?',
    a: 'Every verdict includes the specific evidence that triggered it — exact text, line numbers, values. You can verify any result in seconds. Same input plus same rules always equals the same result.',
  },
  {
    q: 'Can I plug this into my existing workflow?',
    a: 'Yes. RuleKit has a REST API you can call from CI pipelines, Slack bots, Zapier, or internal tools. Trigger evaluations programmatically or use the dashboard — your choice.',
  },
  {
    q: 'Is it free to try?',
    a: 'Completely. Sign up, write rules, upload content, and run evaluations — no credit card required. Paid plans unlock higher volumes, team collaboration, and priority support.',
  },
  {
    q: 'How fast can I get my first result?',
    a: 'Under two minutes. Sign up, write one rule in plain English, drop in a file, and see a verdict with evidence. No setup wizards, no onboarding calls.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className={`text-[15px] font-semibold transition-colors duration-200 ${open ? 'text-[var(--brand)]' : 'text-slate-800'}`}>{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[64ch] text-[14px] leading-relaxed text-slate-500">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ObjectionHandlingSection() {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="rounded-3xl border border-slate-200/60 bg-white px-8 py-16 sm:px-12 sm:py-20">
          <div className="text-center">
            <h2 className="text-[2.75rem] font-medium tracking-tight text-slate-900 sm:text-[3.25rem]">
              Questions?{' '}
              <span className="bg-gradient-to-r from-[#2b4c7e] via-[#3d6bab] to-[#4a7bc7] bg-clip-text text-transparent">
                Answered.
              </span>
            </h2>
          </div>

          <div className="mx-auto mt-12 max-w-[680px]">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-[14px] text-slate-400">
              Still have questions?
            </p>
            <Link
              href="/contact"
              className="group mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--brand)] transition-colors hover:text-[var(--brand)]/80"
            >
              Talk to us
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
