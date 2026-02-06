import { AppLayout } from '@/app/components/AppLayout';

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
