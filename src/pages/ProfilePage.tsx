import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  User, Settings, Bookmark, Clock, LogOut, Camera, Save,
  Loader2, Mail, Calendar, Trash2, Newspaper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfilePageSkeleton } from '@/components/skeletons';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { 
  getSavedArticles, 
  unsaveArticle,
  getReadingHistory,
  clearReadingHistory,
  deleteReadingHistoryEntry,
  SavedArticleWithDetails,
  ReadingHistoryWithDetails
} from '@/lib/services/user-interaction-service';

const ProfilePage = () => {
  const { user, profile, role, isLoading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const defaultTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Profile form state
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  // Saved articles state
  const [savedArticles, setSavedArticles] = useState<SavedArticleWithDetails[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Reading history state
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryWithDetails[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  // Load saved articles when tab changes
  useEffect(() => {
    if (activeTab === 'saved' && user) {
      fetchSavedArticles();
    }
  }, [activeTab, user]);

  // Load reading history when tab changes
  useEffect(() => {
    if (activeTab === 'history' && user) {
      fetchReadingHistory();
    }
  }, [activeTab, user]);

  const fetchSavedArticles = async () => {
    if (!user) return;
    setIsLoadingSaved(true);
    try {
      const data = await getSavedArticles(user.id);
      setSavedArticles(data);
    } catch (error) {
      console.error('Error fetching saved articles:', error);
      toast.error('সংরক্ষিত খবর লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const fetchReadingHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const data = await getReadingHistory(user.id);
      setReadingHistory(data);
    } catch (error) {
      console.error('Error fetching reading history:', error);
      toast.error('পড়ার ইতিহাস লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRemoveSaved = async (articleId: string) => {
    if (!user) return;
    try {
      await unsaveArticle(user.id, articleId);
      setSavedArticles(prev => prev.filter(item => item.article_id !== articleId));
      toast.success('সংরক্ষণ থেকে সরানো হয়েছে');
    } catch (error) {
      console.error('Error removing saved article:', error);
      toast.error('সমস্যা হয়েছে');
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await deleteReadingHistoryEntry(id);
      setReadingHistory(prev => prev.filter(item => item.id !== id));
      toast.success('ইতিহাস থেকে সরানো হয়েছে');
    } catch (error) {
      console.error('Error deleting history item:', error);
      toast.error('সমস্যা হয়েছে');
    }
  };

  const handleClearAllHistory = async () => {
    if (!user) return;
    try {
      await clearReadingHistory(user.id);
      setReadingHistory([]);
      toast.success('সব ইতিহাস মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('সমস্যা হয়েছে');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return;
    
    setIsSaving(true);
    await updateProfile({ full_name: fullName });
    setIsSaving(false);
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

  // Not logged in state
  if (!isLoading && !user) {
    return (
      <div className="news-container py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">আপনার প্রোফাইল</h1>
          <p className="text-muted-foreground mb-6">
            আপনার পছন্দের খবর সংরক্ষণ করতে এবং ব্যক্তিগতকৃত অভিজ্ঞতা পেতে লগইন করুন।
          </p>
          <div className="space-y-3">
            <Button className="w-full" asChild>
              <Link to="/auth">লগইন করুন</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/auth?tab=signup">নতুন অ্যাকাউন্ট তৈরি করুন</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            অ্যাডমিন? <Link to="/admin/login" className="text-primary hover:underline">অ্যাডমিন প্যানেলে যান</Link>
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  const ArticleListItem = ({ 
    article, 
    date,
    onRemove 
  }: { 
    article: SavedArticleWithDetails['article'] | ReadingHistoryWithDetails['article'];
    date: string;
    onRemove: () => void;
  }) => {
    if (!article) return null;
    
    return (
      <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors group">
        <Link 
          to={`/article/${article.slug || article.id}`}
          className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0"
        >
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
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/article/${article.slug || article.id}`}>
            <h4 className="font-medium line-clamp-2 hover:text-primary transition-colors">
              {article.title}
            </h4>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(date), 'dd MMM yyyy, hh:mm a', { locale: bn })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="news-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90">
                    <Camera className="h-3 w-3" />
                  </button>
                </div>
                <h2 className="font-semibold mt-3">{profile?.full_name || 'ব্যবহারকারী'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-2">{getRoleBadge()}</div>
              </div>
              
              <nav className="space-y-1">
                <Button 
                  variant={activeTab === 'profile' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  প্রোফাইল
                </Button>
                <Button 
                  variant={activeTab === 'saved' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('saved')}
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  সংরক্ষিত খবর
                </Button>
                <Button 
                  variant={activeTab === 'history' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('history')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  পড়ার ইতিহাস
                </Button>
                <Button 
                  variant={activeTab === 'settings' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  সেটিংস
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
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="profile">প্রোফাইল</TabsTrigger>
              <TabsTrigger value="saved">সংরক্ষিত খবর</TabsTrigger>
              <TabsTrigger value="history">পড়ার ইতিহাস</TabsTrigger>
              <TabsTrigger value="settings">সেটিংস</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>প্রোফাইল তথ্য</CardTitle>
                  <CardDescription>আপনার ব্যক্তিগত তথ্য পরিবর্তন করুন</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">পূর্ণ নাম</Label>
                      <Input 
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="আপনার নাম"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">ইমেইল</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="pl-10 bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">অ্যাকাউন্ট তৈরির তারিখ</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.created_at 
                          ? format(new Date(profile.created_at), 'dd MMMM, yyyy', { locale: bn })
                          : 'অজানা'}
                      </p>
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        সংরক্ষণ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        পরিবর্তন সংরক্ষণ করুন
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="saved">
              <Card>
                <CardHeader>
                  <CardTitle>সংরক্ষিত খবর</CardTitle>
                  <CardDescription>আপনার সংরক্ষণ করা সংবাদ ({savedArticles.length}টি)</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSaved ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="w-24 h-16 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : savedArticles.length === 0 ? (
                    <div className="text-center py-12">
                      <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">আপনার কোনো সংরক্ষিত খবর নেই।</p>
                      <Button variant="outline" asChild>
                        <Link to="/">খবর পড়ুন</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedArticles.map((item) => (
                        <ArticleListItem 
                          key={item.id}
                          article={item.article}
                          date={item.created_at}
                          onRemove={() => handleRemoveSaved(item.article_id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>পড়ার ইতিহাস</CardTitle>
                    <CardDescription>আপনার পড়া সংবাদ ({readingHistory.length}টি)</CardDescription>
                  </div>
                  {readingHistory.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleClearAllHistory}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      সব মুছুন
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="w-24 h-16 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : readingHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">আপনার পড়ার ইতিহাস খালি।</p>
                      <Button variant="outline" asChild>
                        <Link to="/">খবর পড়ুন</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {readingHistory.map((item) => (
                        <ArticleListItem 
                          key={item.id}
                          article={item.article}
                          date={item.read_at}
                          onRemove={() => handleDeleteHistoryItem(item.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>সেটিংস</CardTitle>
                  <CardDescription>আপনার অ্যাকাউন্ট সেটিংস</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">পুশ নোটিফিকেশন</p>
                      <p className="text-sm text-muted-foreground">ব্রেকিং নিউজ এবং গুরুত্বপূর্ণ আপডেট পান</p>
                    </div>
                    <Switch 
                      checked={notifications} 
                      onCheckedChange={setNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">ইমেইল আপডেট</p>
                      <p className="text-sm text-muted-foreground">সাপ্তাহিক নিউজলেটার এবং বিশেষ অফার পান</p>
                    </div>
                    <Switch 
                      checked={emailUpdates} 
                      onCheckedChange={setEmailUpdates}
                    />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-destructive mb-2">বিপজ্জনক অঞ্চল</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      আপনার অ্যাকাউন্ট মুছে ফেললে সব ডেটা মুছে যাবে এবং পুনরুদ্ধার করা যাবে না।
                    </p>
                    <Button variant="destructive" size="sm">
                      অ্যাকাউন্ট মুছে ফেলুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
