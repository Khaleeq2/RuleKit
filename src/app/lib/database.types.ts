// ============================================
// Supabase Database Types (manual)
// Generated from: supabase/migrations/20260209_0002_full_schema.sql
// Replace with `supabase gen types` when access is available.
// ============================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      decisions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          status: 'draft' | 'published';
          active_version_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          description?: string;
          status?: 'draft' | 'published';
          active_version_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          status?: 'draft' | 'published';
          active_version_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      schemas: {
        Row: {
          id: string;
          user_id: string;
          decision_id: string;
          fields: Json;
          output_type: 'pass_fail' | 'score' | 'custom';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          decision_id: string;
          fields?: Json;
          output_type?: 'pass_fail' | 'score' | 'custom';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          decision_id?: string;
          fields?: Json;
          output_type?: 'pass_fail' | 'score' | 'custom';
          created_at?: string;
          updated_at?: string;
        };
      };
      decision_rules: {
        Row: {
          id: string;
          user_id: string;
          decision_id: string;
          name: string;
          description: string;
          order: number;
          condition: Json;
          result: 'pass' | 'fail';
          reason: string;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          decision_id: string;
          name: string;
          description?: string;
          order?: number;
          condition?: Json;
          result?: 'pass' | 'fail';
          reason?: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          decision_id?: string;
          name?: string;
          description?: string;
          order?: number;
          condition?: Json;
          result?: 'pass' | 'fail';
          reason?: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      versions: {
        Row: {
          id: string;
          user_id: string;
          decision_id: string;
          version_number: number;
          schema_snapshot: Json;
          rules_snapshot: Json;
          release_notes: string;
          test_status: 'passing' | 'failing' | 'unknown' | 'running';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          decision_id: string;
          version_number: number;
          schema_snapshot?: Json;
          rules_snapshot?: Json;
          release_notes?: string;
          test_status?: 'passing' | 'failing' | 'unknown' | 'running';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          decision_id?: string;
          version_number?: number;
          schema_snapshot?: Json;
          rules_snapshot?: Json;
          release_notes?: string;
          test_status?: 'passing' | 'failing' | 'unknown' | 'running';
          created_at?: string;
        };
      };
      deployments: {
        Row: {
          id: string;
          user_id: string;
          decision_id: string;
          environment: 'draft' | 'live';
          active_version_id: string;
          version_number: number;
          deployed_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          decision_id: string;
          environment: 'draft' | 'live';
          active_version_id: string;
          version_number: number;
          deployed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          decision_id?: string;
          environment?: 'draft' | 'live';
          active_version_id?: string;
          version_number?: number;
          deployed_at?: string;
        };
      };
      tests: {
        Row: {
          id: string;
          user_id: string;
          decision_id: string;
          name: string;
          description: string;
          input_json: Json;
          expected_decision: 'pass' | 'fail';
          expected_reason: string | null;
          last_result: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          decision_id: string;
          name: string;
          description?: string;
          input_json?: Json;
          expected_decision?: 'pass' | 'fail';
          expected_reason?: string | null;
          last_result?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          decision_id?: string;
          name?: string;
          description?: string;
          input_json?: Json;
          expected_decision?: 'pass' | 'fail';
          expected_reason?: string | null;
          last_result?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      runs: {
        Row: {
          id: string;
          user_id: string;
          decision_id: string;
          decision_name: string;
          version_id: string;
          version_number: number;
          environment: 'draft' | 'live';
          input: Json;
          output: Json;
          fired_rule_id: string | null;
          fired_rule_name: string | null;
          execution_trace: Json;
          trigger: 'api' | 'test' | 'manual' | 'webhook';
          credits_estimate: number;
          credits_actual: number;
          latency_ms: number;
          status: 'success' | 'error' | 'timeout';
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          decision_id: string;
          decision_name: string;
          version_id: string;
          version_number: number;
          environment: 'draft' | 'live';
          input?: Json;
          output?: Json;
          fired_rule_id?: string | null;
          fired_rule_name?: string | null;
          execution_trace?: Json;
          trigger?: 'api' | 'test' | 'manual' | 'webhook';
          credits_estimate?: number;
          credits_actual?: number;
          latency_ms?: number;
          status?: 'success' | 'error' | 'timeout';
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          decision_id?: string;
          decision_name?: string;
          version_id?: string;
          version_number?: number;
          environment?: 'draft' | 'live';
          input?: Json;
          output?: Json;
          fired_rule_id?: string | null;
          fired_rule_name?: string | null;
          execution_trace?: Json;
          trigger?: 'api' | 'test' | 'manual' | 'webhook';
          credits_estimate?: number;
          credits_actual?: number;
          latency_ms?: number;
          status?: 'success' | 'error' | 'timeout';
          error?: string | null;
          created_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          decision_id: string;
          decision_name: string;
          verdict: 'pass' | 'fail' | null;
          message_count: number;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title?: string;
          decision_id: string;
          decision_name: string;
          verdict?: 'pass' | 'fail' | null;
          message_count?: number;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          decision_id?: string;
          decision_name?: string;
          verdict?: 'pass' | 'fail' | null;
          message_count?: number;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_balances: {
        Row: {
          user_id: string;
          balance: number;
          monthly_allowance: number;
          test_allowance_remaining: number;
          last_updated: string;
        };
        Insert: {
          user_id: string;
          balance?: number;
          monthly_allowance?: number;
          test_allowance_remaining?: number;
          last_updated?: string;
        };
        Update: {
          user_id?: string;
          balance?: number;
          monthly_allowance?: number;
          test_allowance_remaining?: number;
          last_updated?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'usage' | 'topup' | 'monthly_reset' | 'refund';
          amount: number;
          description: string;
          run_id: string | null;
          decision_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          type: 'usage' | 'topup' | 'monthly_reset' | 'refund';
          amount: number;
          description?: string;
          run_id?: string | null;
          decision_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'usage' | 'topup' | 'monthly_reset' | 'refund';
          amount?: number;
          description?: string;
          run_id?: string | null;
          decision_id?: string | null;
          created_at?: string;
        };
      };
      activity_events: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          actor_name: string;
          decision_id: string | null;
          decision_name: string | null;
          version_id: string | null;
          description: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          type: string;
          actor_name?: string;
          decision_id?: string | null;
          decision_name?: string | null;
          version_id?: string | null;
          description?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          actor_name?: string;
          decision_id?: string | null;
          decision_name?: string | null;
          version_id?: string | null;
          description?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}
