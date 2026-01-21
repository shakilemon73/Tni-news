import { Skeleton } from "@/components/ui/skeleton";

export const NavbarSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="bg-news-900 py-1.5 sm:py-2">
        <div className="news-container flex justify-between items-center">
          <Skeleton className="h-4 w-32 bg-white/20" />
          <Skeleton className="h-4 w-20 bg-white/20" />
        </div>
      </div>
      
      {/* Main Navbar Skeleton */}
      <div className="bg-background border-b">
        <div className="news-container py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-3 w-32 hidden sm:block" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Navigation Skeleton */}
        <div className="border-t hidden md:block">
          <div className="news-container py-2">
            <div className="flex items-center gap-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-16" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarSkeleton;
