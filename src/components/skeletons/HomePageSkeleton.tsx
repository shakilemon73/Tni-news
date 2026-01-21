import { Skeleton } from "@/components/ui/skeleton";

export const HomePageSkeleton = () => {
  return (
    <div className="py-4 sm:py-6 animate-pulse">
      {/* Hero Section Skeleton */}
      <section className="news-container mb-6 sm:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Featured Article Skeleton */}
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-lg">
              <Skeleton className="w-full h-[250px] sm:h-[300px] md:h-[400px]" />
              <div className="absolute bottom-0 p-4 sm:p-6 w-full space-y-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Side Articles Skeleton */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 sm:gap-3">
                <Skeleton className="col-span-1 h-20 sm:h-24 rounded-md" />
                <div className="col-span-2 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Tabbed Section Skeleton */}
      <section className="news-container mb-8 sm:mb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Skeleton className="h-7 w-24" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-md" />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </section>
      
      {/* Categories Grid Skeleton */}
      <section className="news-container mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  );
};

export const ArticleCardSkeleton = () => {
  return (
    <div className="bg-card rounded-md shadow p-3 sm:p-4 space-y-3">
      <Skeleton className="w-full h-40 rounded-md" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

export default HomePageSkeleton;
