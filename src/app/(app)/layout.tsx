'use client';

import { AppLayout } from '@/app/components/AppLayout';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

function NoIndex() {
  return <meta name="robots" content="noindex, nofollow" />;
}

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NoIndex />
      <AppLayout>
        <ErrorBoundary>{children}</ErrorBoundary>
      </AppLayout>
    </>
  );
}
