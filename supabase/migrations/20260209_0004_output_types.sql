-- ============================================
-- Output Types Migration
-- Adds pass_flag_fail and risk_level output types
-- Expands rule result values for new verdict schemes
-- ============================================

-- Update schemas.output_type constraint
ALTER TABLE public.schemas DROP CONSTRAINT IF EXISTS schemas_output_type_check;
ALTER TABLE public.schemas ADD CONSTRAINT schemas_output_type_check
  CHECK (output_type IN ('pass_fail', 'pass_flag_fail', 'risk_level'));

-- Update decision_rules.result constraint to support all verdict types
ALTER TABLE public.decision_rules DROP CONSTRAINT IF EXISTS decision_rules_result_check;
ALTER TABLE public.decision_rules ADD CONSTRAINT decision_rules_result_check
  CHECK (result IN ('pass', 'fail', 'flag', 'low', 'medium', 'high', 'critical'));
