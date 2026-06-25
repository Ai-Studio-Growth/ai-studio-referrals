import { Skeleton } from '@/components/ui';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-72" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-44" />
          <Skeleton className="h-52" />
        </div>
      </div>
    </div>
  );
}
