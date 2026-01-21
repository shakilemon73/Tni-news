import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Settings, Bookmark, Clock, LogOut, Newspaper, 
  TrendingUp, Bell, ChevronRight, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserDashboardSkeleton } from '@/components/skeletons';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface RecentArticle {
  id: string;
  title: string;
  featured_image: string | null;
  publish_date: string;
  category_ids: string[];
}

const UserDashboard = () => {
  const { user, profile, role, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    todayArticles: 0
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch recent articles
  useEffect(() => {
    const fetchRecentArticles = async () => {
      try {
        const { data, error, count } = await supabase
          .from('articles')
          .select('id, title, featured_image, publish_date, category_ids', { count: 'exact' })
          .eq('status', 'published')
          .order('publish_date', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentArticles(data || []);
        
        // Get today's articles count
        const today = new Date().toISOString().split('T')[0];
        const { count: todayCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')
          .gte('publish_date', today);
        
        setStats({
          totalArticles: count || 0,
          todayArticles: todayCount || 0
        });
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    if (user) {
      fetchRecentArticles();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500 hover:bg-red-600">অ্যাডমিন</Badge>;
      case 'editor':
        return <Badge className="bg-blue-500 hover:bg-blue-600">সম্পাদক</Badge>;
      case 'reader':
      default:
        return <Badge variant="secondary">পাঠক</Badge>;
    }
  };

  if (authLoading) {
    return <UserDashboardSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="news-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-semibold text-lg">{profile?.full_name || 'ব্যবহারকারী'}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2">{getRoleBadge()}</div>
              </div>
              
              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/dashboard">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    ড্যাশবোর্ড
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    প্রোফাইল
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/profile?tab=saved">
                    <Bookmark className="h-4 w-4 mr-2" />
                    সংরক্ষিত খবর
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/profile?tab=history">
                    <Clock className="h-4 w-4 mr-2" />
                    পড়ার ইতিহাস
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/profile?tab=settings">
                    <Settings className="h-4 w-4 mr-2" />
                    সেটিংস
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  লগআউট
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Section */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">
                স্বাগতম, {profile?.full_name || 'পাঠক'}! 👋
              </CardTitle>
              <CardDescription>
                আজকের তারিখ: {format(new Date(), 'dd MMMM, yyyy', { locale: bn })}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">মোট খবর</CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalArticles}</div>
                <p className="text-xs text-muted-foreground">প্রকাশিত সংবাদ</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">আজকের খবর</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayArticles}</div>
                <p className="text-xs text-muted-foreground">নতুন সংবাদ</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">বিজ্ঞপ্তি</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">অপঠিত বিজ্ঞপ্তি</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Articles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>সাম্প্রতিক সংবাদ</CardTitle>
                <CardDescription>আজকের সর্বশেষ খবর</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  সব দেখুন <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingArticles ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-20 h-16 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentArticles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">কোনো সংবাদ পাওয়া যায়নি</p>
              ) : (
                <div className="space-y-4">
                  {recentArticles.map((article) => (
                    <Link 
                      key={article.id} 
                      to={`/article/${article.id}`}
                      className="flex gap-4 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-20 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        {article.featured_image ? (
                          <img 
                            src={article.featured_image} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Newspaper className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(article.publish_date), 'dd MMM, yyyy', { locale: bn })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/category/bangladesh">
                <Newspaper className="h-6 w-6 mb-2" />
                বাংলাদেশ
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/category/international">
                <TrendingUp className="h-6 w-6 mb-2" />
                আন্তর্জাতিক
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/category/sports">
                <Bookmark className="h-6 w-6 mb-2" />
                খেলা
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/videos">
                <Clock className="h-6 w-6 mb-2" />
                ভিডিও
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
