import { Skeleton } from '@/components/ui';

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg bg-mesh px-6">
      <div className="w-full max-w-md space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
