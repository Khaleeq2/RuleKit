'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  Play,
  Trash2,
  Pencil,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
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
import { testsRepo } from '@/app/lib/tests';
import { schemasRepo } from '@/app/lib/rulebooks';
import { Test, TestResult, SchemaField, RuleResult } from '@/app/lib/types';
import { formatRelativeTime } from '@/app/lib/time-utils';
import { toast } from 'sonner';

// ============================================
// Tests Tab
// ============================================

export default function TestsPage() {
  const params = useParams();
  const rulebookId = params.id as string;

  const [tests, setTests] = useState<Test[]>([]);
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Load tests and schema
  useEffect(() => {
    const loadData = async () => {
      try {
        const [testsData, schemaData] = await Promise.all([
          testsRepo.listByRulebookId(rulebookId),
          schemasRepo.getByRulebookId(rulebookId),
        ]);
        setTests(testsData);
        setSchemaFields(schemaData?.fields || []);
      } catch (error) {
        console.error('Failed to load tests:', error);
        toast.error('Failed to load tests');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [rulebookId]);

  const handleAddTest = () => {
    const defaultInput: Record<string, unknown> = {};
    schemaFields.forEach((field) => {
      defaultInput[field.name] = field.example || '';
    });

    const newTest: Partial<Test> = {
      rulebookId,
      name: '',
      description: '',
      inputJson: defaultInput,
      expectedVerdict: 'pass',
      expectedReason: '',
    };
    setEditingTest(newTest as Test);
    setIsEditorOpen(true);
  };

  const handleEditTest = (test: Test) => {
    setEditingTest({ ...test });
    setIsEditorOpen(true);
  };

  const handleCloneTest = (test: Test) => {
    const clone: Partial<Test> = {
      rulebookId,
      name: `${test.name} (copy)`,
      description: test.description,
      inputJson: { ...test.inputJson },
      expectedVerdict: test.expectedVerdict,
      expectedReason: test.expectedReason,
    };
    setEditingTest(clone as Test);
    setIsEditorOpen(true);
  };

  const handleSaveTest = async (test: Partial<Test>) => {
    try {
      if (test.id) {
        const updated = await testsRepo.update(test.id, test);
        setTests(tests.map(t => t.id === test.id ? updated : t));
        toast.success('Test updated');
      } else {
        const newTest = await testsRepo.create(test as Omit<Test, 'id' | 'createdAt' | 'updatedAt' | 'lastResult'>);
        setTests([...tests, newTest]);
        toast.success('Test created');
      }
      setIsEditorOpen(false);
      setEditingTest(null);
    } catch (error) {
      console.error('Failed to save test:', error);
      toast.error('Failed to save test');
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      await testsRepo.remove(id);
      setTests(tests.filter(t => t.id !== id));
      toast.success('Test deleted');
    } catch (error) {
      console.error('Failed to delete test:', error);
      toast.error('Failed to delete test');
    }
  };

  const handleRunTest = async (id: string) => {
    try {
      const result = await testsRepo.runTest(id);
      const updatedTest = tests.find(t => t.id === id);
      if (updatedTest) {
        setTests(tests.map(t => t.id === id ? { ...t, lastResult: result } : t));
      }
      toast.success(result.passed ? 'Test passed' : 'Test failed');
    } catch (error) {
      console.error('Failed to run test:', error);
      toast.error('Failed to run test');
    }
  };

  const handleRunAllTests = async () => {
    setIsRunningAll(true);
    try {
      const { passed, failed, results } = await testsRepo.runSuite(rulebookId);
      
      // Update tests with results
      const updatedTests = await testsRepo.listByRulebookId(rulebookId);
      setTests(updatedTests);
      
      toast.success(`Test suite complete: ${passed} passed, ${failed} failed`);
    } catch (error) {
      console.error('Failed to run test suite:', error);
      toast.error('Failed to run test suite');
    } finally {
      setIsRunningAll(false);
    }
  };

  // Calculate stats
  const stats = {
    total: tests.length,
    passing: tests.filter(t => t.lastResult?.passed).length,
    failing: tests.filter(t => t.lastResult && !t.lastResult.passed).length,
    noResult: tests.filter(t => !t.lastResult).length,
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--muted)] animate-pulse" />
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
          <h2 className="text-[16px] font-medium text-[var(--foreground)] tracking-[-0.01em]">Tests</h2>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
            Verify your rulebook logic with test cases
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tests.length > 0 && (
            <Button variant="outline" onClick={handleRunAllTests} disabled={isRunningAll}>
              {isRunningAll ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Running {tests.length} tests…
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run all tests
                </>
              )}
            </Button>
          )}
          <Button onClick={handleAddTest}>
            <Plus className="w-4 h-4" />
            Add test
          </Button>
        </div>
      </div>

      {/* Stats */}
      {tests.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Passing" value={stats.passing} variant="success" />
          <StatCard label="Failing" value={stats.failing} variant="error" />
          <StatCard label="Not run" value={stats.noResult} variant="muted" />
        </div>
      )}

      {/* Tests list */}
      {tests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-[var(--muted-foreground)] mb-4">
              No test cases yet. Add tests to verify your rulebook logic.
            </p>
            <Button onClick={handleAddTest}>
              <Plus className="w-4 h-4" />
              Add first test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onEdit={() => handleEditTest(test)}
              onDelete={() => handleDeleteTest(test.id)}
              onRun={() => handleRunTest(test.id)}
              onClone={() => handleCloneTest(test)}
            />
          ))}
        </div>
      )}

      {/* Test Editor Sheet */}
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <TestEditor
            test={editingTest}
            schemaFields={schemaFields}
            onSave={handleSaveTest}
            onCancel={() => {
              setIsEditorOpen(false);
              setEditingTest(null);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ============================================
// Stat Card
// ============================================

function StatCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number;
  variant?: 'default' | 'success' | 'error' | 'muted';
}) {
  const colorClass = {
    default: 'text-[var(--foreground)]',
    success: 'text-[var(--success)]',
    error: 'text-[var(--destructive)]',
    muted: 'text-[var(--muted-foreground)]',
  }[variant];

  return (
    <Card>
      <CardContent className="py-4 text-center">
        <p className={`text-2xl font-semibold ${colorClass}`}>{value}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      </CardContent>
    </Card>
  );
}

// ============================================
// Test Card Component
// ============================================

function TestCard({
  test,
  onEdit,
  onDelete,
  onRun,
  onClone,
}: {
  test: Test;
  onEdit: () => void;
  onDelete: () => void;
  onRun: () => void;
  onClone: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    await onRun();
    setIsRunning(false);
  };

  const getStatusIcon = () => {
    if (!test.lastResult) {
      return <Clock className="w-5 h-5 text-[var(--muted-foreground)]" />;
    }
    if (test.lastResult.passed) {
      return <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />;
    }
    return <XCircle className="w-5 h-5 text-[var(--destructive)]" />;
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            {/* Status icon */}
            {getStatusIcon()}

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-[var(--foreground)] truncate">
                  {test.name || 'Untitled test'}
                </h3>
                <Badge variant="outline" className="text-xs">
                  Expects: {test.expectedVerdict}
                </Badge>
              </div>
              {test.description && (
                <p className="text-sm text-[var(--muted-foreground)] truncate">
                  {test.description}
                </p>
              )}
              {test.lastResult ? (
                <p className="text-xs mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[var(--muted-foreground)]">Expected: <strong>{test.expectedVerdict}</strong></span>
                  <span className="text-[var(--muted-foreground)]">·</span>
                  <span className="text-[var(--muted-foreground)]">Got: <strong>{test.lastResult.actualVerdict}</strong></span>
                  {test.lastResult.passed ? (
                    <CheckCircle2 className="w-3 h-3 text-[var(--success)] inline" />
                  ) : (
                    <XCircle className="w-3 h-3 text-[var(--destructive)] inline" />
                  )}
                  {test.lastResult.latencyMs && (
                    <>
                      <span className="text-[var(--muted-foreground)]">·</span>
                      <span className="text-[var(--muted-foreground)]">{test.lastResult.latencyMs}ms</span>
                    </>
                  )}
                  <span className="text-[var(--muted-foreground)]">·</span>
                  <span className="text-[var(--muted-foreground)]">{formatRelativeTime(test.lastResult.runAt).relative}</span>
                </p>
              ) : (
                <p className="text-xs text-[var(--muted-foreground)]/50 mt-1">Not yet run</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning}>
                <Play className="w-4 h-4" />
                {isRunning ? 'Running...' : 'Run'}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClone} title="Clone test">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onEdit} title="Edit test">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete} title="Delete test" className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]">
                <Trash2 className="w-4 h-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? 'Hide details' : 'Show details'}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-4">
              {/* Input */}
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2">Input</p>
                <pre className="p-3 rounded-lg bg-[var(--muted)] text-xs font-mono overflow-auto max-h-40">
                  {JSON.stringify(test.inputJson, null, 2)}
                </pre>
              </div>

              {/* Result */}
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2">
                  {test.lastResult ? 'Actual Result' : 'Expected Result'}
                </p>
                {test.lastResult ? (
                  <div className="p-3 rounded-lg bg-[var(--muted)] text-xs font-mono">
                    <p><strong>Verdict:</strong> {test.lastResult.actualVerdict}</p>
                    <p><strong>Reason:</strong> {test.lastResult.actualReason}</p>
                    {test.lastResult.firedRuleName && (
                      <p><strong>Fired rule:</strong> {test.lastResult.firedRuleName}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[var(--muted)] text-xs font-mono">
                    <p><strong>Verdict:</strong> {test.expectedVerdict}</p>
                    {test.expectedReason && <p><strong>Reason:</strong> {test.expectedReason}</p>}
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

// ============================================
// Test Editor Component
// ============================================

function TestEditor({
  test,
  schemaFields,
  onSave,
  onCancel,
}: {
  test: Test | null;
  schemaFields: SchemaField[];
  onSave: (test: Partial<Test>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(test?.name || '');
  const [description, setDescription] = useState(test?.description || '');
  const [inputJson, setInputJson] = useState(
    JSON.stringify(test?.inputJson || {}, null, 2)
  );
  const [expectedVerdict, setExpectedVerdict] = useState<RuleResult>(
    test?.expectedVerdict || 'pass'
  );
  const [expectedReason, setExpectedReason] = useState(test?.expectedReason || '');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputJsonChange = (value: string) => {
    setInputJson(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e) {
      setJsonError('Invalid JSON');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a test name');
      return;
    }

    let parsedInput: Record<string, unknown>;
    try {
      parsedInput = JSON.parse(inputJson);
    } catch (e) {
      toast.error('Invalid JSON in input');
      return;
    }

    setIsSaving(true);

    const updatedTest: Partial<Test> = {
      ...test,
      name,
      description,
      inputJson: parsedInput,
      expectedVerdict,
      expectedReason,
    };

    await onSave(updatedTest);
    setIsSaving(false);
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>{test?.id ? 'Edit test' : 'Add test'}</SheetTitle>
        <SheetDescription>
          Define the input and expected output for this test case
        </SheetDescription>
      </SheetHeader>

      <div className="py-6 space-y-6">
        {/* Test name */}
        <div className="space-y-2">
          <Label htmlFor="name">Test name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., High credit score approved"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this test verify?"
          />
        </div>

        {/* Input JSON */}
        <div className="space-y-2">
          <Label htmlFor="inputJson">Input JSON</Label>
          <Textarea
            id="inputJson"
            value={inputJson}
            onChange={(e) => handleInputJsonChange(e.target.value)}
            className="font-mono text-sm min-h-[200px]"
            placeholder="{}"
          />
          {jsonError && (
            <p className="text-xs text-[var(--destructive)] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {jsonError}
            </p>
          )}
          {schemaFields.length > 0 && (
            <p className="text-xs text-[var(--muted-foreground)]">
              Expected fields: {schemaFields.map(f => f.name).join(', ')}
            </p>
          )}
        </div>

        {/* Expected verdict */}
        <div className="space-y-2">
          <Label>Expected verdict</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={expectedVerdict === 'pass' ? 'default' : 'outline'}
              className={expectedVerdict === 'pass' ? 'bg-[var(--success)] hover:bg-[var(--success)]/90' : ''}
              onClick={() => setExpectedVerdict('pass')}
            >
              <CheckCircle2 className="w-4 h-4" />
              Pass
            </Button>
            <Button
              variant={expectedVerdict === 'fail' ? 'default' : 'outline'}
              className={expectedVerdict === 'fail' ? 'bg-[var(--destructive)] hover:bg-[var(--destructive)]/90' : ''}
              onClick={() => setExpectedVerdict('fail')}
            >
              <XCircle className="w-4 h-4" />
              Fail
            </Button>
          </div>
        </div>

        {/* Expected reason */}
        <div className="space-y-2">
          <Label htmlFor="expectedReason">Expected reason (optional)</Label>
          <Input
            id="expectedReason"
            value={expectedReason}
            onChange={(e) => setExpectedReason(e.target.value)}
            placeholder="Expected reason message"
          />
        </div>
      </div>

      <SheetFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving || !!jsonError}>
          {isSaving ? 'Saving...' : 'Save test'}
        </Button>
      </SheetFooter>
    </>
  );
}
