import { useState, useEffect } from 'react';
import { TrendingUp, Eye, FileText, Users, BarChart3, RefreshCw, Calendar, PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AdminAnalyticsSkeleton } from '@/components/skeletons/AdminSkeletons';
import { 
  getDashboardStats, 
  getRecentArticles, 
  getPopularArticles, 
  getArticlesByCategory,
  getViewsOverTime 
} from '@/lib/services/analytics-service';
import { getCategories } from '@/lib/services/category-service';
import { Category } from '@/types/database';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(160, 60%, 45%)', 'hsl(45, 90%, 55%)', 'hsl(15, 80%, 55%)', 'hsl(270, 60%, 60%)', 'hsl(190, 70%, 50%)'];

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalArticles: 0,
    totalComments: 0,
    totalUsers: 0,
    pendingComments: 0,
    draftArticles: 0
  });
  const [viewsData, setViewsData] = useState<{ date: string; views: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; count: number }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [statsData, viewsTimeData, categoryStats, categoriesData] = await Promise.all([
        getDashboardStats(),
        getViewsOverTime(),
        getArticlesByCategory(),
        getCategories()
      ]);
      
      setStats(statsData);
      setViewsData(viewsTimeData);
      setCategories(categoriesData);
      
      // Map category IDs to names
      const categoryNameData = categoryStats.map(item => {
        const category = categoriesData.find(c => c.id === item.category_id);
        return {
          name: category?.name || 'অন্যান্য',
          count: item.count
        };
      });
      setCategoryData(categoryNameData);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('পরিসংখ্যান লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 100000) {
      return `${(num / 100000).toFixed(1)} লাখ`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)} হাজার`;
    }
    return num.toString();
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast.success('ডেটা রিফ্রেশ হয়েছে');
  };

  if (isLoading) {
    return <AdminAnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            পরিসংখ্যান
          </h1>
          <p className="text-muted-foreground mt-1">বিস্তারিত অ্যানালিটিক্স ও রিপোর্ট</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 min-h-[44px]"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          রিফ্রেশ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">{formatNumber(stats.totalViews)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">মোট ভিউ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">{stats.totalArticles}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">মোট আর্টিকেল</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">{stats.totalUsers}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">ব্যবহারকারী</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">{stats.totalComments}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">মোট মন্তব্য</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">ভিউ (সর্বশেষ ৩০ দিন)</CardTitle>
              </div>
              <Badge variant="secondary">দৈনিক</Badge>
            </div>
            <CardDescription>দৈনিক পাঠক সংখ্যা</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('bn-BD')}
                    formatter={(value: number) => [value, 'ভিউ']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">বিভাগ অনুযায়ী আর্টিকেল</CardTitle>
              </div>
              <Badge variant="secondary">বিতরণ</Badge>
            </div>
            <CardDescription>প্রতিটি বিভাগে আর্টিকেল সংখ্যা</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="count"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <PieChartIcon className="h-12 w-12 mb-2 opacity-50" />
                  <p>কোন ডেটা নেই</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800/50 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-amber-700 dark:text-amber-400">{stats.pendingComments}</p>
              <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">অপেক্ষমান মন্তব্য</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800/50 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">{stats.draftArticles}</p>
              <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">খসড়া আর্টিকেল</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-emerald-200 dark:border-emerald-800/50 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-400">
                {stats.totalArticles - stats.draftArticles}
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">প্রকাশিত আর্টিকেল</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
