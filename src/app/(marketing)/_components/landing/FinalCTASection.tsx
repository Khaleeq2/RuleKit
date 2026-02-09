'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-16 pb-24 lg:py-20 lg:pb-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a5f] via-[#2b4c7e] to-[#3d6bab] px-8 py-24 sm:px-12 sm:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.06),transparent)]" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/[0.03] blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/[0.04] blur-3xl" />

          <div className="relative z-10 text-center">
            <h2 className="text-[2.75rem] font-medium tracking-tight text-white sm:text-[3.5rem]">
              Your standards.
              <br />
              <span className="text-white/80">Enforced automatically.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-[44ch] text-[16px] leading-relaxed text-white/60">
              Write rules once. Apply them to every document, every time. Get verdicts with evidence — not opinions.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/home"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[15px] font-semibold text-[#2b4c7e] shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
              >
                Start building for free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-white/20 px-7 py-3.5 text-[14px] font-medium text-white/80 transition-all duration-300 hover:border-white/40 hover:text-white"
              >
                Book a demo
              </Link>
            </div>

            <p className="mt-8 text-[13px] text-white/40">
              No credit card required · First verdict in under 2 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
