import { Card } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-full">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <Skeleton className="h-3 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <Skeleton className="h-11 w-full max-w-xl rounded-md" />
          <Skeleton className="h-11 w-full md:w-[240px] rounded-md" />
          <Skeleton className="h-11 w-full md:w-[180px] rounded-md" />
          <Skeleton className="h-11 w-full md:w-[160px] rounded-md" />
        </div>

        <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden">
          <div className="hidden md:grid grid-cols-[24px_120px_1fr_92px_80px_90px_80px_24px] gap-4 items-center px-4 py-3 bg-[var(--muted)]/50">
            <span />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-14 ml-auto" />
            <Skeleton className="h-3 w-14 ml-auto" />
            <span />
          </div>
          <div className="divide-y divide-[var(--border)]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[24px_120px_1fr_92px_80px_90px_80px_24px] gap-4 items-center px-4 py-4"
              >
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <div className="min-w-0">
                  <Skeleton className="h-4 w-56 mb-2" />
                  <Skeleton className="h-3 w-[70%]" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full hidden md:block" />
                <Skeleton className="h-5 w-16 rounded-full hidden md:block" />
                <Skeleton className="h-4 w-16 ml-auto hidden md:block" />
                <Skeleton className="h-4 w-12 ml-auto hidden md:block" />
                <Skeleton className="h-4 w-4 ml-auto hidden md:block" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
