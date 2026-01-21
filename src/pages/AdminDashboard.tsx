import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  FileText,
  MessageCircle,
  Users,
  RefreshCw,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  PenSquare,
  AlertCircle,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { AdminDashboardSkeleton } from '@/components/skeletons/AdminSkeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getDashboardStats, getRecentArticles, getPopularArticles, getFilteredDashboardStats, getReadingStats, type RecentArticle, type DashboardStats } from '@/lib/services/analytics-service';
import { getCategories } from '@/lib/services/category-service';
import { Category } from '@/types/database';

type DateRange = 'today' | 'week' | 'month' | 'year' | 'all';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    totalArticles: 0,
    totalComments: 0,
    totalUsers: 0,
    pendingComments: 0,
    draftArticles: 0,
    publishedArticles: 0
  });
  const [readingStats, setReadingStats] = useState<{ totalReads: number; uniqueArticles: number }>({ totalReads: 0, uniqueArticles: 0 });
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [popularArticles, setPopularArticles] = useState<RecentArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const getDateRangeFilter = (): { startDate: Date; endDate: Date } | null => {
    const now = new Date();
    const endDate = new Date(now);
    
    switch (dateRange) {
      case 'today':
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        return { startDate: startOfDay, endDate };
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { startDate: weekAgo, endDate };
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { startDate: monthAgo, endDate };
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return { startDate: yearAgo, endDate };
      case 'all':
      default:
        return null;
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const dateFilter = getDateRangeFilter();
      
      // For "all" time, use getDashboardStats; for filtered, use getFilteredDashboardStats
      const statsPromise = dateFilter 
        ? getFilteredDashboardStats(dateFilter.startDate, dateFilter.endDate)
        : getDashboardStats();
      
      // Reading stats only for filtered date ranges
      const readingPromise = dateFilter 
        ? getReadingStats(dateFilter.startDate, dateFilter.endDate)
        : Promise.resolve({ totalReads: 0, uniqueArticles: 0 });
      
      const [statsData, readingData, recent, popular, cats] = await Promise.all([
        statsPromise,
        readingPromise,
        getRecentArticles(5),
        getPopularArticles(5),
        getCategories()
      ]);
      
      setStats(statsData);
      setReadingStats(readingData);
      setRecentArticles(recent);
      setPopularArticles(popular);
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryIds: string[] | null) => {
    if (!categoryIds || categoryIds.length === 0) return 'অন্যান্য';
    const cat = categories.find(c => c.id === categoryIds[0]);
    return cat?.name || 'অন্যান্য';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)} লাখ`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)} হাজার`;
    return num.toString();
  };

  const getDateRangeLabel = (range: DateRange): string => {
    switch (range) {
      case 'today': return 'আজ';
      case 'week': return 'সাপ্তাহিক';
      case 'month': return 'মাসিক';
      case 'year': return 'বার্ষিক';
      case 'all': return 'সর্বকালীন';
    }
  };

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground mt-1">
            {getDateRangeLabel(dateRange)} পরিসংখ্যান
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
            <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
            <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
              <SelectTrigger className="w-[130px] border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="সময়সীমা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">আজ</SelectItem>
                <SelectItem value="week">সাপ্তাহিক</SelectItem>
                <SelectItem value="month">মাসিক</SelectItem>
                <SelectItem value="year">বার্ষিক</SelectItem>
                <SelectItem value="all">সর্বকালীন</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchData}
            className="h-10 w-10"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">{formatNumber(stats.totalViews)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getDateRangeLabel(dateRange)} ভিউ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">{stats.totalUsers}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {dateRange === 'all' ? 'মোট ব্যবহারকারী' : 'নতুন ব্যবহারকারী'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">{stats.totalArticles}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {dateRange === 'all' ? 'মোট আর্টিকেল' : 'নতুন আর্টিকেল'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">{stats.totalComments}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {dateRange === 'all' ? 'মোট মন্তব্য' : 'নতুন মন্তব্য'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Reading Activity Stats - Only show when date filtered */}
      {dateRange !== 'all' && (
        <Card className="border-dashed">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">পাঠক কার্যকলাপ ({getDateRangeLabel(dateRange)})</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{readingStats.totalReads}</p>
                <p className="text-sm text-muted-foreground">পড়া হয়েছে</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{readingStats.uniqueArticles}</p>
                <p className="text-sm text-muted-foreground">অনন্য আর্টিকেল</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800/50 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/comments')}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">মডারেশন প্রয়োজন</span>
                </div>
                <p className="text-3xl font-bold text-amber-800 dark:text-amber-300 mt-2">{stats.pendingComments}</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">অপেক্ষমান মন্তব্য</p>
              </div>
              <ArrowRight className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800/50 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/articles')}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <PenSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">সম্পাদনা বাকি</span>
                </div>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-300 mt-2">{stats.draftArticles}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">খসড়া আর্টিকেল</p>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-emerald-200 dark:border-emerald-800/50 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/articles')}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">লাইভ</span>
                </div>
                <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-300 mt-2">{stats.publishedArticles}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">প্রকাশিত আর্টিকেল</p>
              </div>
              <ArrowRight className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent & Popular Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">সাম্প্রতিক আর্টিকেল</CardTitle>
              </div>
              <Badge variant="secondary" className="font-normal">
                সর্বশেষ ৫টি
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            {recentArticles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground">কোন আর্টিকেল নেই</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentArticles.map((article) => (
                  <li key={article.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium line-clamp-1 text-sm">{article.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{formatDate(article.created_at)}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs font-normal">
                            {getCategoryName(article.category_ids)}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="shrink-0 h-8 text-xs"
                        onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                      >
                        সম্পাদনা
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter className="pt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/admin/articles')}
            >
              সব আর্টিকেল দেখুন
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">জনপ্রিয় আর্টিকেল</CardTitle>
              </div>
              <Badge variant="secondary" className="font-normal">
                সর্বাধিক ভিউ
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            {popularArticles.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground">কোন ডেটা নেই</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {popularArticles.map((article, index) => (
                  <li key={article.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className={`
                          flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0
                          ${index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 
                            index === 1 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                            index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400' :
                            'bg-muted text-muted-foreground'}
                        `}>
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium line-clamp-1 text-sm">{article.title}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatNumber(article.views)}
                            </span>
                            <span>•</span>
                            <span>{getCategoryName(article.category_ids)}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="shrink-0 h-8 text-xs"
                        onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                      >
                        সম্পাদনা
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter className="pt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/admin/analytics')}
            >
              পরিসংখ্যান দেখুন
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
