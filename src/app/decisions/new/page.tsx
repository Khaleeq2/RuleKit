'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Shield,
  CheckCircle,
  Route,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { decisionsRepo } from '@/app/lib/decisions';
import { DecisionTemplate, TemplateCategory } from '@/app/lib/types';
import { toast } from 'sonner';

// ============================================
// Templates
// ============================================

const TEMPLATES: DecisionTemplate[] = [
  {
    id: 'loan-eligibility',
    name: 'Loan Eligibility',
    description: 'Determine if an applicant qualifies for a loan based on credit score, income, and employment.',
    category: 'eligibility',
    schema: {
      fields: [
        { id: '1', name: 'credit_score', type: 'number', required: true, description: 'Applicant credit score', example: '720' },
        { id: '2', name: 'annual_income', type: 'number', required: true, description: 'Annual income in USD', example: '75000' },
        { id: '3', name: 'employment_status', type: 'enum', required: true, description: 'Employment status', example: 'employed', enumValues: ['employed', 'self_employed', 'unemployed', 'retired'] },
        { id: '4', name: 'loan_amount', type: 'number', required: true, description: 'Requested loan amount', example: '25000' },
      ],
      outputType: 'pass_fail',
    },
    rules: [
      { name: 'Credit Score Check', description: 'Minimum credit score requirement', order: 1, condition: { type: 'simple', field: 'credit_score', operator: 'lt', value: 650 }, result: 'fail', reason: 'Credit score below minimum threshold', enabled: true },
      { name: 'Default Pass', description: 'Approve if all checks pass', order: 2, condition: { type: 'simple', field: 'credit_score', operator: 'gte', value: 0 }, result: 'pass', reason: 'Application approved', enabled: true },
    ],
    tests: [
      { name: 'High credit approved', description: 'Good applicant should pass', inputJson: { credit_score: 750, annual_income: 80000, employment_status: 'employed', loan_amount: 20000 }, expectedDecision: 'pass' },
      { name: 'Low credit rejected', description: 'Poor credit should fail', inputJson: { credit_score: 580, annual_income: 60000, employment_status: 'employed', loan_amount: 15000 }, expectedDecision: 'fail' },
    ],
  },
  {
    id: 'fraud-detection',
    name: 'Fraud Detection',
    description: 'Flag potentially fraudulent transactions based on amount, location, and patterns.',
    category: 'fraud',
    schema: {
      fields: [
        { id: '1', name: 'amount', type: 'number', required: true, description: 'Transaction amount', example: '500' },
        { id: '2', name: 'country', type: 'string', required: true, description: 'Transaction country', example: 'US' },
        { id: '3', name: 'is_card_present', type: 'boolean', required: true, description: 'Card physically present', example: 'true' },
      ],
      outputType: 'pass_fail',
    },
    rules: [
      { name: 'High Amount', description: 'Flag large transactions', order: 1, condition: { type: 'simple', field: 'amount', operator: 'gt', value: 5000 }, result: 'fail', reason: 'Transaction exceeds threshold', enabled: true },
      { name: 'Default Approve', description: 'Approve normal transactions', order: 2, condition: { type: 'simple', field: 'amount', operator: 'gte', value: 0 }, result: 'pass', reason: 'Transaction approved', enabled: true },
    ],
    tests: [],
  },
  {
    id: 'approval-workflow',
    name: 'Approval Workflow',
    description: 'Route approval requests based on amount and department.',
    category: 'approval',
    schema: {
      fields: [
        { id: '1', name: 'amount', type: 'number', required: true, description: 'Request amount', example: '1000' },
        { id: '2', name: 'department', type: 'string', required: true, description: 'Department name', example: 'Engineering' },
        { id: '3', name: 'urgency', type: 'enum', required: true, description: 'Request urgency', example: 'normal', enumValues: ['low', 'normal', 'high', 'urgent'] },
      ],
      outputType: 'pass_fail',
    },
    rules: [],
    tests: [],
  },
  {
    id: 'content-moderation',
    name: 'Content Moderation',
    description: 'Check content against review and safety rules.',
    category: 'review',
    schema: {
      fields: [
        { id: '1', name: 'content_type', type: 'enum', required: true, description: 'Type of content', example: 'text', enumValues: ['text', 'image', 'video'] },
        { id: '2', name: 'contains_pii', type: 'boolean', required: true, description: 'Contains personal info', example: 'false' },
      ],
      outputType: 'pass_fail',
    },
    rules: [],
    tests: [],
  },
];

const CATEGORY_ICONS: Record<TemplateCategory, React.ComponentType<{ className?: string }>> = {
  eligibility: CheckCircle,
  fraud: Shield,
  approval: Scale,
  review: FileText,
  routing: Route,
  custom: Sparkles,
};

// ============================================
// New Decision Page
// ============================================

export default function NewDecisionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showTemplates = searchParams.get('templates') === 'true';
  const initialName = searchParams.get('name') || '';

  const [step, setStep] = useState<'choose' | 'details'>(showTemplates ? 'choose' : 'details');
  const [selectedTemplate, setSelectedTemplate] = useState<DecisionTemplate | null>(null);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState('');
  const [outputType, setOutputType] = useState<'pass_fail' | 'custom'>('pass_fail');
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectTemplate = (template: DecisionTemplate) => {
    setSelectedTemplate(template);
    setName(template.name);
    setDescription(template.description);
    setStep('details');
  };

  const handleStartBlank = () => {
    setSelectedTemplate(null);
    setStep('details');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a decision name');
      return;
    }

    setIsCreating(true);

    try {
      const decision = await decisionsRepo.create({
        name: name.trim(),
        description: description.trim(),
        status: 'draft',
        createdBy: 'user-1',
      });

      // If using a template, we would also create schema, rules, and tests here
      // For now, just redirect to the decision studio

      toast.success('Decision created');
      router.push(`/decisions/${decision.id}`);
    } catch (error) {
      console.error('Failed to create decision:', error);
      toast.error('Failed to create decision');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-full">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/decisions">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
              {step === 'choose' ? 'Choose a starting point' : 'Create new decision'}
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              {step === 'choose'
                ? 'Start from a template or create from scratch'
                : 'Define your decision and its output type'}
            </p>
          </div>
        </div>

        {step === 'choose' ? (
          <div className="space-y-8">
            {/* Start Blank */}
            <Card
              className="cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--primary)]/50 transition-all"
              onClick={handleStartBlank}
            >
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[var(--muted-foreground)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--foreground)]">Start from scratch</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Create a blank decision and define everything yourself
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Start from a template
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATES.map((template) => {
                  const Icon = CATEGORY_ICONS[template.category] || Sparkles;
                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--primary)]/50 transition-all"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardContent className="py-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-[var(--primary)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-[var(--foreground)] mb-1">
                              {template.name}
                            </h3>
                            <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Back to templates */}
            {showTemplates && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('choose')}
                className="text-[var(--muted-foreground)]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to templates
              </Button>
            )}

            {/* Selected template indicator */}
            {selectedTemplate && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/20">
                <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-sm text-[var(--foreground)]">
                  Starting from <strong>{selectedTemplate.name}</strong> template
                </span>
              </div>
            )}

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Decision details</CardTitle>
                <CardDescription>
                  Give your decision a clear name and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Decision name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Loan Eligibility Check"
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this decision do?"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Output type</Label>
                  <RadioGroup value={outputType} onValueChange={(v) => setOutputType(v as any)}>
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="pass_fail" id="pass_fail" className="mt-0.5" />
                      <Label htmlFor="pass_fail" className="cursor-pointer flex-1">
                        <span className="font-medium">Pass / Fail</span>
                        <p className="text-sm text-[var(--muted-foreground)] font-normal mt-0.5">
                          Returns a binary decision with a reason message
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors cursor-pointer opacity-50">
                      <RadioGroupItem value="custom" id="custom" className="mt-0.5" disabled />
                      <Label htmlFor="custom" className="cursor-pointer flex-1">
                        <span className="font-medium">Custom output</span>
                        <p className="text-sm text-[var(--muted-foreground)] font-normal mt-0.5">
                          Define your own output structure (coming soon)
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/decisions">Cancel</Link>
              </Button>
              <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
                {isCreating ? 'Creating...' : 'Create decision'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
