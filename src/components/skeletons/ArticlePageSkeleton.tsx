import { Skeleton } from "@/components/ui/skeleton";

export const ArticlePageSkeleton = () => {
  return (
    <div className="py-4 sm:py-6 animate-pulse">
      <article className="news-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            
            {/* Title */}
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            
            {/* Meta */}
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            {/* Featured Image */}
            <Skeleton className="w-full h-[300px] md:h-[400px] rounded-lg mb-6" />
            
            {/* Content Paragraphs */}
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-card rounded-lg p-4 space-y-4">
              <Skeleton className="h-6 w-32" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
};

export default ArticlePageSkeleton;
