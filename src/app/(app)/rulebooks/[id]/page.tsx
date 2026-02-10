'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// ============================================
// Rulebook landing — redirect to rules
// ============================================

export default function RulebookOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const rulebookId = params.id as string;

  useEffect(() => {
    router.replace(`/rulebooks/${rulebookId}/rules`);
  }, [router, rulebookId]);

  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="animate-pulse text-[var(--muted-foreground)]">Loading...</div>
    </div>
  );
}
