'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, PenLine, Layers, Globe } from 'lucide-react';

const AVATARS = [
  { src: '/profile-11770614507.webp', alt: 'User' },
  { src: '/profile-21770614509.webp', alt: 'User' },
  { src: '/profile-31770614508.webp', alt: 'User' },
  { src: '/profile-41770614508.webp', alt: 'User' },
];

import { HeroMockup } from './HeroMockup';

export function HeroSectionV2() {
  return (
    <section className="relative overflow-hidden pt-10 pb-0 lg:pt-12">

      <div className="relative mx-auto max-w-[1400px] px-6">
        {/* Frosted glass container */}
        <div className="rounded-3xl border border-[var(--brand)]/[0.08] bg-[var(--brand)]/[0.02] p-8 shadow-sm backdrop-blur-xl lg:p-10">
        <div className="grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-12">
          {/* Left column — Copy */}
          <div className="py-6 lg:py-10">
            {/* Headline */}
            <h1 className="tracking-[-0.03em] text-slate-900">
              <span className="block text-[3rem] leading-[1.1] font-bold lg:text-[4rem]">
                Create rules.
              </span>
              <span className="mt-1 block whitespace-nowrap text-[2.75rem] leading-[1.08] font-extrabold italic lg:text-[3.75rem]">
                Apply them{' '}
                <span
                  className="bg-gradient-to-r from-[#2b4c7e] via-[#3d6bab] to-[#4a7bc7] bg-clip-text text-transparent"
                >
                  Everywhere.
                </span>
              </span>
            </h1>

            {/* Subhead */}
            <p className="mt-5 max-w-lg text-[1.0625rem] leading-[1.65] text-slate-500 lg:text-lg lg:leading-relaxed">
              Paste text or upload a file (JSON, CSV, TXT, XML, YAML, Markdown) and get instant, AI&#8209;powered verdicts.{' '}
              <span className="text-slate-700">With evidence, explanations, and exactly what to&nbsp;fix.</span>
            </p>

            {/* CTA — single primary + secondary text link */}
            <div className="mt-8 flex items-center gap-5">
              <Link
                href="/home"
                className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[var(--brand)]/20 transition-all duration-300 hover:bg-[var(--brand-hover)] hover:shadow-xl hover:shadow-[var(--brand)]/25"
              >
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how-it-works"
                className="text-[14px] font-medium text-slate-500 transition-colors hover:text-[var(--brand)]"
              >
                See an example run ↓
              </Link>
            </div>

            {/* Social proof — behavioral signal */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {AVATARS.map((a, i) => (
                  <Image
                    key={i}
                    src={a.src}
                    alt={a.alt}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="text-[13px] text-slate-500">
                Used daily to enforce rules across changing inputs
              </p>
            </div>

            {/* Proof line — time-to-value + risk reversal */}
            <p className="mt-3 text-[13px] text-slate-400">
              First run in under 2 minutes · No credit card
            </p>
          </div>

          {/* Right column — Live product mockup in window frame */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Glow behind mockup */}
            <div className="absolute top-1/2 left-1/2 h-[440px] w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand)]/[0.06] blur-[80px]" />

            <div className="relative w-full">
              <div className="relative h-[480px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xl shadow-slate-900/[0.08] lg:h-[540px]">
                {/* Top fade — content trails off at the top edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-white via-white/80 to-transparent" />
                <HeroMockup />
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Bottom row — kills dead space, reinforces use cases */}
        <div className="mt-14 border-t border-slate-100 pt-10 pb-12 lg:mt-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                <PenLine className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-800">Create Your Own Rules</p>
                <p className="text-[13px] leading-snug text-slate-500">
                  Write checks in your own words — no code required.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                <Layers className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-800">Centralize All Logic</p>
                <p className="text-[13px] leading-snug text-slate-500">
                  One place for all your validation rules, not twelve.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                <Globe className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-800">Apply Across Everything</p>
                <p className="text-[13px] leading-snug text-slate-500">
                  Same standards across docs, forms, AI outputs, and structured data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
