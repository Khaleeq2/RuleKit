'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  Trash2,
  GripVertical,
  FileJson,
  Save,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { schemasRepo } from '@/app/lib/decisions';
import { Schema, SchemaField, FieldType, FIELD_TYPE_LABELS } from '@/app/lib/types';
import { toast } from 'sonner';

// ============================================
// Schema Tab
// ============================================

export default function SchemaPage() {
  const params = useParams();
  const decisionId = params.id as string;

  const [schema, setSchema] = useState<Schema | null>(null);
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jsonImportOpen, setJsonImportOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // Load schema
  useEffect(() => {
    const loadSchema = async () => {
      try {
        const schemaData = await schemasRepo.getByDecisionId(decisionId);
        setSchema(schemaData);
        setFields(schemaData?.fields || []);
      } catch (error) {
        console.error('Failed to load schema:', error);
        toast.error('Failed to load schema');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchema();
  }, [decisionId]);

  const handleAddField = () => {
    const newField: SchemaField = {
      id: `field-${Date.now()}`,
      name: '',
      type: 'string',
      required: true,
      description: '',
      example: '',
    };
    setFields([...fields, newField]);
    setHasChanges(true);
  };

  const handleUpdateField = (id: string, updates: Partial<SchemaField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    setHasChanges(true);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validate fields
    const emptyNames = fields.filter(f => !f.name.trim());
    if (emptyNames.length > 0) {
      toast.error('All fields must have a name');
      return;
    }

    const duplicateNames = fields.filter((f, i) => 
      fields.findIndex(ff => ff.name === f.name) !== i
    );
    if (duplicateNames.length > 0) {
      toast.error('Field names must be unique');
      return;
    }

    setIsSaving(true);

    try {
      await schemasRepo.update(decisionId, { fields });
      setHasChanges(false);
      toast.success('Schema saved');
    } catch (error) {
      console.error('Failed to save schema:', error);
      toast.error('Failed to save schema');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportJson = async () => {
    try {
      const json = JSON.parse(jsonInput);
      const inferredFields = await schemasRepo.inferFromJson(json);
      setFields([...fields, ...inferredFields]);
      setHasChanges(true);
      setJsonImportOpen(false);
      setJsonInput('');
      toast.success(`Imported ${inferredFields.length} fields`);
    } catch (error) {
      toast.error('Invalid JSON');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[var(--muted)] animate-pulse" />
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
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Input Schema</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Define the data structure your decision expects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={jsonImportOpen} onOpenChange={setJsonImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileJson className="w-4 h-4 mr-2" />
                Import from JSON
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import from JSON</DialogTitle>
                <DialogDescription>
                  Paste a sample JSON object and we'll infer the schema fields
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"field_name": "example_value", ...}'
                rows={8}
                className="font-mono text-sm"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setJsonImportOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImportJson}>Import fields</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          )}
        </div>
      </div>

      {/* Unsaved changes warning */}
      {hasChanges && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20 mb-6">
          <AlertCircle className="w-4 h-4 text-[var(--warning)]" />
          <span className="text-sm text-[var(--warning)]">You have unsaved changes</span>
        </div>
      )}

      {/* Fields */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Input fields</CardTitle>
            <span className="text-sm text-[var(--muted-foreground)]">
              {fields.length} field{fields.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--muted-foreground)] mb-4">
                No fields defined yet
              </p>
              <Button onClick={handleAddField}>
                <Plus className="w-4 h-4 mr-2" />
                Add first field
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header row */}
              <div className="grid grid-cols-[auto_1fr_120px_80px_1fr_1fr_auto] gap-3 px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                <div className="w-6" />
                <div>Name</div>
                <div>Type</div>
                <div>Required</div>
                <div>Description</div>
                <div>Example</div>
                <div className="w-8" />
              </div>

              {/* Field rows */}
              {fields.map((field, index) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  onUpdate={(updates) => handleUpdateField(field.id, updates)}
                  onRemove={() => handleRemoveField(field.id)}
                />
              ))}

              {/* Add field button */}
              <Button variant="outline" onClick={handleAddField} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add field
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Schema */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Output schema</CardTitle>
          <CardDescription>
            The structure returned when this decision runs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-[var(--muted)] font-mono text-sm">
            <pre className="text-[var(--foreground)]">{`{
  "decision": "pass" | "fail",
  "reason": string,
  "metadata": object (optional)
}`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Field Row Component
// ============================================

function FieldRow({
  field,
  onUpdate,
  onRemove,
}: {
  field: SchemaField;
  onUpdate: (updates: Partial<SchemaField>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_120px_80px_1fr_1fr_auto] gap-3 items-center p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <div className="cursor-grab text-[var(--muted-foreground)]">
        <GripVertical className="w-4 h-4" />
      </div>

      <Input
        value={field.name}
        onChange={(e) => onUpdate({ name: e.target.value.replace(/\s/g, '_').toLowerCase() })}
        placeholder="field_name"
        className="font-mono text-sm h-9"
      />

      <Select value={field.type} onValueChange={(v) => onUpdate({ type: v as FieldType })}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(FIELD_TYPE_LABELS) as [FieldType, string][]).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex justify-center">
        <Switch
          checked={field.required}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>

      <Input
        value={field.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Description"
        className="text-sm h-9"
      />

      <Input
        value={field.example}
        onChange={(e) => onUpdate({ example: e.target.value })}
        placeholder="Example value"
        className="text-sm h-9"
      />

      <Button variant="ghost" size="icon" onClick={onRemove} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
