'use client';

import { useParams } from 'next/navigation';
import { RuleEditor } from '../_components/RuleEditor';

export default function EditRulePage() {
  const params = useParams();
  const ruleId = params?.ruleId as string;

  return <RuleEditor ruleId={ruleId} />;
}
