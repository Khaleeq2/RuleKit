'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Copy,
  Check,
  Code,
  Terminal,
  FileCode,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { rulebooksRepo, rulesRepo, schemasRepo } from '@/app/lib/rulebooks';
import { Rulebook, Rule, Schema } from '@/app/lib/types';
import { toast } from 'sonner';

// ============================================
// API Tab
// ============================================

export default function ApiPage() {
  const params = useParams();
  const rulebookId = params.id as string;

  const [rulebook, setRulebook] = useState<Rulebook | null>(null);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Load rulebook, schema, and rules
  useEffect(() => {
    const loadData = async () => {
      const [rulebookData, schemaData, rulesData] = await Promise.all([
        rulebooksRepo.getById(rulebookId),
        schemasRepo.getByRulebookId(rulebookId),
        rulesRepo.listByRulebookId(rulebookId),
      ]);

      setRulebook(rulebookData);
      setSchema(schemaData);
      setRules(rulesData);
    };

    loadData();
  }, [rulebookId]);

  const handleCopy = async (text: string, snippetId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSnippet(snippetId);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';
  const endpoint = '/api/evaluate';
  const fullUrl = `${baseUrl}${endpoint}`;

  const sampleInputObject = useMemo<Record<string, unknown>>(() => {
    const parsed: Record<string, unknown> = {};

    schema?.fields.forEach((field) => {
      if (field.type === 'number') {
        parsed[field.name] = Number(field.example) || 0;
      } else if (field.type === 'boolean') {
        parsed[field.name] = field.example === 'true';
      } else {
        parsed[field.name] = field.example || '';
      }
    });

    return parsed;
  }, [schema]);

  const sampleInputText = useMemo(() => {
    if (Object.keys(sampleInputObject).length > 0) {
      return JSON.stringify(sampleInputObject, null, 2);
    }

    return 'Applicant: age 28, annual income 85000, credit score 740';
  }, [sampleInputObject]);

  const enabledRules = useMemo(() => {
    const mapped = rules
      .filter((rule) => rule.enabled)
      .map((rule) => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        reason: rule.reason,
      }));

    if (mapped.length > 0) return mapped;

    return [
      {
        id: 'rule_min_credit_score',
        name: 'Minimum credit score',
        description: 'Fail if credit score is below 650.',
        reason: 'Credit score is below the required threshold.',
      },
    ];
  }, [rules]);

  const requestPayload = useMemo(
    () => ({
      input: sampleInputText,
      rulebook_id: rulebookId,
      rulebook_name: rulebook?.name || 'Sample Rulebook',
      rules: enabledRules,
      output_type: schema?.outputType || 'pass_fail',
    }),
    [enabledRules, rulebook?.name, rulebookId, sampleInputText, schema?.outputType]
  );

  // Code snippets
  const snippets = {
    javascript: `// Works from your signed-in browser app (cookies are sent automatically)
const payload = ${JSON.stringify(requestPayload, null, 2)};

const response = await fetch("${endpoint}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(payload),
});

const data = await response.json();
if (!data.success) {
  console.error("Evaluation failed:", data.error);
} else {
  console.log("Verdict:", data.result.verdict);
  console.log("Reason:", data.result.reason);
}`,

    curl: `# Requires a valid signed-in Supabase session cookie
curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -b "sb-<project-id>-auth-token=..." \\
  -d '${JSON.stringify(requestPayload, null, 2)}'`,

    python: `import requests

payload = ${JSON.stringify(requestPayload, null, 4)}

# Requires a valid signed-in Supabase session cookie
res = requests.post(
    "${fullUrl}",
    headers={"Content-Type": "application/json"},
    cookies={"sb-<project-id>-auth-token": "..."},
    json=payload,
)

print(res.status_code)
print(res.json())`,
  };

  const responseExample = `{
  "success": true,
  "result": {
    "id": "run_123",
    "rulebook_id": "${rulebookId}",
    "rulebook_name": "${rulebook?.name || 'Sample Rulebook'}",
    "input": "...",
    "verdict": "pass",
    "reason": "All active rules passed.",
    "evaluations": [
      {
        "rule_id": "rule_min_credit_score",
        "rule_name": "Minimum credit score",
        "verdict": "pass",
        "confidence": 0.98,
        "reason": "Credit score meets the threshold.",
        "suggestion": null,
        "evidence_spans": [],
        "absence_proof": null
      }
    ],
    "model_meta": {
      "model": "...",
      "prompt_version": "...",
      "tokens_in": 0,
      "tokens_out": 0,
      "reasoning_effort": "..."
    },
    "latency_ms": 132,
    "timestamp": "2026-02-10T12:00:00.000Z"
  }
}`;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[16px] font-medium text-[var(--foreground)] tracking-[-0.01em]">API</h2>
        <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
          Evaluate input against this rulebook via <code className="font-mono">POST {endpoint}</code>
        </p>
      </div>

      {/* Auth notice */}
      <Card className="mb-6 border-amber-200/70 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-900/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 mt-0.5 text-amber-700 dark:text-amber-300" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Session-based authentication</p>
              <p className="text-sm text-amber-700/90 dark:text-amber-300/90">
                This endpoint accepts signed-in Supabase session cookies. Browser-side calls should use
                {' '}<code className="font-mono">credentials: &quot;include&quot;</code>. API key auth is not available yet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {rules.filter((rule) => rule.enabled).length === 0 && (
        <Card className="mb-6 border-amber-200/70 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-700 dark:text-amber-300" />
              <p className="text-sm text-amber-700/90 dark:text-amber-300/90">
                This rulebook currently has no enabled rules. The examples below include placeholder rules,
                but real requests require at least one enabled rule.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Start */}
      <Card className="mb-6 bg-gradient-to-br from-[var(--brand)]/6 to-transparent border-[var(--brand)]/15">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Quick Start (browser)
              </CardTitle>
              <CardDescription className="mt-1">Copy this to your signed-in browser app</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(snippets.javascript, 'quickstart')}
            >
              {copiedSnippet === 'quickstart' ? (
                <><Check className="w-3.5 h-3.5 text-[var(--success)]" />Copied</>
              ) : (
                <><Copy className="w-3.5 h-3.5" />Copy snippet</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs font-mono overflow-auto max-h-64 leading-relaxed">
            {snippets.javascript}
          </pre>
          <div className="flex items-center gap-3 mt-3">
            <Badge className="bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 font-mono text-[10px]">
              POST
            </Badge>
            <code className="text-xs font-mono text-[var(--muted-foreground)]">{fullUrl}</code>
          </div>
        </CardContent>
      </Card>

      {/* Request/Response */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Request Body</CardTitle>
            <CardDescription>
              Exact payload shape required by <code className="font-mono">/api/evaluate</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative group/code">
              <pre className="p-4 rounded-lg bg-[var(--muted)] text-sm font-mono overflow-auto max-h-80">
                {JSON.stringify(requestPayload, null, 2)}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity"
                onClick={() => handleCopy(JSON.stringify(requestPayload, null, 2), 'request')}
              >
                {copiedSnippet === 'request' ? (
                  <Check className="w-4 h-4 text-[var(--success)]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Response</CardTitle>
            <CardDescription>
              Successful response shape
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-lg bg-[var(--muted)] text-sm font-mono overflow-auto max-h-80">
              {responseExample}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Language snippets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Code Examples</CardTitle>
          <CardDescription>
            Use the same payload and auth model across languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript">
            <TabsList className="mb-4">
              <TabsTrigger value="javascript" className="gap-2">
                <FileCode className="w-4 h-4" />
                JavaScript
              </TabsTrigger>
              <TabsTrigger value="curl" className="gap-2">
                <Terminal className="w-4 h-4" />
                cURL
              </TabsTrigger>
              <TabsTrigger value="python" className="gap-2">
                <Code className="w-4 h-4" />
                Python
              </TabsTrigger>
            </TabsList>

            {Object.entries(snippets).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-[var(--muted)] text-sm font-mono overflow-auto">
                    {code}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(code, lang)}
                  >
                    {copiedSnippet === lang ? (
                      <>
                        <Check className="w-4 h-4 text-[var(--success)]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Error codes */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Error Codes</CardTitle>
          <CardDescription>Errors currently returned by this endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ErrorCodeRow code="400" description="Missing or invalid request fields" />
            <ErrorCodeRow code="401" description="Authentication required (no valid session cookie)" />
            <ErrorCodeRow code="422" description="Validation error from evaluation layer" />
            <ErrorCodeRow code="429" description="Rate limit exceeded" />
            <ErrorCodeRow code="502" description="Evaluation provider temporarily unavailable" />
            <ErrorCodeRow code="503" description="Server configuration error" />
            <ErrorCodeRow code="500" description="Unexpected server error" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorCodeRow({ code, description }: { code: string; description: string }) {
  return (
    <div className="flex items-center gap-4 p-2">
      <Badge variant="outline" className="font-mono">{code}</Badge>
      <span className="text-sm text-[var(--muted-foreground)]">{description}</span>
    </div>
  );
}
