'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/app/components/PageHeader';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/app/components/ui/collapsible';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { Textarea } from '@/app/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/app/components/ui/toggle-group';
import { Switch } from '@/app/components/ui/switch';

import {
  RULE_CATEGORIES,
  RULE_FILE_TYPES,
  RULE_OPERATORS,
  RULE_SEVERITIES,
  type Rule,
  type RuleCondition,
  rulesRepo,
} from '@/app/lib/rules';

function createCondition(): RuleCondition {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
  return {
    id,
    field: '',
    operator: 'contains',
    value: '',
    description: '',
  };
}

function createDraft(): Omit<Rule, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    category: RULE_CATEGORIES[0],
    severity: 'medium',
    criteria: '',
    applicableFileTypes: [],
    tags: [],
    enabled: true,
    conditions: [],
  };
}

export function RuleEditor({ ruleId }: { ruleId?: string }) {
  const router = useRouter();
  const isEditMode = Boolean(ruleId);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>>(createDraft());

  // Progressive disclosure states
  // In edit mode, collapse info by default (user already set it up)
  // In create mode, expand info (user needs to fill it)
  const [infoExpanded, setInfoExpanded] = useState(!isEditMode);
  const [conditionsExpanded, setConditionsExpanded] = useState(false);

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!ruleId) return;
      setLoading(true);
      try {
        const existing = await rulesRepo.getById(ruleId);
        if (!existing) {
          toast.error('Rule not found');
          router.push('/dashboard/rules');
          return;
        }

        if (!cancelled) {
          const { id, createdAt, updatedAt, ...rest } = existing;
          setDraft(rest);
          // If rule has conditions, expand the conditions section
          if (rest.conditions.length > 0) {
            setConditionsExpanded(true);
          }
        }
      } catch {
        toast.error('Failed to load rule');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [ruleId, router]);

  const selectedSeverity = useMemo(
    () => RULE_SEVERITIES.find((s) => s.value === draft.severity) ?? RULE_SEVERITIES[1],
    [draft.severity]
  );

  const canSave = useMemo(() => {
    const hasName = draft.name.trim().length > 0;
    const hasLogic = draft.criteria.trim().length > 0 || draft.conditions.length > 0;
    return hasName && hasLogic;
  }, [draft.conditions.length, draft.criteria, draft.name]);

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean) return;
    const normalized = clean.toLowerCase();
    if (draft.tags.some((t) => t.toLowerCase() === normalized)) return;
    setDraft((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
  };

  const removeTag = (tag: string) => {
    setDraft((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && draft.tags.length > 0) {
      removeTag(draft.tags[draft.tags.length - 1]);
    }
  };

  const addCondition = () => {
    setConditionsExpanded(true);
    setDraft((prev) => ({ ...prev, conditions: [...prev.conditions, createCondition()] }));
  };

  const updateCondition = (id: string, updates: Partial<RuleCondition>) => {
    setDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const removeCondition = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
  };

  const handleSave = async () => {
    if (!canSave) {
      toast.error('Add a rule name and at least one criteria or condition');
      return;
    }

    setSaving(true);
    try {
      if (ruleId) {
        await rulesRepo.update(ruleId, draft);
        toast.success('Rule updated');
      } else {
        await rulesRepo.create(draft);
        toast.success('Rule created');
      }

      router.push('/dashboard/rules');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-[900px] mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[var(--muted)] rounded" />
          <div className="h-64 bg-[var(--muted)] rounded-xl" />
        </div>
      </div>
    );
  }

  const pageTitle = isEditMode ? (draft.name || 'Edit Rule') : 'New Rule';

  return (
    <div className="px-8 py-10 max-w-[900px] mx-auto">
      <PageHeader
        title={pageTitle}
        backHref="/dashboard/rules"
        backLabel="Back to Rules"
        breadcrumb={[
          { label: 'Rules', href: '/dashboard/rules' },
          { label: pageTitle },
        ]}
        primaryAction={
          <Button 
            onClick={handleSave} 
            disabled={saving || !canSave} 
            className="gap-2 bg-gradient-to-b from-zinc-800 to-zinc-950 border-t border-white/10 shadow-sm hover:from-zinc-700 hover:to-zinc-900 text-white"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Rule'}
          </Button>
        }
      />

      <div className="space-y-6">
        {/* ============================================
            SECTION 1: RULE CRITERIA (THE HERO)
            This is the primary job - define what the rule does
            ============================================ */}
        <Card className="gap-0 border-[var(--border)] shadow-[var(--shadow-md)] bg-[var(--card)]">
          <CardHeader className="items-center pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-[var(--foreground)]" />
              What should this rule check?
            </CardTitle>
            <CardDescription className="text-sm">
              Describe in plain language what this rule validates
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            {/* Rule name - always visible, it's essential */}
            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Rule Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Brand Color Check"
                  value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                  className="h-10"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="criteria" className="text-sm">
                Criteria
              </Label>
              <Textarea
                id="criteria"
                placeholder="Define the specific criteria this rule should check. Be detailed and specific about what constitutes a pass or fail..."
                value={draft.criteria}
                onChange={(e) => setDraft((p) => ({ ...p, criteria: e.target.value }))}
                rows={5}
                className="resize-none"
              />
            </div>

            {/* AI hint - subtle, not a decision point */}
            <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              AI evaluates assets against this criteria during validation
            </p>
          </CardContent>
        </Card>

        {/* ============================================
            SECTION 2: RULE INFORMATION (COLLAPSIBLE)
            Metadata that supports but doesn't dominate
            ============================================ */}
        <Collapsible open={infoExpanded} onOpenChange={setInfoExpanded}>
          <Card
            className={`gap-0 overflow-hidden transition-all duration-200 ${
              infoExpanded
                ? 'bg-[var(--card)] shadow-[var(--shadow-card)] border-[var(--border)]'
                : 'bg-[var(--muted)]/50 border-[var(--border)] shadow-none'
            }`}
          >
            <CollapsibleTrigger asChild>
              <button className="w-full text-left">
                <CardHeader
                  className={`items-center py-4 cursor-pointer transition-colors ${
                    infoExpanded ? 'hover:bg-[var(--muted)]/30' : 'hover:bg-[var(--muted)]/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings2 className="w-4 h-4 text-[var(--muted-foreground)]" />
                      <span className="font-medium text-sm text-[var(--foreground)]">
                        Rule Settings
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Compact summary when collapsed */}
                      {!infoExpanded && draft.name && (
                        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                          <Badge variant="outline" className="font-normal text-xs py-0 h-5">
                            {draft.category}
                          </Badge>
                          <Badge className={`${selectedSeverity.badgeClassName} font-normal text-xs py-0 h-5`}>
                            {selectedSeverity.label}
                          </Badge>
                          <span className={draft.enabled ? 'text-emerald-600' : 'text-[var(--muted-foreground)]'}>
                            {draft.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      )}
                      {infoExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="border-t border-[var(--border)] bg-[var(--background)]">
              <CardContent className="pt-2 pb-6 space-y-5 animate-fade-in">
                {/* Name (only in edit mode, since it's in hero for create) */}
                {isEditMode && (
                  <div className="space-y-2">
                    <Label htmlFor="name-edit">Rule Name</Label>
                    <Input
                      id="name-edit"
                      placeholder="e.g., Brand Color Check"
                      value={draft.name}
                      onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={draft.category}
                      onValueChange={(value) =>
                        setDraft((p) => ({ ...p, category: value as Rule['category'] }))
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RULE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={draft.severity}
                      onValueChange={(value) =>
                        setDraft((p) => ({ ...p, severity: value as Rule['severity'] }))
                      }
                    >
                      <SelectTrigger id="severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RULE_SEVERITIES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={s.badgeClassName}>{s.label}</Badge>
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {s.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of what this rule checks..."
                    value={draft.description}
                    onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Rule Status</Label>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {draft.enabled ? 'This rule is active and will run during validation' : 'This rule is disabled'}
                    </p>
                  </div>
                  <Switch
                    checked={draft.enabled}
                    onCheckedChange={(checked) => setDraft((p) => ({ ...p, enabled: checked }))}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>File Types</Label>
                  <ToggleGroup
                    type="multiple"
                    value={draft.applicableFileTypes}
                    onValueChange={(value) =>
                      setDraft((p) => ({ ...p, applicableFileTypes: value as any }))
                    }
                    className="flex flex-wrap justify-start gap-1"
                  >
                    {RULE_FILE_TYPES.map((t) => (
                      <ToggleGroupItem 
                        key={t.value} 
                        value={t.value} 
                        className="rounded-lg text-xs h-8 px-3"
                      >
                        {t.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Leave blank to apply to all asset types
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {draft.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                        >
                          {tag}
                          <span className="text-[var(--muted-foreground)]">×</span>
                        </button>
                      ))}
                    </div>
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Type a tag and press Enter"
                      className="border-0 shadow-none focus-visible:ring-0 px-0 h-7"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* ============================================
            SECTION 3: VALIDATION CONDITIONS (ADVANCED)
            Gated complexity - collapsed by default
            ============================================ */}
        <Collapsible open={conditionsExpanded} onOpenChange={setConditionsExpanded}>
          <Card
            className={`gap-0 overflow-hidden transition-all duration-200 ${
              conditionsExpanded
                ? 'bg-[var(--card)] shadow-[var(--shadow-card)] border-[var(--border)]'
                : 'bg-[var(--muted)]/50 border-[var(--border)] shadow-none'
            }`}
          >
            <CollapsibleTrigger asChild>
              <button className="w-full text-left">
                <CardHeader
                  className={`items-center py-4 cursor-pointer transition-colors ${
                    conditionsExpanded ? 'hover:bg-[var(--muted)]/30' : 'hover:bg-[var(--muted)]/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-[var(--muted-foreground)]" />
                      <div>
                        <span className="font-medium text-sm text-[var(--foreground)]">
                          Structured Conditions
                        </span>
                        <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                          Optional
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {draft.conditions.length > 0 && (
                        <Badge variant="outline" className="font-normal text-xs">
                          {draft.conditions.length} condition{draft.conditions.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {conditionsExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                      )}
                    </div>
                  </div>
                  {!conditionsExpanded && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 ml-7">
                      Optional · For precise, field-based validation
                    </p>
                  )}
                </CardHeader>
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="border-t border-[var(--border)] bg-[var(--background)]">
              <CardContent className="pt-2 pb-6 space-y-4 animate-fade-in">
                {draft.conditions.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-[var(--border)] rounded-lg bg-[var(--muted)]/20">
                    <p className="text-sm text-[var(--muted-foreground)] mb-3">
                      No conditions yet
                    </p>
                    <Button onClick={addCondition} variant="outline" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Condition
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Precise checks that run alongside AI criteria
                      </p>
                      <Button onClick={addCondition} variant="outline" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {draft.conditions.map((condition, index) => (
                        <div 
                          key={condition.id} 
                          className="p-4 rounded-lg bg-[var(--muted)]/40 border border-[var(--border)] animate-fade-in-up"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[var(--foreground)]/10 text-[var(--foreground)] flex items-center justify-center font-medium text-xs flex-shrink-0 mt-1">
                              {index + 1}
                            </div>

                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Field</Label>
                                  <Input
                                    placeholder="content"
                                    value={condition.field}
                                    onChange={(e) =>
                                      updateCondition(condition.id, { field: e.target.value })
                                    }
                                    className="h-10"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-xs">Operator</Label>
                                  <Select
                                    value={condition.operator}
                                    onValueChange={(value) =>
                                      updateCondition(condition.id, {
                                        operator: value as RuleCondition['operator'],
                                      })
                                    }
                                  >
                                    <SelectTrigger className="h-10">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {RULE_OPERATORS.map((op) => (
                                        <SelectItem key={op.value} value={op.value}>
                                          {op.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-xs">Value</Label>
                                  <Input
                                    placeholder="Expected value"
                                    value={condition.value}
                                    onChange={(e) =>
                                      updateCondition(condition.id, { value: e.target.value })
                                    }
                                    className="h-10"
                                  />
                                </div>
                              </div>

                              <Input
                                placeholder="Description (optional)"
                                value={condition.description}
                                onChange={(e) =>
                                  updateCondition(condition.id, { description: e.target.value })
                                }
                                className="h-10"
                              />
                            </div>

                            <button
                              onClick={() => removeCondition(condition.id)}
                              className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
}
