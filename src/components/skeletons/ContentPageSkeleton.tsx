import { Skeleton } from "@/components/ui/skeleton";

// Generic skeleton for content pages like Privacy Policy, Terms, Newsletter, Subscription, Podcasts
export const ContentPageSkeleton = () => {
  return (
    <div className="news-container py-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {/* Content */}
      <div className="prose max-w-none space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        
        <div className="py-4" />
        
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
        
        <div className="py-4" />
        
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
      </div>
    </div>
  );
};

export default ContentPageSkeleton;
