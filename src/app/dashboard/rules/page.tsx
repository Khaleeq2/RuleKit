'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, Search, Filter, MoreHorizontal, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

import { RULE_SEVERITIES, type Rule, rulesRepo } from '@/app/lib/rules';

export default function RulesLibraryPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await rulesRepo.list();
        if (mounted) setRules(data);
      } catch (error) {
        console.error('Failed to load rules:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const unsubscribe = rulesRepo.subscribe(load);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const filteredRules = rules.filter(rule => 
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="px-8 py-10 max-w-[1200px] xl:max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] mb-1">
            Rules Library
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Create and manage your validation rules
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/rules/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 text-sm bg-[var(--card)] border border-[var(--border)] rounded-md placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/35 focus:border-[var(--foreground)]/20 transition-all duration-200"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-md hover:bg-[var(--muted)] transition-all duration-200">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Rules Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          {loading ? 'Loading...' : `${filteredRules.length} rule${filteredRules.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--muted)] rounded-md" />
                <div className="flex-1">
                  <div className="h-5 w-1/3 bg-[var(--muted)] rounded mb-2" />
                  <div className="h-4 w-2/3 bg-[var(--muted)] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-lg bg-[var(--muted)] flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-8 h-8 text-[var(--foreground)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {searchQuery ? 'No rules found' : 'No rules yet'}
          </h3>
          <p className="text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
            {searchQuery 
              ? 'Try adjusting your search to find what you\'re looking for.' 
              : 'Create your first validation rule to start checking your assets.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push('/dashboard/rules/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-md hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create your first rule
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRules.map((rule, index) => (
            <div
              key={rule.id}
              onClick={() => router.push(`/dashboard/rules/${rule.id}`)}
              className="group bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--foreground)]/15 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-[var(--muted)] flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.03]">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {rule.name}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-1">
                        {rule.description}
                      </p>
                    </div>
                    
                    <button 
                      className="p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      rule.enabled
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>

                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--foreground)]">
                      {rule.category}
                    </span>

                    {(() => {
                      const s = RULE_SEVERITIES.find((x) => x.value === rule.severity);
                      if (!s) return null;
                      return (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.badgeClassName}`}>
                          {s.label}
                        </span>
                      );
                    })()}

                    <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                      <Clock className="w-3.5 h-3.5" />
                      Updated {new Date(rule.updatedAt || rule.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {rule.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {rule.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--secondary)] text-[var(--foreground)]"
                        >
                          {tag}
                        </span>
                      ))}
                      {rule.tags.length > 3 && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--secondary)] text-[var(--muted-foreground)]">
                          +{rule.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
