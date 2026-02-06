'use client';

import { 
  Version, 
  Deployment, 
  Environment, 
  TestStatus,
  Schema,
  Rule
} from './types';
import { schemasRepo, rulesRepo } from './decisions';

// ============================================
// LocalStorage Keys
// ============================================

const STORAGE_KEYS = {
  versions: 'rulekit.versions.v1',
  deployments: 'rulekit.deployments.v1',
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

const SAMPLE_VERSIONS: Version[] = [
  {
    id: 'version-1',
    decisionId: 'decision-1',
    versionNumber: 3,
    schemaSnapshot: {
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
    rulesSnapshot: [],
    releaseNotes: 'Added employment status check and improved income ratio validation',
    testStatus: 'passing',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user-1',
  },
  {
    id: 'version-1-v2',
    decisionId: 'decision-1',
    versionNumber: 2,
    schemaSnapshot: {
      id: 'schema-1',
      decisionId: 'decision-1',
      fields: [
        { id: 'field-1', name: 'credit_score', type: 'number', required: true, description: 'Applicant credit score', example: '720' },
        { id: 'field-2', name: 'annual_income', type: 'number', required: true, description: 'Annual income in USD', example: '75000' },
        { id: 'field-4', name: 'loan_amount', type: 'number', required: true, description: 'Requested loan amount', example: '25000' },
      ],
      outputType: 'pass_fail',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    rulesSnapshot: [],
    releaseNotes: 'Initial loan eligibility rules',
    testStatus: 'passing',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user-1',
  },
  {
    id: 'version-2',
    decisionId: 'decision-2',
    versionNumber: 2,
    schemaSnapshot: {
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
    rulesSnapshot: [],
    releaseNotes: 'Added international transaction checks',
    testStatus: 'passing',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user-1',
  },
];

const SAMPLE_DEPLOYMENTS: Deployment[] = [
  {
    id: 'deploy-1',
    decisionId: 'decision-1',
    environment: 'live',
    activeVersionId: 'version-1',
    versionNumber: 3,
    deployedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deployedBy: 'user-1',
  },
  {
    id: 'deploy-2',
    decisionId: 'decision-1',
    environment: 'draft',
    activeVersionId: 'version-1',
    versionNumber: 3,
    deployedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    deployedBy: 'user-1',
  },
  {
    id: 'deploy-3',
    decisionId: 'decision-2',
    environment: 'live',
    activeVersionId: 'version-2',
    versionNumber: 2,
    deployedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    deployedBy: 'user-1',
  },
];

// ============================================
// Initialize with sample data
// ============================================

function initializeData(): void {
  if (typeof window === 'undefined') return;
  
  const versions = getStorage<Version>(STORAGE_KEYS.versions);
  if (versions.length === 0) {
    setStorage(STORAGE_KEYS.versions, SAMPLE_VERSIONS);
    setStorage(STORAGE_KEYS.deployments, SAMPLE_DEPLOYMENTS);
  }
}

if (typeof window !== 'undefined') {
  initializeData();
}

// ============================================
// Versions Repository
// ============================================

export const versionsRepo = {
  async listByDecisionId(decisionId: string): Promise<Version[]> {
    initializeData();
    const versions = getStorage<Version>(STORAGE_KEYS.versions);
    return versions
      .filter(v => v.decisionId === decisionId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  },

  async getById(id: string): Promise<Version | null> {
    initializeData();
    const versions = getStorage<Version>(STORAGE_KEYS.versions);
    return versions.find(v => v.id === id) || null;
  },

  async getLatestByDecisionId(decisionId: string): Promise<Version | null> {
    const versions = await this.listByDecisionId(decisionId);
    return versions[0] || null;
  },

  async create(decisionId: string, releaseNotes: string = ''): Promise<Version> {
    initializeData();
    const versions = getStorage<Version>(STORAGE_KEYS.versions);
    
    // Get current schema and rules
    const schema = await schemasRepo.getByDecisionId(decisionId);
    const rules = await rulesRepo.listByDecisionId(decisionId);
    
    if (!schema) {
      throw new Error(`Schema for decision ${decisionId} not found`);
    }
    
    // Get next version number
    const existingVersions = versions.filter(v => v.decisionId === decisionId);
    const nextVersionNumber = existingVersions.length > 0
      ? Math.max(...existingVersions.map(v => v.versionNumber)) + 1
      : 1;
    
    const newVersion: Version = {
      id: generateId(),
      decisionId,
      versionNumber: nextVersionNumber,
      schemaSnapshot: { ...schema },
      rulesSnapshot: rules.map(r => ({ ...r })),
      releaseNotes,
      testStatus: 'unknown',
      createdAt: new Date().toISOString(),
      createdBy: 'user-1', // Would come from auth context
    };
    
    versions.push(newVersion);
    setStorage(STORAGE_KEYS.versions, versions);
    
    return newVersion;
  },

  async updateTestStatus(id: string, testStatus: TestStatus): Promise<Version> {
    initializeData();
    const versions = getStorage<Version>(STORAGE_KEYS.versions);
    const index = versions.findIndex(v => v.id === id);
    
    if (index === -1) {
      throw new Error(`Version with id ${id} not found`);
    }
    
    versions[index] = { ...versions[index], testStatus };
    setStorage(STORAGE_KEYS.versions, versions);
    
    return versions[index];
  },

  async updateReleaseNotes(id: string, releaseNotes: string): Promise<Version> {
    initializeData();
    const versions = getStorage<Version>(STORAGE_KEYS.versions);
    const index = versions.findIndex(v => v.id === id);
    
    if (index === -1) {
      throw new Error(`Version with id ${id} not found`);
    }
    
    versions[index] = { ...versions[index], releaseNotes };
    setStorage(STORAGE_KEYS.versions, versions);
    
    return versions[index];
  },

  subscribe(callback: () => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === STORAGE_KEYS.versions) {
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
// Deployments Repository
// ============================================

export const deploymentsRepo = {
  async listByDecisionId(decisionId: string): Promise<Deployment[]> {
    initializeData();
    const deployments = getStorage<Deployment>(STORAGE_KEYS.deployments);
    return deployments
      .filter(d => d.decisionId === decisionId)
      .sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime());
  },

  async listAll(): Promise<Deployment[]> {
    initializeData();
    const deployments = getStorage<Deployment>(STORAGE_KEYS.deployments);
    return deployments.sort((a, b) => 
      new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime()
    );
  },

  async getByDecisionAndEnv(decisionId: string, environment: Environment): Promise<Deployment | null> {
    initializeData();
    const deployments = getStorage<Deployment>(STORAGE_KEYS.deployments);
    return deployments.find(d => 
      d.decisionId === decisionId && d.environment === environment
    ) || null;
  },

  async getActiveDeployments(decisionId: string): Promise<Record<Environment, Deployment | null>> {
    const deployments = await this.listByDecisionId(decisionId);
    return {
      draft: deployments.find(d => d.environment === 'draft') || null,
      live: deployments.find(d => d.environment === 'live') || null,
    };
  },

  async promote(decisionId: string, versionId: string, environment: Environment): Promise<Deployment> {
    initializeData();
    const deployments = getStorage<Deployment>(STORAGE_KEYS.deployments);
    
    // Get the version to get version number
    const version = await versionsRepo.getById(versionId);
    if (!version) {
      throw new Error(`Version with id ${versionId} not found`);
    }
    
    // Check if tests pass for prod
    if (environment === 'live' && version.testStatus !== 'passing') {
      throw new Error('Cannot make live: tests must be passing');
    }
    
    // Find existing deployment for this decision/env
    const existingIndex = deployments.findIndex(d => 
      d.decisionId === decisionId && d.environment === environment
    );
    
    const deployment: Deployment = {
      id: existingIndex >= 0 ? deployments[existingIndex].id : generateId(),
      decisionId,
      environment,
      activeVersionId: versionId,
      versionNumber: version.versionNumber,
      deployedAt: new Date().toISOString(),
      deployedBy: 'user-1', // Would come from auth context
    };
    
    if (existingIndex >= 0) {
      deployments[existingIndex] = deployment;
    } else {
      deployments.push(deployment);
    }
    
    setStorage(STORAGE_KEYS.deployments, deployments);
    
    return deployment;
  },

  async rollback(decisionId: string, environment: Environment, versionId: string): Promise<Deployment> {
    return this.promote(decisionId, versionId, environment);
  },

  subscribe(callback: () => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === STORAGE_KEYS.deployments) {
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
