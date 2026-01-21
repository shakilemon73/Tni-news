import { supabase } from '../supabase';

export interface DashboardStats {
  totalViews: number;
  totalArticles: number;
  totalComments: number;
  totalUsers: number;
  pendingComments: number;
  draftArticles: number;
  publishedArticles: number;
}

export interface RecentArticle {
  id: string;
  title: string;
  created_at: string;
  status: string;
  views: number;
  category_ids: string[] | null;
}

// Track a page view
export const trackPageView = async (
  articleId: string, 
  userId?: string, 
  sessionId?: string,
  referrer?: string
): Promise<void> => {
  try {
    await supabase
      .from('page_views')
      .insert({
        article_id: articleId,
        user_id: userId || null,
        session_id: sessionId || null,
        referrer: referrer || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
      });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Get dashboard statistics (all-time totals)
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Get total views from page_views table
  const { count: totalViews } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true });
  
  // Get articles stats
  const { data: articlesData } = await supabase
    .from('articles')
    .select('status');
  
  const totalArticles = (articlesData || []).length;
  const draftArticles = (articlesData || []).filter(a => a.status === 'draft').length;
  const publishedArticles = (articlesData || []).filter(a => a.status === 'published').length;
  
  // Get comments count
  const { data: commentsData } = await supabase
    .from('comments')
    .select('status');
  
  const totalComments = (commentsData || []).length;
  const pendingComments = (commentsData || []).filter(c => c.status === 'pending').length;
  
  // Get users count from profiles
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  return {
    totalViews: totalViews || 0,
    totalArticles,
    totalComments,
    totalUsers: usersCount || 0,
    pendingComments,
    draftArticles,
    publishedArticles
  };
};

// Get dashboard statistics filtered by date range using page_views table
export const getFilteredDashboardStats = async (startDate: Date, endDate: Date): Promise<DashboardStats> => {
  const startISO = startDate.toISOString();
  const endISO = endDate.toISOString();
  
  // Get page views within date range
  const { count: totalViews } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('viewed_at', startISO)
    .lte('viewed_at', endISO);
  
  // Get articles created within date range
  const { data: articlesData } = await supabase
    .from('articles')
    .select('status, created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO);
  
  const totalArticles = (articlesData || []).length;
  const draftArticles = (articlesData || []).filter(a => a.status === 'draft').length;
  const publishedArticles = (articlesData || []).filter(a => a.status === 'published').length;
  
  // Get comments created within date range
  const { data: commentsData } = await supabase
    .from('comments')
    .select('status, created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO);
  
  const totalComments = (commentsData || []).length;
  const pendingComments = (commentsData || []).filter(c => c.status === 'pending').length;
  
  // Get users registered within date range
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startISO)
    .lte('created_at', endISO);
  
  return {
    totalViews: totalViews || 0,
    totalArticles,
    totalComments,
    totalUsers: usersCount || 0,
    pendingComments,
    draftArticles,
    publishedArticles
  };
};

// Get recent articles (always latest regardless of filter)
export const getRecentArticles = async (limit: number = 5): Promise<RecentArticle[]> => {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, created_at, status, views, category_ids')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data as RecentArticle[]) || [];
};

// Get popular articles (top viewed)
export const getPopularArticles = async (limit: number = 5): Promise<RecentArticle[]> => {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, created_at, status, views, category_ids')
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data as RecentArticle[]) || [];
};

// Get article count by category
export const getArticlesByCategory = async (): Promise<{ category_id: string; count: number }[]> => {
  const { data, error } = await supabase
    .from('articles')
    .select('category_ids');
  
  if (error) throw error;
  
  const categoryCount: Record<string, number> = {};
  (data || []).forEach((article: { category_ids: string[] | null }) => {
    (article.category_ids || []).forEach(catId => {
      categoryCount[catId] = (categoryCount[catId] || 0) + 1;
    });
  });
  
  return Object.entries(categoryCount).map(([category_id, count]) => ({
    category_id,
    count
  }));
};

// Get reading/view stats for a date range
export const getReadingStats = async (startDate: Date, endDate: Date): Promise<{ totalReads: number; uniqueArticles: number }> => {
  const startISO = startDate.toISOString();
  const endISO = endDate.toISOString();
  
  const { data, error } = await supabase
    .from('page_views')
    .select('article_id')
    .gte('viewed_at', startISO)
    .lte('viewed_at', endISO);
  
  if (error) throw error;
  
  const uniqueArticles = new Set((data || []).map(r => r.article_id)).size;
  return {
    totalReads: (data || []).length,
    uniqueArticles
  };
};

// Get views over time (last 30 days) using page_views table
export const getViewsOverTime = async (): Promise<{ date: string; views: number }[]> => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Get page views for last 30 days
  const { data: viewsData } = await supabase
    .from('page_views')
    .select('view_date')
    .gte('view_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('view_date', { ascending: true });
  
  // Initialize all dates with 0
  const viewsByDate: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    viewsByDate[date.toISOString().split('T')[0]] = 0;
  }
  
  // Count views per date
  (viewsData || []).forEach(record => {
    if (record.view_date) {
      const date = typeof record.view_date === 'string' 
        ? record.view_date 
        : new Date(record.view_date).toISOString().split('T')[0];
      if (viewsByDate[date] !== undefined) {
        viewsByDate[date]++;
      }
    }
  });
  
  return Object.entries(viewsByDate).map(([date, views]) => ({
    date,
    views
  }));
};

// Get top viewed articles for a specific date range
export const getTopViewedArticles = async (startDate: Date, endDate: Date, limit: number = 5): Promise<{ articleId: string; views: number }[]> => {
  const startISO = startDate.toISOString();
  const endISO = endDate.toISOString();
  
  const { data } = await supabase
    .from('page_views')
    .select('article_id')
    .gte('viewed_at', startISO)
    .lte('viewed_at', endISO);
  
  // Count views per article
  const viewCounts: Record<string, number> = {};
  (data || []).forEach(record => {
    viewCounts[record.article_id] = (viewCounts[record.article_id] || 0) + 1;
  });
  
  // Sort by views and return top N
  return Object.entries(viewCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([articleId, views]) => ({ articleId, views }));
};
