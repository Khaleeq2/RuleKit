'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  Trash2,
  Pencil,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { rulesRepo } from '@/app/lib/rulebooks';
import { Rule } from '@/app/lib/types';
import { toast } from 'sonner';

// ============================================
// Rules Page
// ============================================

export default function RulesPage() {
  const params = useParams();
  const rulebookId = params.id as string;

  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rulesData = await rulesRepo.listByRulebookId(rulebookId);
        setRules(rulesData);
      } catch (error) {
        console.error('Failed to load rules:', error);
        toast.error('Failed to load rules');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [rulebookId]);

  const handleAddRule = () => {
    const newRule: Partial<Rule> = {
      rulebookId,
      name: '',
      description: '',
      order: rules.length + 1,
      condition: { type: 'simple' },
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
        await rulesRepo.update(rule.id, rule);
        setRules(rules.map(r => r.id === rule.id ? { ...r, ...rule } : r));
        toast.success('Rule updated');
      } else {
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
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-medium text-[var(--foreground)] tracking-[-0.01em]">Rules</h2>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
            Each rule defines a requirement your input must meet
          </p>
        </div>
        <Button onClick={handleAddRule}>
          <Plus className="w-4 h-4" />
          Add rule
        </Button>
      </div>

      {/* Rules list */}
      {rules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--muted)] flex items-center justify-center mx-auto mb-4">
              <ListChecks className="w-5 h-5 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--foreground)] mb-1">
              Add your first rule
            </h3>
            <p className="text-[13px] text-[var(--muted-foreground)] mb-6 max-w-xs mx-auto">
              Start with one requirement. You can always add more later.
            </p>
            <Button onClick={handleAddRule}>
              <Plus className="w-4 h-4" />
              Add rule
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

      {/* Evaluation info — only shown when rules exist */}
      {rules.length > 0 && (
        <p className="mt-6 text-[12px] text-[var(--muted-foreground)]/60 text-center">
          All rules are evaluated against the input. If any requirement is not met, the overall result is <strong className="text-[var(--foreground)]">fail</strong>.
        </p>
      )}

      {/* Rule Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <RuleEditor
            rule={editingRule}
            onSave={handleSaveRule}
            onCancel={() => {
              setIsEditorOpen(false);
              setEditingRule(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Rule Card
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
  return (
    <Card className={`transition-all duration-200 hover:shadow-md hover:border-[var(--muted-foreground)]/25 group/rule ${!rule.enabled ? 'opacity-50' : ''}`}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          {/* Order number */}
          <div className="w-7 h-7 rounded-full bg-[var(--muted)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[12px] font-semibold text-[var(--muted-foreground)]">{index + 1}</span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-[var(--foreground)] truncate leading-snug">
              {rule.name || 'Untitled rule'}
            </h3>

            {rule.description && (
              <p className="text-[13px] text-[var(--muted-foreground)] mt-1 line-clamp-2 leading-relaxed">
                {rule.description}
              </p>
            )}

            {rule.reason && (
              <p className="text-[12px] text-[var(--muted-foreground)]/60 mt-1.5 italic">
                {rule.reason}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Switch
              checked={rule.enabled}
              onCheckedChange={onToggleEnabled}
            />
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-[var(--muted-foreground)] hover:text-[var(--destructive)]" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Rule Editor (Dialog content)
// ============================================

function RuleEditor({
  rule,
  onSave,
  onCancel,
}: {
  rule: Rule | null;
  onSave: (rule: Partial<Rule>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(rule?.name || '');
  const [requirement, setRequirement] = useState(rule?.description || '');
  const [notes, setNotes] = useState(rule?.reason || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a rule name');
      return;
    }
    if (!requirement.trim()) {
      toast.error('Please describe the requirement');
      return;
    }

    setIsSaving(true);

    const updatedRule: Partial<Rule> = {
      ...rule,
      name: name.trim(),
      description: requirement.trim(),
      condition: { type: 'simple' },
      result: 'fail',
      reason: notes.trim(),
    };

    await onSave(updatedRule);
    setIsSaving(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{rule?.id ? 'Edit rule' : 'Add rule'}</DialogTitle>
        <DialogDescription>
          Define a requirement that your input must satisfy
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 py-2">
        {/* Rule name */}
        <div className="space-y-2">
          <Label htmlFor="rule-name">Name</Label>
          <Input
            id="rule-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Minimum Credit Score"
            autoFocus
          />
        </div>

        {/* Requirement */}
        <div className="space-y-2">
          <Label htmlFor="rule-requirement">Requirement</Label>
          <Textarea
            id="rule-requirement"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="e.g., Credit score must be 650 or higher"
            rows={3}
          />
          <p className="text-[12px] text-[var(--muted-foreground)]/60">
            Describe what the input must satisfy. This is the core of the rule.
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="rule-notes">
            Notes <span className="text-[var(--muted-foreground)]/50 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="rule-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional context or explanation"
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : rule?.id ? 'Save changes' : 'Add rule'}
        </Button>
      </DialogFooter>
    </>
  );
}
