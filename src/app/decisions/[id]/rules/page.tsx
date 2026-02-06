'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  Trash2,
  GripVertical,
  Pencil,
  Save,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/app/components/ui/collapsible';
import { rulesRepo, schemasRepo } from '@/app/lib/decisions';
import { Rule, RuleCondition, ConditionOperator, SchemaField, OPERATOR_LABELS, RuleResult } from '@/app/lib/types';
import { toast } from 'sonner';

// ============================================
// Rules Tab
// ============================================

export default function RulesPage() {
  const params = useParams();
  const decisionId = params.id as string;

  const [rules, setRules] = useState<Rule[]>([]);
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Load rules and schema
  useEffect(() => {
    const loadData = async () => {
      try {
        const [rulesData, schemaData] = await Promise.all([
          rulesRepo.listByDecisionId(decisionId),
          schemasRepo.getByDecisionId(decisionId),
        ]);
        setRules(rulesData);
        setSchemaFields(schemaData?.fields || []);
      } catch (error) {
        console.error('Failed to load rules:', error);
        toast.error('Failed to load rules');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const unsubscribe = rulesRepo.listByDecisionId(decisionId).then(() => {});
    return () => {};
  }, [decisionId]);

  const handleAddRule = () => {
    const newRule: Partial<Rule> = {
      decisionId,
      name: '',
      description: '',
      order: rules.length + 1,
      condition: { type: 'simple', field: '', operator: 'equals', value: '' },
      result: 'fail',
      reason: '',
      enabled: true,
    };
    setEditingRule(newRule as Rule);
    setIsEditorOpen(true);
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule({ ...rule });
    setIsEditorOpen(true);
  };

  const handleSaveRule = async (rule: Partial<Rule>) => {
    try {
      if (rule.id) {
        // Update existing rule
        await rulesRepo.update(rule.id, rule);
        setRules(rules.map(r => r.id === rule.id ? { ...r, ...rule } : r));
        toast.success('Rule updated');
      } else {
        // Create new rule
        const newRule = await rulesRepo.create(rule as Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>);
        setRules([...rules, newRule]);
        toast.success('Rule created');
      }
      setIsEditorOpen(false);
      setEditingRule(null);
    } catch (error) {
      console.error('Failed to save rule:', error);
      toast.error('Failed to save rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await rulesRepo.remove(id);
      setRules(rules.filter(r => r.id !== id));
      toast.success('Rule deleted');
    } catch (error) {
      console.error('Failed to delete rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const handleToggleEnabled = async (id: string) => {
    try {
      const rule = await rulesRepo.toggleEnabled(id);
      setRules(rules.map(r => r.id === id ? rule : r));
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      toast.error('Failed to toggle rule');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Rules</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Define the logic that determines pass or fail outcomes
          </p>
        </div>
        <Button onClick={handleAddRule}>
          <Plus className="w-4 h-4 mr-2" />
          Add rule
        </Button>
      </div>

      {/* Info card */}
      <Card className="mb-6 bg-[var(--muted)]/50">
        <CardContent className="py-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Rules are evaluated in order from top to bottom. The first rule that matches determines the outcome.
            If no rules match, the default outcome is <strong>pass</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Rules list */}
      {rules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-[var(--muted-foreground)] mb-4">
              No rules defined yet
            </p>
            <Button onClick={handleAddRule}>
              <Plus className="w-4 h-4 mr-2" />
              Add first rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              index={index}
              onEdit={() => handleEditRule(rule)}
              onDelete={() => handleDeleteRule(rule.id)}
              onToggleEnabled={() => handleToggleEnabled(rule.id)}
            />
          ))}
        </div>
      )}

      {/* Rule Editor Sheet */}
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <RuleEditor
            rule={editingRule}
            schemaFields={schemaFields}
            onSave={handleSaveRule}
            onCancel={() => {
              setIsEditorOpen(false);
              setEditingRule(null);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ============================================
// Rule Card Component
// ============================================

function RuleCard({
  rule,
  index,
  onEdit,
  onDelete,
  onToggleEnabled,
}: {
  rule: Rule;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleEnabled: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConditionSummary = (condition: RuleCondition): string => {
    if (condition.type === 'simple') {
      const op = OPERATOR_LABELS[condition.operator as ConditionOperator] || condition.operator;
      return `${condition.field} ${op} "${condition.value}"`;
    }
    if (condition.type === 'and' || condition.type === 'or') {
      const count = condition.conditions?.length || 0;
      return `${count} conditions (${condition.type.toUpperCase()})`;
    }
    return 'Complex condition';
  };

  return (
    <Card className={`transition-all ${!rule.enabled ? 'opacity-60' : ''}`}>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {/* Drag handle */}
          <div className="pt-1 cursor-grab text-[var(--muted-foreground)]">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Order number */}
          <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-[var(--muted-foreground)]">{index + 1}</span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-[var(--foreground)] truncate">
                {rule.name || 'Untitled rule'}
              </h3>
              <Badge 
                variant="outline" 
                className={rule.result === 'pass' 
                  ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20' 
                  : 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20'
                }
              >
                {rule.result === 'pass' ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" />Pass</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" />Fail</>
                )}
              </Badge>
            </div>

            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              When: <code className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-xs">{getConditionSummary(rule.condition)}</code>
            </p>

            {rule.reason && (
              <p className="text-sm text-[var(--muted-foreground)]">
                Reason: "{rule.reason}"
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Switch
              checked={rule.enabled}
              onCheckedChange={onToggleEnabled}
            />
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Rule Editor Component
// ============================================

function RuleEditor({
  rule,
  schemaFields,
  onSave,
  onCancel,
}: {
  rule: Rule | null;
  schemaFields: SchemaField[];
  onSave: (rule: Partial<Rule>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(rule?.name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [field, setField] = useState(rule?.condition?.field || '');
  const [operator, setOperator] = useState<ConditionOperator>(
    (rule?.condition?.operator as ConditionOperator) || 'equals'
  );
  const [value, setValue] = useState(String(rule?.condition?.value || ''));
  const [result, setResult] = useState<RuleResult>(rule?.result || 'fail');
  const [reason, setReason] = useState(rule?.reason || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a rule name');
      return;
    }
    if (!field) {
      toast.error('Please select a field');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please enter a reason message');
      return;
    }

    setIsSaving(true);

    const updatedRule: Partial<Rule> = {
      ...rule,
      name,
      description,
      condition: {
        type: 'simple',
        field,
        operator,
        value: value,
      },
      result,
      reason,
    };

    await onSave(updatedRule);
    setIsSaving(false);
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>{rule?.id ? 'Edit rule' : 'Add rule'}</SheetTitle>
        <SheetDescription>
          Define the condition and outcome for this rule
        </SheetDescription>
      </SheetHeader>

      <div className="py-6 space-y-6">
        {/* Rule name */}
        <div className="space-y-2">
          <Label htmlFor="name">Rule name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Minimum Credit Score"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this rule check?"
            rows={2}
          />
        </div>

        {/* Condition */}
        <div className="space-y-4">
          <Label>Condition</Label>
          <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Field</Label>
                <Select value={field} onValueChange={setField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemaFields.length === 0 ? (
                      <div className="p-2 text-sm text-[var(--muted-foreground)]">
                        No fields defined. Add fields in Schema tab first.
                      </div>
                    ) : (
                      schemaFields.map((f) => (
                        <SelectItem key={f.id} value={f.name}>
                          {f.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Operator</Label>
                <Select value={operator} onValueChange={(v) => setOperator(v as ConditionOperator)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(OPERATOR_LABELS) as [ConditionOperator, string][]).map(([op, label]) => (
                      <SelectItem key={op} value={op}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Value</Label>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Expected value"
              />
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="space-y-2">
          <Label>Result when condition matches</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={result === 'fail' ? 'default' : 'outline'}
              className={result === 'fail' ? 'bg-[var(--destructive)] hover:bg-[var(--destructive)]/90' : ''}
              onClick={() => setResult('fail')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Fail
            </Button>
            <Button
              variant={result === 'pass' ? 'default' : 'outline'}
              className={result === 'pass' ? 'bg-[var(--success)] hover:bg-[var(--success)]/90' : ''}
              onClick={() => setResult('pass')}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Pass
            </Button>
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <Label htmlFor="reason">Reason message</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Message returned when this rule fires"
            rows={2}
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            This message will be included in the decision response
          </p>
        </div>
      </div>

      <SheetFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save rule'}
        </Button>
      </SheetFooter>
    </>
  );
}
