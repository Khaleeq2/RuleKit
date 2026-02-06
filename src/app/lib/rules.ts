'use client';

type RuleSeverity = 'low' | 'medium' | 'high' | 'critical';

type RuleFileType =
  | 'document'
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'spreadsheet'
  | 'presentation';

type RuleOperator =
  | 'contains'
  | 'not_contains'
  | 'equals'
  | 'not_equals'
  | 'matches_regex'
  | 'greater_than'
  | 'less_than';

export const RULE_CATEGORIES = [
  'General',
  'Content Quality',
  'Content Review',
  'Brand Guidelines',
  'Technical Standards',
  'Safety',
  'Accessibility',
  'Legal',
] as const;

export const RULE_SEVERITIES: Array<{
  value: RuleSeverity;
  label: string;
  description: string;
  badgeClassName: string;
}> = [
  {
    value: 'low',
    label: 'Low',
    description: 'Minor issues',
    badgeClassName:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Should be addressed',
    badgeClassName:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  {
    value: 'high',
    label: 'High',
    description: 'Important issues',
    badgeClassName:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  },
  {
    value: 'critical',
    label: 'Critical',
    description: 'Must be fixed',
    badgeClassName:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
];

export const RULE_OPERATORS: Array<{ value: RuleOperator; label: string }> = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'matches_regex', label: 'Matches regex' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
];

export const RULE_FILE_TYPES: Array<{ value: RuleFileType; label: string }> = [
  { value: 'document', label: 'Document' },
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'presentation', label: 'Presentation' },
];

export interface RuleCondition {
  id: string;
  field: string;
  operator: RuleOperator;
  value: string;
  description: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  category: (typeof RULE_CATEGORIES)[number];
  severity: RuleSeverity;
  criteria: string;
  applicableFileTypes: RuleFileType[];
  tags: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  conditions: RuleCondition[];
}

const STORAGE_KEY = 'rulekit.rules.v1';
const CHANGE_EVENT = 'rulekit:rules-changed';

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readAll(): Rule[] {
  if (typeof window === 'undefined') return [];
  return safeJsonParse<Rule[]>(window.localStorage.getItem(STORAGE_KEY), []);
}

function writeAll(rules: Rule[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function ensureSeeded() {
  const existing = readAll();
  if (existing.length > 0) return;

  const seeded: Rule[] = [
    {
      id: generateId(),
      name: 'Email Validation',
      description: 'Validates email format',
      category: 'General',
      severity: 'medium',
      criteria: 'Email must be valid and include a domain.',
      applicableFileTypes: ['document', 'pdf'],
      tags: ['format'],
      enabled: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      conditions: [
        {
          id: generateId(),
          field: 'content',
          operator: 'matches_regex',
          value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          description: 'Ensure email format is valid',
        },
      ],
    },
    {
      id: generateId(),
      name: 'Phone Number Check',
      description: 'Validates phone numbers',
      category: 'General',
      severity: 'low',
      criteria: 'Phone number must include country code and digits only.',
      applicableFileTypes: ['document', 'pdf'],
      tags: ['format'],
      enabled: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      conditions: [
        {
          id: generateId(),
          field: 'content',
          operator: 'matches_regex',
          value: '^\\+?[0-9]{7,15}$',
          description: 'Basic phone number validation',
        },
      ],
    },
  ];

  writeAll(seeded);
}

export const rulesRepo = {
  async list(): Promise<Rule[]> {
    ensureSeeded();
    const rules = readAll();
    return rules
      .slice()
      .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  },

  async getById(id: string): Promise<Rule | null> {
    ensureSeeded();
    const rules = readAll();
    return rules.find((r) => r.id === id) ?? null;
  },

  async create(input: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rule> {
    ensureSeeded();
    const rules = readAll();
    const rule: Rule = {
      ...input,
      id: generateId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    writeAll([rule, ...rules]);
    return rule;
  },

  async update(id: string, updates: Partial<Omit<Rule, 'id' | 'createdAt'>>): Promise<Rule> {
    ensureSeeded();
    const rules = readAll();
    const idx = rules.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error('Rule not found');
    }

    const updated: Rule = {
      ...rules[idx],
      ...updates,
      updatedAt: nowIso(),
    };

    const next = rules.slice();
    next[idx] = updated;
    writeAll(next);
    return updated;
  },

  async remove(id: string): Promise<void> {
    ensureSeeded();
    const rules = readAll();
    writeAll(rules.filter((r) => r.id !== id));
  },

  subscribe(callback: () => void) {
    if (typeof window === 'undefined') return () => {};
    const onChange = () => callback();
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  },
};
