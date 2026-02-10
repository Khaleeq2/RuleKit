import { Card } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-full">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <Skeleton className="h-11 w-full max-w-xl rounded-md" />
          <Skeleton className="h-11 w-full md:w-[180px] rounded-md" />
        </div>

        <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_120px_120px_140px_72px] gap-4 px-4 py-3 bg-[var(--muted)]/50">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24 ml-auto" />
            <Skeleton className="h-3 w-20 ml-auto" />
            <span />
          </div>
          <div className="divide-y divide-[var(--border)]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_140px_72px] gap-4 items-center px-4 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-[70%]" />
                </div>
                <div className="hidden md:block">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="hidden md:flex justify-end">
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="hidden md:flex justify-end">
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="hidden md:flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
