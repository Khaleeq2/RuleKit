import { AppLayout } from '@/app/components/AppLayout';

export default function DecisionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
