export default function Loading() {
  return (
    <div className="min-h-full">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-[var(--muted)] rounded animate-pulse" />
          <div className="h-4 w-64 bg-[var(--muted)] rounded animate-pulse" />
          <div className="h-32 bg-[var(--muted)] rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[var(--muted)] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
