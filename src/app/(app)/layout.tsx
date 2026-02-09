'use client';

import { AppLayout } from '@/app/components/AppLayout';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { TourProvider } from '@/app/components/TourProvider';

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
      <TourProvider>
        <AppLayout>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AppLayout>
      </TourProvider>
    </>
  );
}
