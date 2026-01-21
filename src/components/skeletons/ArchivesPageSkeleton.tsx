import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ArchiveArticleSkeleton = () => (
  <Card>
    <CardContent className="py-4">
      <div className="flex gap-4">
        <Skeleton className="w-24 h-24 rounded flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ArchivesPageSkeleton = () => {
  return (
    <div className="news-container py-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Year Selection */}
              <div>
                <Skeleton className="h-4 w-12 mb-2" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-14 rounded" />
                  ))}
                </div>
              </div>
              {/* Month Selection */}
              <div>
                <Skeleton className="h-4 w-12 mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 rounded" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArchiveArticleSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivesPageSkeleton;
