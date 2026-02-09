'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-16">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* Left — Copy */}
        <div className="pt-4">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--brand)]">
            Contact
          </p>
          <h1 className="mt-3 text-[2.75rem] font-semibold leading-[1.1] tracking-tight text-slate-900">
            Let&apos;s talk
          </h1>
          <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-slate-500">
            Have a question about RuleKit, need help with a use case, or want to explore how it fits your team? We&apos;ll get back to you within one business day.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10">
                <Mail className="h-5 w-5 text-[var(--brand)]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-800">Email us directly</p>
                <a href="mailto:team@rulekit.io" className="text-[14px] text-[var(--brand)] hover:underline">
                  team@rulekit.io
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10">
                <MessageSquare className="h-5 w-5 text-[var(--brand)]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-800">Quick response</p>
                <p className="text-[14px] text-slate-500">Usually within a few hours during business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm sm:p-10">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-900">Message sent</h2>
              <p className="mt-2 max-w-[32ch] text-[14px] leading-relaxed text-slate-500">
                We&apos;ll get back to you within one business day. Check your inbox for a confirmation.
              </p>
              <Link
                href="/"
                className="mt-6 text-[14px] font-medium text-[var(--brand)] hover:underline"
              >
                Back to homepage
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 text-[14px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 text-[14px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-[13px] font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you're working on or what you'd like to know..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] leading-relaxed text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
                />
              </div>

              {status === 'error' && errorMsg && (
                <p className="text-[13px] text-red-500">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-[var(--brand-hover)] disabled:opacity-60"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
