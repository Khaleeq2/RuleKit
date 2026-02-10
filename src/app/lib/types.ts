// ============================================
// RuleKit Core Types
// Self-Serve Rules Engine
// ============================================

// ============================================
// RULEBOOK - The central entity
// ============================================

export interface Rulebook {
  id: string;
  name: string;
  description: string;
  status: RulebookStatus;
  activeVersionId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type RulebookStatus = 'draft' | 'published';

export interface RulebookWithStats extends Rulebook {
  failuresLast24h: number;
  lastDeployedAt: string | null;
  lastRunAt: string | null;
  activeEnv: Environment | null;
}

// Legacy aliases (for incremental migration)
export type Decision = Rulebook;
export type DecisionStatus = RulebookStatus;
export type DecisionWithStats = RulebookWithStats;

// ============================================
// SCHEMA - Input/Output definition
// ============================================

export interface Schema {
  id: string;
  rulebookId: string;
  fields: SchemaField[];
  outputType: OutputType;
  createdAt: string;
  updatedAt: string;
}

export type OutputType = 'pass_fail' | 'pass_flag_fail' | 'risk_level';

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description: string;
  example: string;
  enumValues?: string[];
}

export type FieldType = 'string' | 'number' | 'boolean' | 'enum' | 'date' | 'json' | 'array';

// ============================================
// RULE - Rulebook logic
// ============================================

export interface Rule {
  id: string;
  rulebookId: string;
  name: string;
  description: string;
  order: number;
  condition: RuleCondition;
  result: RuleResult;
  reason: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RuleResult = 'pass' | 'fail' | 'flag' | 'low' | 'medium' | 'high' | 'critical';

export interface RuleCondition {
  type: ConditionType;
  conditions?: RuleCondition[];
  field?: string;
  operator?: ConditionOperator;
  value?: string | number | boolean;
}

export type ConditionType = 'and' | 'or' | 'simple';

export type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt' 
  | 'gte'
  | 'lt' 
  | 'lte'
  | 'regex'
  | 'is_empty'
  | 'is_not_empty';

// ============================================
// VERSION - Snapshot of rulebook
// ============================================

export interface Version {
  id: string;
  rulebookId: string;
  versionNumber: number;
  schemaSnapshot: Schema;
  rulesSnapshot: Rule[];
  releaseNotes: string;
  testStatus: TestStatus;
  createdAt: string;
  createdBy: string;
}

export type TestStatus = 'passing' | 'failing' | 'unknown' | 'running';

// ============================================
// DEPLOYMENT - Environment binding
// ============================================

export interface Deployment {
  id: string;
  rulebookId: string;
  environment: Environment;
  activeVersionId: string;
  versionNumber: number;
  deployedAt: string;
  deployedBy: string;
}

export type Environment = 'draft' | 'live';

export const ENVIRONMENTS: Environment[] = ['draft', 'live'];

// ============================================
// TEST - Test case
// ============================================

export interface Test {
  id: string;
  rulebookId: string;
  name: string;
  description: string;
  inputJson: Record<string, unknown>;
  expectedVerdict: RuleResult;
  expectedReason?: string;
  lastResult?: TestResult;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: string;
  testId: string;
  passed: boolean;
  actualVerdict: RuleResult;
  actualReason: string;
  firedRuleId: string | null;
  firedRuleName: string | null;
  executionTrace: ExecutionTraceStep[];
  creditsUsed: number;
  latencyMs: number;
  runAt: string;
}

export interface ExecutionTraceStep {
  ruleId: string;
  ruleName: string;
  evaluated: boolean;
  matched: boolean;
  reason?: string;
}

// ============================================
// RUN - Execution log
// ============================================

export interface Run {
  id: string;
  rulebookId: string;
  rulebookName: string;
  versionId: string;
  versionNumber: number;
  environment: Environment;
  input: Record<string, unknown>;
  output: RunOutput;
  firedRuleId: string | null;
  firedRuleName: string | null;
  executionTrace: ExecutionTraceStep[];
  trigger: RunTrigger;
  creditsEstimate: number;
  creditsActual: number;
  latencyMs: number;
  status: RunStatus;
  error?: string;
  createdAt: string;
}

export interface RunOutput {
  verdict: RuleResult;
  reason: string;
  metadata?: Record<string, unknown>;
}

export type RunTrigger = 'api' | 'test' | 'manual' | 'webhook';

export type RunStatus = 'success' | 'error' | 'timeout';

// ============================================
// BILLING & CREDITS
// ============================================

export interface CreditBalance {
  balance: number;
  monthlyAllowance: number;
  testAllowanceRemaining: number;
  lastUpdated: string;
}

export interface CreditTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  runId?: string;
  rulebookId?: string;
  createdAt: string;
}

export type TransactionType = 'usage' | 'topup' | 'monthly_reset' | 'refund' | 'stripe_purchase' | 'plan_allowance';

export interface TopUpPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

export const TOP_UP_PACKS: TopUpPack[] = [
  { id: 'pack-starter', name: 'Starter', credits: 100, price: 10 },
  { id: 'pack-growth', name: 'Growth', credits: 300, price: 25, popular: true },
  { id: 'pack-scale', name: 'Scale', credits: 1000, price: 50 },
];

// ============================================
// SUBSCRIPTIONS & PLANS
// ============================================

export type PlanId = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: PlanId;
  status: SubscriptionStatus;
  seatCount: number;
  seatsIncluded: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  creditsPerMonth: number;
  seatsIncluded: number;
  pricePerExtraSeat: number;
  features: string[];
}

export const PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    creditsPerMonth: 50,
    seatsIncluded: 1,
    pricePerExtraSeat: 0,
    features: [
      '50 evaluations / month',
      '3 rulebooks',
      '10 rules per rulebook',
      'Community support',
      'Single user',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: '/ month',
    creditsPerMonth: 500,
    seatsIncluded: 3,
    pricePerExtraSeat: 5,
    features: [
      '500 evaluations / month',
      'Unlimited rulebooks',
      'Unlimited rules',
      'Version history & deployments',
      'Priority support',
      '3 team members included',
      '+$5 / additional member',
      'API access',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: -1,
    period: '',
    creditsPerMonth: -1,
    seatsIncluded: -1,
    pricePerExtraSeat: 0,
    features: [
      'Unlimited evaluations',
      'Unlimited everything',
      'SSO & SAML',
      'Audit logs & compliance',
      'Dedicated support',
      'Custom SLA',
      'On-premise option',
    ],
  },
];

// ============================================
// USER
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

// ============================================
// INTEGRATIONS
// ============================================

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  environment: Environment;
  createdAt: string;
  createdBy: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  enabled: boolean;
  secret: string;
  createdAt: string;
}

export type WebhookEvent = 'run.completed' | 'run.failed' | 'rulebook.published' | 'version.created';

// ============================================
// ACTIVITY & HISTORY
// ============================================

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  actorId: string;
  actorName: string;
  rulebookId?: string;
  rulebookName?: string;
  versionId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type ActivityEventType = 
  | 'rulebook.created'
  | 'rulebook.updated'
  | 'rulebook.deleted'
  | 'version.created'
  | 'deployment.promoted'
  | 'test.created'
  | 'test.run'
  | 'run.executed'
  | 'api_key.created'
  | 'api_key.revoked';

// ============================================
// TEMPLATES
// ============================================

export interface RulebookTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  schema: Omit<Schema, 'id' | 'rulebookId' | 'createdAt' | 'updatedAt'>;
  rules: Omit<Rule, 'id' | 'rulebookId' | 'createdAt' | 'updatedAt'>[];
  tests: Omit<Test, 'id' | 'rulebookId' | 'createdAt' | 'updatedAt' | 'lastResult'>[];
}

// Legacy alias
export type DecisionTemplate = RulebookTemplate;

export type TemplateCategory = 'review' | 'fraud' | 'eligibility' | 'routing' | 'approval' | 'custom';

// ============================================
// UI STATE TYPES
// ============================================

export interface CommandBarAction {
  id: string;
  type: 'create' | 'find' | 'test' | 'show' | 'get';
  label: string;
  description: string;
  href?: string;
  action?: () => void;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href?: string;
  action?: () => void;
}

export interface HealthMetric {
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  status?: 'good' | 'warning' | 'critical';
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// CONSTANTS
// ============================================

export const RULEBOOK_STATUS_LABELS: Record<RulebookStatus, string> = {
  draft: 'Draft',
  published: 'Published',
};

// Legacy alias
export const DECISION_STATUS_LABELS = RULEBOOK_STATUS_LABELS;

export const ENVIRONMENT_LABELS: Record<Environment, string> = {
  draft: 'Draft',
  live: 'Live',
};

export const RULE_RESULT_LABELS: Record<RuleResult, string> = {
  pass: 'Pass',
  fail: 'Fail',
  flag: 'Flag',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const OUTPUT_TYPE_META: Record<OutputType, {
  label: string;
  description: string;
  verdicts: RuleResult[];
  colors: Record<string, string>;
}> = {
  pass_fail: {
    label: 'Pass / Fail',
    description: 'Binary result — each rule either passes or fails',
    verdicts: ['pass', 'fail'],
    colors: { pass: 'emerald', fail: 'red' },
  },
  pass_flag_fail: {
    label: 'Pass / Flag / Fail',
    description: 'Three-tier result — flag means needs human review',
    verdicts: ['pass', 'flag', 'fail'],
    colors: { pass: 'emerald', flag: 'amber', fail: 'red' },
  },
  risk_level: {
    label: 'Risk Level',
    description: 'Four-tier risk assessment — Low, Medium, High, Critical',
    verdicts: ['low', 'medium', 'high', 'critical'],
    colors: { low: 'emerald', medium: 'amber', high: 'orange', critical: 'red' },
  },
};

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: 'equals',
  not_equals: 'does not equal',
  contains: 'contains',
  not_contains: 'does not contain',
  starts_with: 'starts with',
  ends_with: 'ends with',
  gt: 'is greater than',
  gte: 'is greater than or equal to',
  lt: 'is less than',
  lte: 'is less than or equal to',
  regex: 'matches pattern',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
};

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  string: 'Text',
  number: 'Number',
  boolean: 'Yes/No',
  enum: 'Options',
  date: 'Date',
  json: 'JSON Object',
  array: 'List',
};
