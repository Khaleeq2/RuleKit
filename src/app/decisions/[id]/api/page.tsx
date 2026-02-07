'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Copy,
  Check,
  Code,
  Terminal,
  FileCode,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { decisionsRepo, schemasRepo } from '@/app/lib/decisions';
import { Decision, Schema, Environment, ENVIRONMENTS } from '@/app/lib/types';
import { toast } from 'sonner';

// ============================================
// API Tab
// ============================================

export default function ApiPage() {
  const params = useParams();
  const decisionId = params.id as string;

  const [decision, setDecision] = useState<Decision | null>(null);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [selectedEnv, setSelectedEnv] = useState<Environment>('draft');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Load decision and schema
  useEffect(() => {
    const loadData = async () => {
      const [decisionData, schemaData] = await Promise.all([
        decisionsRepo.getById(decisionId),
        schemasRepo.getByDecisionId(decisionId),
      ]);
      setDecision(decisionData);
      setSchema(schemaData);
    };

    loadData();
  }, [decisionId]);

  const handleCopy = async (text: string, snippetId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSnippet(snippetId);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const baseUrl = 'https://api.rulekit.io';
  const endpoint = `/v1/decisions/${decisionId}/run`;
  const fullUrl = `${baseUrl}${endpoint}`;

  // Generate sample input from schema
  const sampleInput: Record<string, unknown> = {};
  schema?.fields.forEach((field) => {
    if (field.type === 'number') {
      sampleInput[field.name] = parseFloat(field.example) || 0;
    } else if (field.type === 'boolean') {
      sampleInput[field.name] = field.example === 'true';
    } else {
      sampleInput[field.name] = field.example || '';
    }
  });

  // Code snippets
  const snippets = {
    curl: `curl -X POST "${fullUrl}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "X-Environment: ${selectedEnv}" \\
  -d '${JSON.stringify(sampleInput, null, 2)}'`,

    javascript: `const response = await fetch("${fullUrl}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
    "X-Environment": "${selectedEnv}"
  },
  body: JSON.stringify(${JSON.stringify(sampleInput, null, 4).split('\n').join('\n    ')})
});

const result = await response.json();
console.log(result);
// { decision: "pass" | "fail", reason: string }`,

    python: `import requests

response = requests.post(
    "${fullUrl}",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
        "X-Environment": "${selectedEnv}"
    },
    json=${JSON.stringify(sampleInput, null, 4).split('\n').join('\n    ')}
)

result = response.json()
print(result)
# {"decision": "pass" | "fail", "reason": "..."}`,

    node: `const axios = require('axios');

const response = await axios.post(
  "${fullUrl}",
  ${JSON.stringify(sampleInput, null, 4).split('\n').join('\n  ')},
  {
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json",
      "X-Environment": "${selectedEnv}"
    }
  }
);

console.log(response.data);
// { decision: "pass" | "fail", reason: "..." }`,
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-medium text-[var(--foreground)] tracking-[-0.01em]">API</h2>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
            Integrate this decision into your application
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedEnv} onValueChange={(v) => setSelectedEnv(v as Environment)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENVIRONMENTS.map((env) => (
                <SelectItem key={env} value={env} className="capitalize">
                  {env === 'draft' ? 'Draft' : 'Live'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" asChild>
            <Link href="/integrations">
              Manage API keys
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Start — copy-pastable cURL front and center */}
      <Card className="mb-6 bg-gradient-to-br from-[var(--brand)]/6 to-transparent border-[var(--brand)]/15">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Quick Start
              </CardTitle>
              <CardDescription className="mt-1">Copy and run this in your terminal</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(snippets.curl, 'quickstart')}
            >
              {copiedSnippet === 'quickstart' ? (
                <><Check className="w-3.5 h-3.5 text-[var(--success)]" />Copied</>
              ) : (
                <><Copy className="w-3.5 h-3.5" />Copy command</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs font-mono overflow-auto max-h-48 leading-relaxed">
            {snippets.curl}
          </pre>
          <div className="flex items-center gap-3 mt-3">
            <Badge className="bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 font-mono text-[10px]">
              POST
            </Badge>
            <code className="text-xs font-mono text-[var(--muted-foreground)]">
              {fullUrl}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Request/Response */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Request */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Request Body</CardTitle>
            <CardDescription>
              JSON payload matching your input schema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative group/code">
              <pre className="p-4 rounded-lg bg-[var(--muted)] text-sm font-mono overflow-auto max-h-64">
                {JSON.stringify(sampleInput, null, 2)}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity"
                onClick={() => handleCopy(JSON.stringify(sampleInput, null, 2), 'request')}
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

        {/* Response */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Response</CardTitle>
            <CardDescription>
              Decision result with reason
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="p-4 rounded-lg bg-[var(--muted)] text-sm font-mono overflow-auto max-h-64">
{`{
  "decision": "pass" | "fail",
  "reason": "string",
  "metadata": {
    "version": number,
    "environment": "${selectedEnv}",
    "latency_ms": number,
    "credits_used": number
  }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Snippets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Code Examples</CardTitle>
          <CardDescription>
            Copy-paste snippets for your language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl">
            <TabsList className="mb-4">
              <TabsTrigger value="curl" className="gap-2">
                <Terminal className="w-4 h-4" />
                cURL
              </TabsTrigger>
              <TabsTrigger value="javascript" className="gap-2">
                <FileCode className="w-4 h-4" />
                JavaScript
              </TabsTrigger>
              <TabsTrigger value="python" className="gap-2">
                <Code className="w-4 h-4" />
                Python
              </TabsTrigger>
              <TabsTrigger value="node" className="gap-2">
                <Code className="w-4 h-4" />
                Node.js
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

      {/* Headers */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Required Headers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]">
              <div>
                <code className="font-mono text-sm font-medium">Authorization</code>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Bearer token with your API key
                </p>
              </div>
              <Badge variant="destructive" className="text-xs">Required</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]">
              <div>
                <code className="font-mono text-sm font-medium">Content-Type</code>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  application/json
                </p>
              </div>
              <Badge variant="destructive" className="text-xs">Required</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]">
              <div>
                <code className="font-mono text-sm font-medium">X-Environment</code>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Target environment (draft, live)
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">Optional</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Error Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ErrorCodeRow code="400" description="Invalid request body or missing required fields" />
            <ErrorCodeRow code="401" description="Invalid or missing API key" />
            <ErrorCodeRow code="403" description="API key not authorized for this environment" />
            <ErrorCodeRow code="404" description="Decision not found or not deployed" />
            <ErrorCodeRow code="429" description="Rate limit exceeded" />
            <ErrorCodeRow code="500" description="Internal server error" />
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
