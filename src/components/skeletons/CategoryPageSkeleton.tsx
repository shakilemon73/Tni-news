import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCardSkeleton } from "./HomePageSkeleton";

export const CategoryPageSkeleton = () => {
  return (
    <div className="py-4 sm:py-6 animate-pulse">
      <div className="news-container">
        {/* Category Header */}
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        
        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPageSkeleton;
