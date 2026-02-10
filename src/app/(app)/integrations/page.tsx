'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Integrations are handled per-rulebook via the API tab.
// Redirect to rulebooks to avoid a dead-end placeholder.
export default function IntegrationsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/rulebooks');
  }, [router]);

  return (
    <div className="min-h-full flex items-center justify-center">
      <p className="text-[var(--muted-foreground)] animate-pulse">Redirecting to Rulebooks…</p>
    </div>
  );
}
