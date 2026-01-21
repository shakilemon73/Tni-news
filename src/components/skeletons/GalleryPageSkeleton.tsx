import { Skeleton } from "@/components/ui/skeleton";

export const GalleryPageSkeleton = () => {
  return (
    <div className="news-container py-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="aspect-square rounded-lg" 
          />
        ))}
      </div>
    </div>
  );
};

export default GalleryPageSkeleton;
