-- ============================================
-- Rename decisions → rulebooks
-- Single cohesive migration: table renames, FK column renames,
-- index rebuilds, constraint updates, RLS policy rebuilds.
-- Pre-production only — no backward compatibility needed.
-- ============================================

-- ============================================
-- 1. Rename core tables
-- ============================================

ALTER TABLE public.decisions RENAME TO rulebooks;
ALTER TABLE public.decision_rules RENAME TO rules;

-- ============================================
-- 2. Rename FK columns: decision_id → rulebook_id
-- ============================================

-- schemas
ALTER TABLE public.schemas RENAME COLUMN decision_id TO rulebook_id;

-- rules (was decision_rules)
ALTER TABLE public.rules RENAME COLUMN decision_id TO rulebook_id;

-- versions
ALTER TABLE public.versions RENAME COLUMN decision_id TO rulebook_id;

-- deployments
ALTER TABLE public.deployments RENAME COLUMN decision_id TO rulebook_id;

-- tests
ALTER TABLE public.tests RENAME COLUMN decision_id TO rulebook_id;

-- runs
ALTER TABLE public.runs RENAME COLUMN decision_id TO rulebook_id;
ALTER TABLE public.runs RENAME COLUMN decision_name TO rulebook_name;

-- sessions
ALTER TABLE public.sessions RENAME COLUMN decision_id TO rulebook_id;
ALTER TABLE public.sessions RENAME COLUMN decision_name TO rulebook_name;

-- credit_transactions
ALTER TABLE public.credit_transactions RENAME COLUMN decision_id TO rulebook_id;

-- activity_events
ALTER TABLE public.activity_events RENAME COLUMN decision_id TO rulebook_id;
ALTER TABLE public.activity_events RENAME COLUMN decision_name TO rulebook_name;

-- ============================================
-- 3. Rename tests.expected_decision → expected_verdict
-- ============================================

ALTER TABLE public.tests RENAME COLUMN expected_decision TO expected_verdict;

-- ============================================
-- 4. Rebuild indexes with new names
-- ============================================

DROP INDEX IF EXISTS idx_decisions_user_id;
CREATE INDEX idx_rulebooks_user_id ON public.rulebooks(user_id);

DROP INDEX IF EXISTS idx_schemas_decision_id;
CREATE INDEX idx_schemas_rulebook_id ON public.schemas(rulebook_id);

DROP INDEX IF EXISTS idx_decision_rules_decision_id;
CREATE INDEX idx_rules_rulebook_id ON public.rules(rulebook_id);

DROP INDEX IF EXISTS idx_versions_decision_id;
CREATE INDEX idx_versions_rulebook_id ON public.versions(rulebook_id);

DROP INDEX IF EXISTS idx_deployments_decision_id;
CREATE INDEX idx_deployments_rulebook_id ON public.deployments(rulebook_id);

DROP INDEX IF EXISTS idx_tests_decision_id;
CREATE INDEX idx_tests_rulebook_id ON public.tests(rulebook_id);

DROP INDEX IF EXISTS idx_runs_decision_id;
CREATE INDEX idx_runs_rulebook_id ON public.runs(rulebook_id);

-- ============================================
-- 5. Update check constraints
-- ============================================

-- schemas output_type (was updated in migration 0004, rebuild on renamed table)
ALTER TABLE public.schemas DROP CONSTRAINT IF EXISTS schemas_output_type_check;
ALTER TABLE public.schemas ADD CONSTRAINT schemas_output_type_check
  CHECK (output_type IN ('pass_fail', 'pass_flag_fail', 'risk_level'));

-- rules result (was decision_rules_result_check from migration 0004)
ALTER TABLE public.rules DROP CONSTRAINT IF EXISTS decision_rules_result_check;
ALTER TABLE public.rules ADD CONSTRAINT rules_result_check
  CHECK (result IN ('pass', 'fail', 'flag', 'low', 'medium', 'high', 'critical'));

-- tests expected_verdict (was expected_decision)
ALTER TABLE public.tests DROP CONSTRAINT IF EXISTS tests_expected_decision_check;
ALTER TABLE public.tests ADD CONSTRAINT tests_expected_verdict_check
  CHECK (expected_verdict IN ('pass', 'fail', 'flag', 'low', 'medium', 'high', 'critical'));

-- sessions verdict (widen to support all verdict types)
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_verdict_check;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_verdict_check
  CHECK (verdict IN ('pass', 'fail', 'flag', 'low', 'medium', 'high', 'critical'));

-- ============================================
-- 6. Rebuild RLS policies for renamed tables
-- ============================================

-- rulebooks (was decisions)
DROP POLICY IF EXISTS "decisions_select_own" ON public.rulebooks;
DROP POLICY IF EXISTS "decisions_insert_own" ON public.rulebooks;
DROP POLICY IF EXISTS "decisions_update_own" ON public.rulebooks;
DROP POLICY IF EXISTS "decisions_delete_own" ON public.rulebooks;

CREATE POLICY "rulebooks_select_own" ON public.rulebooks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "rulebooks_insert_own" ON public.rulebooks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "rulebooks_update_own" ON public.rulebooks FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "rulebooks_delete_own" ON public.rulebooks FOR DELETE USING (user_id = auth.uid());

-- rules (was decision_rules)
DROP POLICY IF EXISTS "decision_rules_select_own" ON public.rules;
DROP POLICY IF EXISTS "decision_rules_insert_own" ON public.rules;
DROP POLICY IF EXISTS "decision_rules_update_own" ON public.rules;
DROP POLICY IF EXISTS "decision_rules_delete_own" ON public.rules;

CREATE POLICY "rules_select_own" ON public.rules FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "rules_insert_own" ON public.rules FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "rules_update_own" ON public.rules FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "rules_delete_own" ON public.rules FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 7. Update the updated_at trigger for renamed tables
-- ============================================

DROP TRIGGER IF EXISTS trg_decisions_updated_at ON public.rulebooks;
CREATE TRIGGER trg_rulebooks_updated_at
  BEFORE UPDATE ON public.rulebooks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_decision_rules_updated_at ON public.rules;
CREATE TRIGGER trg_rules_updated_at
  BEFORE UPDATE ON public.rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
