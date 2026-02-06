'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Zap, Clock, RefreshCw, ChevronRight, Shield, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeaderSimple } from '@/app/components/PageHeader';

interface ValidationResult {
  id: string;
  assetName: string;
  status: 'passed' | 'failed';
  passedRules: number;
  failedRules: number;
  timestamp: string;
}

export default function ValidationPage() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash || '';
      const match = hash.match(/^#validation-(.+)$/);
      const id = match?.[1] ?? null;
      setTargetId(id);

      if (!id) return;
      const el = document.getElementById(`validation-${id}`);
      if (!el) return;
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const loadResults = async () => {
    try {
      const response = await fetch('/api/validations');
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunValidation = async () => {
    setRunning(true);
    try {
      const response = await fetch('/api/validations/run', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run validation');
      }

      toast.success('Validation completed successfully');
      loadResults();
    } catch (error: any) {
      toast.error(error.message || 'Failed to run validation');
    } finally {
      setRunning(false);
    }
  };

  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const passRate = results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0;

  return (
    <div className="px-8 py-10 max-w-[1200px] xl:max-w-[1280px] mx-auto">
      <PageHeaderSimple
        title="Validation"
        subtitle="Execute rules and review results"
        primaryAction={
          <button
            onClick={handleRunValidation}
            disabled={running}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-b from-zinc-800 to-zinc-950 border-t border-white/10 rounded-lg shadow-sm hover:from-zinc-700 hover:to-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Running...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Execute Rules
              </>
            )}
          </button>
        }
      />

      {/* Stats Cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-5 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--foreground)]">{passedCount}</p>
                <p className="text-sm text-[var(--muted-foreground)]">Passed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--foreground)]">{failedCount}</p>
                <p className="text-sm text-[var(--muted-foreground)]">Failed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[var(--foreground)]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--foreground)]">{passRate}%</p>
                <p className="text-sm text-[var(--muted-foreground)]">Pass Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Validation Results</h2>
        {results.length > 0 && (
          <button 
            onClick={loadResults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--muted)] rounded-md" />
                <div className="flex-1">
                  <div className="h-4 w-1/3 bg-[var(--muted)] rounded mb-2" />
                  <div className="h-3 w-1/4 bg-[var(--muted)] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-lg bg-[var(--muted)] flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-[var(--foreground)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            No validations yet
          </h3>
          <p className="text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
            Execute your first ruleset to generate a decision you can review.
          </p>
          <button
            onClick={handleRunValidation}
            disabled={running}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            Execute Rules
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {results.map((result, index) => (
            <div
              key={result.id}
              id={`validation-${result.id}`}
              className="group bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-md flex items-center justify-center ${
                  result.status === 'passed' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {result.status === 'passed' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[var(--foreground)] truncate">
                      {result.assetName}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                      result.status === 'passed'
                        ? 'bg-emerald-500/5 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                        : 'bg-red-500/5 text-red-700 border-red-500/20 dark:text-red-400 dark:border-red-500/30'
                    }`}>
                      {result.status === 'passed' ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-sm text-[var(--muted-foreground)]">
                      <span className="text-emerald-600 font-medium">{result.passedRules}</span> passed
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      <span className="text-red-600 font-medium">{result.failedRules}</span> failed
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Clock className="w-3 h-3" />
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-0 group-hover:translate-x-1" />
              </div>

              {targetId === result.id && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--muted-foreground)]">Explanation</p>
                      <p className="text-sm text-[var(--foreground)] mt-1">
                        This execution evaluated the asset against your rules.
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        {result.passedRules} passed, {result.failedRules} failed.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (typeof window === 'undefined') return;
                        history.replaceState(null, '', window.location.pathname);
                        setTargetId(null);
                      }}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                    >
                      Close
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
