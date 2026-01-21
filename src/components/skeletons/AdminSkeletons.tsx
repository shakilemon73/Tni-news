import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Dashboard Skeleton
export const AdminDashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl" />
              <div>
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Quick Action Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 mt-2" />
                <Skeleton className="h-4 w-28 mt-1" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Articles Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="flex justify-between items-start gap-3 py-2">
                <div className="flex-1">
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Media Library Skeleton
export const AdminMediaSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Search & View Toggle */}
    <div className="flex gap-4 items-center">
      <Skeleton className="h-10 flex-1 max-w-md" />
      <div className="flex gap-1">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>

    {/* Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square" />
          <CardContent className="p-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-12 mt-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Videos Skeleton
export const AdminVideosSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video" />
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Analytics Skeleton
export const AdminAnalyticsSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <Skeleton className="h-10 w-36" />
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px]" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Additional Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Skeleton className="h-10 w-16 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto mt-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Settings Skeleton
export const AdminSettingsSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Tabs */}
    <Skeleton className="h-10 w-full max-w-lg" />

    {/* Content Card */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56 mt-1" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

// Article Editor Skeleton
export const AdminArticleEditorSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <Skeleton className="h-10 w-28" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Form */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// Articles Table Skeleton
export const AdminArticlesTableSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <Skeleton className="h-10 w-36" />
    </div>

    {/* Filters */}
    <div className="flex flex-col sm:flex-row gap-4">
      <Skeleton className="h-10 flex-1 max-w-md" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Table */}
    <Card>
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 p-4 border-b bg-muted/30">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          {/* Table Rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b items-center">
              <Skeleton className="h-4 w-4" />
              <div className="col-span-2 flex items-center gap-3">
                <Skeleton className="h-12 w-16 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

export default {
  AdminDashboardSkeleton,
  AdminMediaSkeleton,
  AdminVideosSkeleton,
  AdminAnalyticsSkeleton,
  AdminSettingsSkeleton,
  AdminArticleEditorSkeleton,
  AdminArticlesTableSkeleton
};
