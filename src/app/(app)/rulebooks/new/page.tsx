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
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { rulebooksRepo, schemasRepo } from '@/app/lib/rulebooks';
import { RulebookTemplate, TemplateCategory, OutputType, OUTPUT_TYPE_META } from '@/app/lib/types';
import { toast } from 'sonner';

// ============================================
// Templates
// ============================================

const TEMPLATES: RulebookTemplate[] = [
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
      { name: 'High credit approved', description: 'Good applicant should pass', inputJson: { credit_score: 750, annual_income: 80000, employment_status: 'employed', loan_amount: 20000 }, expectedVerdict: 'pass' },
      { name: 'Low credit rejected', description: 'Poor credit should fail', inputJson: { credit_score: 580, annual_income: 60000, employment_status: 'employed', loan_amount: 15000 }, expectedVerdict: 'fail' },
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
// New Rulebook Page
// ============================================

export default function NewRulebookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showTemplates = searchParams.get('templates') === 'true';
  const initialName = searchParams.get('name') || '';

  const [step, setStep] = useState<'choose' | 'details'>('choose');
  const [selectedTemplate, setSelectedTemplate] = useState<RulebookTemplate | null>(null);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState('');
  const [outputType, setOutputType] = useState<OutputType>('pass_fail');
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSelectTemplate = (template: RulebookTemplate) => {
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
      toast.error('Please enter a rulebook name');
      return;
    }

    setIsCreating(true);

    try {
      const rulebook = await rulebooksRepo.create({
        name: name.trim(),
        description: description.trim(),
        status: 'draft',
        createdBy: '',
      });

      // Update schema output type if not default
      if (outputType !== 'pass_fail') {
        try {
          await schemasRepo.update(rulebook.id, { outputType });
        } catch (e) {
          console.error('Failed to update output type:', e);
        }
      }

      toast.success('Rulebook created');
      router.push(`/rulebooks/${rulebook.id}`);
    } catch (error) {
      console.error('Failed to create rulebook:', error);
      const msg = error instanceof Error ? error.message : 'Failed to create rulebook';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-full">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-[13px] font-medium"
            onClick={() => {
              if (step === 'details') {
                setStep('choose');
                setSelectedTemplate(null);
                setName('');
                setDescription('');
                setOutputType('pass_fail');
              } else {
                router.push('/rulebooks');
              }
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'details' ? 'Back' : 'Rulebooks'}
          </Button>

          <div className="mt-3">
            <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-[-0.01em] leading-tight">
              {step === 'choose' ? 'Create a rulebook' : 'Rulebook details'}
            </h1>
            <p className="text-[13px] text-[var(--muted-foreground)] mt-1 leading-relaxed">
              {step === 'choose'
                ? 'Start from a template or create from scratch'
                : selectedTemplate
                  ? `Based on ${selectedTemplate.name} template`
                  : 'Define your rulebook and its output type'}
            </p>
          </div>
        </div>

        {step === 'choose' ? (
          <div className="space-y-8">
            {/* Start Blank */}
            <Card
              className="cursor-pointer surface-grain hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--brand)]/30 transition-all"
              onClick={handleStartBlank}
            >
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--brand)]/8 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[var(--brand)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--foreground)]">Start from scratch</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Create a blank rulebook and define everything yourself
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
                      className="cursor-pointer surface-grain hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--brand)]/30 transition-all"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardContent className="py-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[var(--brand)]/8 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-[var(--brand)]" />
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
            {/* Form */}
            <Card className="surface-grain">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Rulebook name</Label>
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
                    placeholder="What does this rulebook do?"
                    rows={3}
                  />
                </div>

                {/* Advanced settings — collapsed by default */}
                <div className="border-t border-[var(--border)]/60 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-[13px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    Advanced settings
                    {outputType !== 'pass_fail' && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--brand)]/10 text-[var(--brand)]">
                        {OUTPUT_TYPE_META[outputType].label}
                      </span>
                    )}
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 space-y-3">
                      <Label>Output type</Label>
                      <p className="text-[13px] text-[var(--muted-foreground)] -mt-1">
                        Most rulebooks use Pass / Fail. Change this only if you need more verdict levels.
                      </p>
                      <div className="space-y-2">
                        {(Object.keys(OUTPUT_TYPE_META) as OutputType[]).map((key) => {
                          const meta = OUTPUT_TYPE_META[key];
                          const isSelected = outputType === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setOutputType(key)}
                              className={`w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'border-[var(--brand)]/30 bg-[var(--brand)]/5 shadow-sm'
                                  : 'border-[var(--border)] hover:border-[var(--brand)]/20 hover:bg-[var(--muted)]/30'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'border-[var(--brand)] bg-[var(--brand)]' : 'border-[var(--border)]'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`font-medium ${isSelected ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]/80'}`}>
                                  {meta.label}
                                </span>
                                <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                                  {meta.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/rulebooks">Cancel</Link>
              </Button>
              <Button onClick={handleCreate} disabled={isCreating || !name.trim()} className="h-10 text-[14px] bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white">
                {isCreating ? 'Creating...' : 'Create rulebook'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
