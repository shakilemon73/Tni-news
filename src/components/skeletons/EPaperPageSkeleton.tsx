import { Skeleton } from "@/components/ui/skeleton";

export const EPaperPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="news-container">
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Skeleton className="h-8 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-9 w-48 rounded" />
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="border-b bg-muted/50 p-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <div className="hidden md:flex gap-2">
                  <Skeleton className="h-8 w-24 rounded" />
                  <Skeleton className="h-8 w-20 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* PDF Viewer Area */}
          <div className="min-h-[600px] p-4 flex justify-center bg-muted">
            <Skeleton className="w-full max-w-[1000px] h-[80vh] min-h-[800px] rounded" />
          </div>
        </div>

        {/* Archive Section */}
        <div className="mt-6 bg-card rounded-lg shadow-md p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EPaperPageSkeleton;
