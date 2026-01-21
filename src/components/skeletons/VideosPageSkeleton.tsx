import { Skeleton } from "@/components/ui/skeleton";

export const VideoCardSkeleton = () => (
  <div className="bg-card rounded-lg overflow-hidden shadow">
    <Skeleton className="w-full h-48" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

export const VideosPageSkeleton = () => {
  return (
    <div className="news-container py-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default VideosPageSkeleton;
