import { Skeleton } from "@/components/ui/skeleton";

export const SearchResultSkeleton = () => (
  <div className="flex gap-4 p-4 border rounded-lg">
    <Skeleton className="w-24 h-24 rounded flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

export const SearchPageSkeleton = () => {
  return (
    <div className="py-8">
      <div className="news-container">
        <div className="max-w-3xl mx-auto">
          {/* Search Form */}
          <div className="mb-8">
            <Skeleton className="h-12 w-full rounded-md" />
          </div>

          {/* Results Header */}
          <div className="mb-6 space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Results List */}
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SearchResultSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPageSkeleton;
