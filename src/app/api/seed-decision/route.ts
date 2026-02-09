import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

// ============================================
// Sample Loan Eligibility Decision
// Pre-loaded for every new user to enable instant evaluation
// ============================================

const SEED_DECISION = {
  name: 'Loan Eligibility',
  description: 'Determines whether a loan applicant qualifies based on age, income, and credit score. This is a sample decision — edit or delete it anytime.',
  status: 'published' as const,
};

const SEED_SCHEMA = {
  fields: [
    { id: 'field-age', name: 'age', type: 'number' as const, required: true, description: 'Applicant age in years', example: '28' },
    { id: 'field-income', name: 'income', type: 'number' as const, required: true, description: 'Annual income in USD', example: '75000' },
    { id: 'field-credit_score', name: 'credit_score', type: 'number' as const, required: true, description: 'Credit score (300-850)', example: '720' },
  ],
  output_type: 'pass_fail',
};

const SEED_RULES = [
  {
    name: 'Age Requirement',
    description: 'Applicant must be at least 18 years old to be eligible for a loan.',
    order: 1,
    condition: {},
    result: 'pass_fail',
    reason: 'Applicants under 18 are not eligible for loan products.',
    enabled: true,
  },
  {
    name: 'Minimum Income',
    description: 'Applicant must have an annual income of at least $30,000.',
    order: 2,
    condition: {},
    result: 'pass_fail',
    reason: 'Minimum income threshold ensures repayment capacity.',
    enabled: true,
  },
  {
    name: 'Credit Score Check',
    description: 'Applicant must have a credit score of 650 or higher.',
    order: 3,
    condition: {},
    result: 'pass_fail',
    reason: 'A credit score of 650+ indicates acceptable credit risk.',
    enabled: true,
  },
];

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Check if user already has decisions (don't re-seed)
    const { data: existing } = await supabaseAdmin
      .from('decisions')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ seeded: false, reason: 'User already has decisions' });
    }

    // Create decision
    const { data: decision, error: decisionError } = await supabaseAdmin
      .from('decisions')
      .insert({
        name: SEED_DECISION.name,
        description: SEED_DECISION.description,
        status: SEED_DECISION.status,
        user_id: user.id,
      })
      .select()
      .single();

    if (decisionError) throw decisionError;

    // Create schema
    const { error: schemaError } = await supabaseAdmin
      .from('schemas')
      .insert({
        decision_id: decision.id,
        fields: SEED_SCHEMA.fields,
        output_type: SEED_SCHEMA.output_type,
      });

    if (schemaError) throw schemaError;

    // Create rules
    const rulesWithDecisionId = SEED_RULES.map(rule => ({
      ...rule,
      decision_id: decision.id,
    }));

    const { error: rulesError } = await supabaseAdmin
      .from('decision_rules')
      .insert(rulesWithDecisionId);

    if (rulesError) throw rulesError;

    return NextResponse.json({
      seeded: true,
      decisionId: decision.id,
      decisionName: decision.name,
    });
  } catch (error) {
    console.error('Seed decision error:', error);
    return NextResponse.json(
      { error: 'Failed to create sample decision' },
      { status: 500 },
    );
  }
}
