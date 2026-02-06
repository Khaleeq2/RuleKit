'use client';

import { 
  Decision, 
  DecisionWithStats, 
  Schema, 
  SchemaField,
  Rule, 
  RuleCondition,
  DecisionStatus,
  Environment
} from './types';

// ============================================
// LocalStorage Keys
// ============================================

const STORAGE_KEYS = {
  decisions: 'rulekit.decisions.v1',
  schemas: 'rulekit.schemas.v1',
  rules: 'rulekit.rules.v1',
} as const;

// ============================================
// Utility Functions
// ============================================

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

function getStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('rulekit:data-changed', { detail: { key } }));
}

// ============================================
// Sample Data
// ============================================

const SAMPLE_DECISIONS: Decision[] = [
  {
    id: 'decision-1',
    name: 'Loan Eligibility',
    description: 'Determines if an applicant is eligible for a personal loan based on credit score, income, and employment status.',
    status: 'published',
    activeVersionId: 'version-1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user-1',
  },
  {
    id: 'decision-2',
    name: 'Fraud Detection',
    description: 'Evaluates transactions for potential fraud based on amount, location, and user behavior patterns.',
    status: 'published',
    activeVersionId: 'version-2',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user-1',
  },
  {
    id: 'decision-3',
    name: 'Support Ticket Routing',
    description: 'Routes incoming support tickets to the appropriate team based on category, priority, and customer tier.',
    status: 'draft',
    activeVersionId: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user-1',
  },
];

const SAMPLE_SCHEMAS: Schema[] = [
  {
    id: 'schema-1',
    decisionId: 'decision-1',
    fields: [
      { id: 'field-1', name: 'credit_score', type: 'number', required: true, description: 'Applicant credit score (300-850)', example: '720' },
      { id: 'field-2', name: 'annual_income', type: 'number', required: true, description: 'Annual income in USD', example: '75000' },
      { id: 'field-3', name: 'employment_status', type: 'enum', required: true, description: 'Current employment status', example: 'employed', enumValues: ['employed', 'self_employed', 'unemployed', 'retired'] },
      { id: 'field-4', name: 'loan_amount', type: 'number', required: true, description: 'Requested loan amount in USD', example: '25000' },
    ],
    outputType: 'pass_fail',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'schema-2',
    decisionId: 'decision-2',
    fields: [
      { id: 'field-5', name: 'amount', type: 'number', required: true, description: 'Transaction amount in USD', example: '500' },
      { id: 'field-6', name: 'merchant_category', type: 'string', required: true, description: 'Merchant category code', example: 'electronics' },
      { id: 'field-7', name: 'country', type: 'string', required: true, description: 'Transaction country code', example: 'US' },
      { id: 'field-8', name: 'is_card_present', type: 'boolean', required: true, description: 'Whether physical card was present', example: 'true' },
    ],
    outputType: 'pass_fail',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'schema-3',
    decisionId: 'decision-3',
    fields: [
      { id: 'field-9', name: 'category', type: 'enum', required: true, description: 'Ticket category', example: 'billing', enumValues: ['billing', 'technical', 'sales', 'general'] },
      { id: 'field-10', name: 'priority', type: 'enum', required: true, description: 'Ticket priority level', example: 'high', enumValues: ['low', 'medium', 'high', 'urgent'] },
      { id: 'field-11', name: 'customer_tier', type: 'enum', required: true, description: 'Customer subscription tier', example: 'enterprise', enumValues: ['free', 'pro', 'business'] },
    ],
    outputType: 'pass_fail',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SAMPLE_RULES: Rule[] = [
  // Loan Eligibility Rules
  {
    id: 'rule-1',
    decisionId: 'decision-1',
    name: 'Minimum Credit Score',
    description: 'Applicant must have a minimum credit score of 650',
    order: 1,
    condition: { type: 'simple', field: 'credit_score', operator: 'lt', value: 650 },
    result: 'fail',
    reason: 'Credit score below minimum threshold of 650',
    enabled: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rule-2',
    decisionId: 'decision-1',
    name: 'Income to Loan Ratio',
    description: 'Loan amount must not exceed 50% of annual income',
    order: 2,
    condition: { type: 'simple', field: 'loan_amount', operator: 'gt', value: 37500 },
    result: 'fail',
    reason: 'Loan amount exceeds 50% of annual income',
    enabled: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rule-3',
    decisionId: 'decision-1',
    name: 'Employment Check',
    description: 'Applicant must be employed or self-employed',
    order: 3,
    condition: { type: 'simple', field: 'employment_status', operator: 'equals', value: 'unemployed' },
    result: 'fail',
    reason: 'Applicant must be employed or self-employed',
    enabled: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rule-4',
    decisionId: 'decision-1',
    name: 'Default Pass',
    description: 'If all checks pass, approve the application',
    order: 4,
    condition: { type: 'simple', field: 'credit_score', operator: 'gte', value: 0 },
    result: 'pass',
    reason: 'Application meets all eligibility criteria',
    enabled: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Fraud Detection Rules
  {
    id: 'rule-5',
    decisionId: 'decision-2',
    name: 'High Amount Alert',
    description: 'Flag transactions over $5000',
    order: 1,
    condition: { type: 'simple', field: 'amount', operator: 'gt', value: 5000 },
    result: 'fail',
    reason: 'Transaction amount exceeds $5000 threshold',
    enabled: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rule-6',
    decisionId: 'decision-2',
    name: 'International Card-Not-Present',
    description: 'Flag international transactions without card present',
    order: 2,
    condition: {
      type: 'and',
      conditions: [
        { type: 'simple', field: 'country', operator: 'not_equals', value: 'US' },
        { type: 'simple', field: 'is_card_present', operator: 'equals', value: false },
      ],
    },
    result: 'fail',
    reason: 'International card-not-present transaction requires review',
    enabled: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rule-7',
    decisionId: 'decision-2',
    name: 'Default Approve',
    description: 'Approve transaction if no fraud indicators',
    order: 3,
    condition: { type: 'simple', field: 'amount', operator: 'gte', value: 0 },
    result: 'pass',
    reason: 'Transaction approved - no fraud indicators detected',
    enabled: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// Initialize with sample data
// ============================================

function initializeData(): void {
  if (typeof window === 'undefined') return;
  
  const decisions = getStorage<Decision>(STORAGE_KEYS.decisions);
  if (decisions.length === 0) {
    setStorage(STORAGE_KEYS.decisions, SAMPLE_DECISIONS);
    setStorage(STORAGE_KEYS.schemas, SAMPLE_SCHEMAS);
    setStorage(STORAGE_KEYS.rules, SAMPLE_RULES);
  }
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  initializeData();
}

// ============================================
// Decisions Repository
// ============================================

export const decisionsRepo = {
  async list(): Promise<Decision[]> {
    initializeData();
    const decisions = getStorage<Decision>(STORAGE_KEYS.decisions);
    return decisions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async listWithStats(): Promise<DecisionWithStats[]> {
    const decisions = await this.list();
    // In production, this would aggregate real stats
    return decisions.map(d => ({
      ...d,
      failuresLast24h: Math.floor(Math.random() * 5),
      lastDeployedAt: d.status === 'published' 
        ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
      lastRunAt: d.status === 'published'
        ? new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString()
        : null,
      activeEnv: d.status === 'published' ? 'live' as Environment : null,
    }));
  },

  async getById(id: string): Promise<Decision | null> {
    initializeData();
    const decisions = getStorage<Decision>(STORAGE_KEYS.decisions);
    return decisions.find(d => d.id === id) || null;
  },

  async create(input: Omit<Decision, 'id' | 'createdAt' | 'updatedAt' | 'activeVersionId'>): Promise<Decision> {
    initializeData();
    const decisions = getStorage<Decision>(STORAGE_KEYS.decisions);
    const now = new Date().toISOString();
    
    const newDecision: Decision = {
      ...input,
      id: generateId(),
      activeVersionId: null,
      createdAt: now,
      updatedAt: now,
    };
    
    decisions.push(newDecision);
    setStorage(STORAGE_KEYS.decisions, decisions);
    
    // Create default schema
    await schemasRepo.create({
      decisionId: newDecision.id,
      fields: [],
      outputType: 'pass_fail',
    });
    
    return newDecision;
  },

  async update(id: string, updates: Partial<Omit<Decision, 'id' | 'createdAt'>>): Promise<Decision> {
    initializeData();
    const decisions = getStorage<Decision>(STORAGE_KEYS.decisions);
    const index = decisions.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error(`Decision with id ${id} not found`);
    }
    
    const updated: Decision = {
      ...decisions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    decisions[index] = updated;
    setStorage(STORAGE_KEYS.decisions, decisions);
    
    return updated;
  },

  async remove(id: string): Promise<void> {
    initializeData();
    const decisions = getStorage<Decision>(STORAGE_KEYS.decisions);
    const filtered = decisions.filter(d => d.id !== id);
    setStorage(STORAGE_KEYS.decisions, filtered);
    
    // Also remove associated schemas and rules
    const schemas = getStorage<Schema>(STORAGE_KEYS.schemas);
    setStorage(STORAGE_KEYS.schemas, schemas.filter(s => s.decisionId !== id));
    
    const rules = getStorage<Rule>(STORAGE_KEYS.rules);
    setStorage(STORAGE_KEYS.rules, rules.filter(r => r.decisionId !== id));
  },

  async search(query: string): Promise<Decision[]> {
    const decisions = await this.list();
    const lowerQuery = query.toLowerCase();
    return decisions.filter(d => 
      d.name.toLowerCase().includes(lowerQuery) ||
      d.description.toLowerCase().includes(lowerQuery)
    );
  },

  async filterByStatus(status: DecisionStatus): Promise<Decision[]> {
    const decisions = await this.list();
    return decisions.filter(d => d.status === status);
  },

  subscribe(callback: () => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === STORAGE_KEYS.decisions) {
        callback();
      }
    };
    window.addEventListener('rulekit:data-changed', handler);
    window.addEventListener('storage', callback);
    return () => {
      window.removeEventListener('rulekit:data-changed', handler);
      window.removeEventListener('storage', callback);
    };
  },
};

// ============================================
// Schemas Repository
// ============================================

export const schemasRepo = {
  async getByDecisionId(decisionId: string): Promise<Schema | null> {
    initializeData();
    const schemas = getStorage<Schema>(STORAGE_KEYS.schemas);
    return schemas.find(s => s.decisionId === decisionId) || null;
  },

  async create(input: Omit<Schema, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schema> {
    initializeData();
    const schemas = getStorage<Schema>(STORAGE_KEYS.schemas);
    const now = new Date().toISOString();
    
    const newSchema: Schema = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    schemas.push(newSchema);
    setStorage(STORAGE_KEYS.schemas, schemas);
    
    return newSchema;
  },

  async update(decisionId: string, updates: Partial<Omit<Schema, 'id' | 'decisionId' | 'createdAt'>>): Promise<Schema> {
    initializeData();
    const schemas = getStorage<Schema>(STORAGE_KEYS.schemas);
    const index = schemas.findIndex(s => s.decisionId === decisionId);
    
    if (index === -1) {
      throw new Error(`Schema for decision ${decisionId} not found`);
    }
    
    const updated: Schema = {
      ...schemas[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    schemas[index] = updated;
    setStorage(STORAGE_KEYS.schemas, schemas);
    
    return updated;
  },

  async addField(decisionId: string, field: Omit<SchemaField, 'id'>): Promise<Schema> {
    const schema = await this.getByDecisionId(decisionId);
    if (!schema) {
      throw new Error(`Schema for decision ${decisionId} not found`);
    }
    
    const newField: SchemaField = {
      ...field,
      id: generateId(),
    };
    
    return this.update(decisionId, {
      fields: [...schema.fields, newField],
    });
  },

  async updateField(decisionId: string, fieldId: string, updates: Partial<Omit<SchemaField, 'id'>>): Promise<Schema> {
    const schema = await this.getByDecisionId(decisionId);
    if (!schema) {
      throw new Error(`Schema for decision ${decisionId} not found`);
    }
    
    const fields = schema.fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    );
    
    return this.update(decisionId, { fields });
  },

  async removeField(decisionId: string, fieldId: string): Promise<Schema> {
    const schema = await this.getByDecisionId(decisionId);
    if (!schema) {
      throw new Error(`Schema for decision ${decisionId} not found`);
    }
    
    const fields = schema.fields.filter(f => f.id !== fieldId);
    return this.update(decisionId, { fields });
  },

  async inferFromJson(json: Record<string, unknown>): Promise<SchemaField[]> {
    const fields: SchemaField[] = [];
    
    for (const [key, value] of Object.entries(json)) {
      let type: SchemaField['type'] = 'string';
      
      if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (Array.isArray(value)) {
        type = 'array';
      } else if (typeof value === 'object' && value !== null) {
        type = 'json';
      } else if (typeof value === 'string') {
        // Check if it looks like a date
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
          type = 'date';
        }
      }
      
      fields.push({
        id: generateId(),
        name: key,
        type,
        required: true,
        description: '',
        example: String(value),
      });
    }
    
    return fields;
  },
};

// ============================================
// Rules Repository
// ============================================

export const rulesRepo = {
  async listByDecisionId(decisionId: string): Promise<Rule[]> {
    initializeData();
    const rules = getStorage<Rule>(STORAGE_KEYS.rules);
    return rules
      .filter(r => r.decisionId === decisionId)
      .sort((a, b) => a.order - b.order);
  },

  async getById(id: string): Promise<Rule | null> {
    initializeData();
    const rules = getStorage<Rule>(STORAGE_KEYS.rules);
    return rules.find(r => r.id === id) || null;
  },

  async create(input: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rule> {
    initializeData();
    const rules = getStorage<Rule>(STORAGE_KEYS.rules);
    const now = new Date().toISOString();
    
    const newRule: Rule = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    rules.push(newRule);
    setStorage(STORAGE_KEYS.rules, rules);
    
    return newRule;
  },

  async update(id: string, updates: Partial<Omit<Rule, 'id' | 'decisionId' | 'createdAt'>>): Promise<Rule> {
    initializeData();
    const rules = getStorage<Rule>(STORAGE_KEYS.rules);
    const index = rules.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error(`Rule with id ${id} not found`);
    }
    
    const updated: Rule = {
      ...rules[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    rules[index] = updated;
    setStorage(STORAGE_KEYS.rules, rules);
    
    return updated;
  },

  async remove(id: string): Promise<void> {
    initializeData();
    const rules = getStorage<Rule>(STORAGE_KEYS.rules);
    const filtered = rules.filter(r => r.id !== id);
    setStorage(STORAGE_KEYS.rules, filtered);
  },

  async reorder(decisionId: string, orderedIds: string[]): Promise<Rule[]> {
    initializeData();
    const rules = getStorage<Rule>(STORAGE_KEYS.rules);
    
    const updatedRules = rules.map(r => {
      if (r.decisionId !== decisionId) return r;
      const newOrder = orderedIds.indexOf(r.id);
      if (newOrder === -1) return r;
      return { ...r, order: newOrder + 1, updatedAt: new Date().toISOString() };
    });
    
    setStorage(STORAGE_KEYS.rules, updatedRules);
    return this.listByDecisionId(decisionId);
  },

  async toggleEnabled(id: string): Promise<Rule> {
    const rule = await this.getById(id);
    if (!rule) {
      throw new Error(`Rule with id ${id} not found`);
    }
    return this.update(id, { enabled: !rule.enabled });
  },
};
