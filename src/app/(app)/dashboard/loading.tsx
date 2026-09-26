import { Card, Skeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex items-center gap-4 p-5">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-4 h-44 w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mx-auto mt-4 h-40 w-40 rounded-full" />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="mt-4 h-32 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
