import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { getArticlesByCategory, getFeaturedArticles } from '@/lib/services/article-service';
import { useCategories } from '@/hooks/use-categories';
import { getPublishedVideoPosts } from '@/lib/services/video-service';
import { getLatestEPaper, type EPaper } from '@/lib/services/epaper-service';
import PersonalizedFeed from '@/components/PersonalizedFeed';
import PopularArticles from '@/components/PopularArticles';
import AdBanner from '@/components/AdBanner';
import SponsoredContent from '@/components/SponsoredContent';
import { ArticleCard, BookmarkButton, ShareButton, formatDateBengali, getReadingTime } from '@/components/ArticleCard';
import { HomePageSkeleton } from '@/components/skeletons/HomePageSkeleton';
import type { Article, Category, VideoPost } from '@/types/database';

const HomePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [latestEPaper, setLatestEPaper] = useState<EPaper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>('latest');
  const [tabCategoryArticles, setTabCategoryArticles] = useState<Record<string, Article[]>>({});
  const [loadingTabs, setLoadingTabs] = useState<Record<string, boolean>>({});

  // Use React Query for categories
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [articlesData, videosData, epaperData] = await Promise.all([
          getFeaturedArticles(10),
          getPublishedVideoPosts(3),
          getLatestEPaper()
        ]);
        
        setArticles(articlesData as Article[]);
        setVideos(videosData);
        setLatestEPaper(epaperData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Update category map when categories change
  useEffect(() => {
    if (categories.length > 0) {
      const catMap: Record<string, string> = {};
      categories.forEach((cat: Category) => {
        catMap[cat.id] = cat.name;
      });
      setCategoryMap(catMap);
    }
  }, [categories]);

  // Get category name from first category_id
  const getCategoryName = (article: Article): string => {
    if (article.category_ids && article.category_ids.length > 0) {
      return categoryMap[article.category_ids[0]] || 'সাধারণ';
    }
    return 'সাধারণ';
  };

  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 4);
  const tabArticles = articles.slice(1);

  // Tab categories - memoized to prevent rerenders
  const tabCategories = useMemo(() => {
    const cats = categories.slice(0, 5);
    return [
      { id: 'latest', name: 'সর্বশেষ', slug: 'latest' },
      ...cats.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
    ];
  }, [categories]);

  const handleTabChange = async (value: string) => {
    setActiveTab(value);

    if (value === 'latest') return;
    if (tabCategoryArticles[value]) return;

    setLoadingTabs((prev) => ({ ...prev, [value]: true }));
    try {
      const data = await getArticlesByCategory(value, 6);
      setTabCategoryArticles((prev) => ({ ...prev, [value]: data as Article[] }));
    } catch (error) {
      console.error('Error loading category articles:', error);
      setTabCategoryArticles((prev) => ({ ...prev, [value]: [] }));
    } finally {
      setLoadingTabs((prev) => ({ ...prev, [value]: false }));
    }
  };
  // Show skeleton while loading
  if (isLoading || categoriesLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="py-4 sm:py-6">
      {/* Hero Section - Dieter Rams: Innovative & Useful */}
      {featuredArticle && (
        <section className="news-container mb-6 sm:mb-8" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="sr-only">প্রধান সংবাদ</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Main Featured Article - Aarron Walter: Delightful */}
            <article className="lg:col-span-8">
              <Link 
                to={`/article/${featuredArticle.slug || featuredArticle.id}`}
                aria-label={`পড়ুন: ${featuredArticle.title}`}
              >
                <div className="relative group overflow-hidden rounded-lg clickable-card">
                  <img 
                    src={featuredArticle.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
                    alt=""
                    className="w-full h-[250px] sm:h-[300px] md:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="absolute bottom-0 p-4 sm:p-6 w-full">
                      {/* Category Badge - Steve Krug: Clear Navigation */}
                      <span className="text-xs font-semibold px-3 py-1 bg-primary text-primary-foreground rounded-full mb-3 inline-block animate-fade-in">
                        {getCategoryName(featuredArticle)}
                      </span>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                        {featuredArticle.title}
                      </h3>
                      <p className="text-white/80 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                      {/* Meta Info - Susan Weinschenk: Scannable */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center text-white/70 text-xs sm:text-sm gap-2">
                          <time dateTime={featuredArticle.publish_date}>
                            {formatDateBengali(featuredArticle.publish_date)}
                          </time>
                          <span className="text-white/40">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getReadingTime(featuredArticle.content)}
                          </span>
                        </div>
                        {/* Actions - Don Norman: Clear Affordances */}
                        <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                          <BookmarkButton 
                            articleId={featuredArticle.id} 
                            variant="ghost" 
                            className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9 touch-target" 
                          />
                          <ShareButton 
                            title={featuredArticle.title} 
                            variant="ghost" 
                            className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9 touch-target" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
            
            {/* Side Articles - Julie Zhuo: Consistent Patterns */}
            <div className="lg:col-span-4 space-y-3 sm:space-y-4">
              {sideArticles.map((article, index) => (
                <article 
                  key={article.id} 
                  className="grid grid-cols-3 gap-2 sm:gap-3 group stagger-item"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="col-span-1">
                    <Link to={`/article/${article.slug || article.id}`} aria-label={`পড়ুন: ${article.title}`}>
                      <img 
                        src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
                        alt=""
                        className="w-full h-20 sm:h-24 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <span className="text-xs text-primary font-medium">
                      {getCategoryName(article)}
                    </span>
                    <h3 className="text-sm sm:text-base font-medium mb-1 group-hover:text-primary line-clamp-2 transition-colors duration-200">
                      <Link to={`/article/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <div className="flex items-center text-muted-foreground text-xs gap-1">
                      <time dateTime={article.publish_date}>{formatDateBengali(article.publish_date)}</time>
                      <span className="hidden sm:inline text-muted-foreground/40">•</span>
                      <span className="hidden sm:flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getReadingTime(article.content)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
              
              {/* More Link - Alan Cooper: Goal-Oriented */}
              <Link to="/category/latest" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group">
                আরও খবর 
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Top Ad Banner */}
      <AdBanner position="homepage" slot="top" className="news-container mb-6" />

      {/* Personalized Feed Section */}
      <PersonalizedFeed />
      
      {/* Popular/Most Read Articles Section */}
      <PopularArticles />
      
      {/* Tabbed News Section */}
      {tabArticles.length > 0 && (
        <section className="news-container mb-8 sm:mb-10">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">সংবাদ</h2>
              <TabsList className="bg-muted overflow-x-auto flex-nowrap justify-start w-full sm:w-auto">
                {tabCategories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm whitespace-nowrap">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {tabCategories.map((category) => {
              const articlesForTab =
                category.id === 'latest'
                  ? tabArticles.slice(0, 6)
                  : (tabCategoryArticles[category.id] ?? []);

              const isTabLoading = !!loadingTabs[category.id];

              return (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  {isTabLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="bg-card rounded-lg overflow-hidden border">
                          <Skeleton className="h-48 w-full" />
                          <div className="p-4 space-y-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-5/6" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {articlesForTab.length > 0 ? (
                        articlesForTab.map((article) => (
                          <ArticleCard 
                            key={article.id} 
                            article={article}
                            categoryName={getCategoryName(article)}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                          এই বিভাগে কোনো সংবাদ নেই
                        </div>
                      )}
                    </div>
                  )}

                  {!isTabLoading && articlesForTab.length > 0 && (
                    <div className="mt-6 sm:mt-8 text-center">
                      <Link to={`/category/${category.slug}`}>
                        <Button variant="outline" className="px-4 sm:px-6">
                          আরও দেখুন <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </section>
      )}

      {/* Middle Ad Banner */}
      <AdBanner position="homepage" slot="middle" className="news-container mb-8" />

      {/* Sponsored Content Section */}
      <SponsoredContent />
      
      {/* E-Paper Promo Section */}
      <section className="bg-primary text-primary-foreground py-8 sm:py-12 mb-8 sm:mb-10">
        <div className="news-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                {latestEPaper ? `ই-পেপার - ${latestEPaper.title}` : 'আজকের ই-পেপার'}
              </h2>
              <p className="text-primary-foreground/80 mb-4 sm:mb-6 text-sm sm:text-base">
                আমাদের ডিজিটাল সংস্করণে আজকের সকল খবর, বিশ্লেষণ, ও বিশেষ প্রতিবেদন পড়ুন। সম্পূর্ণ পেপারটি আপনার যেকোনো ডিভাইসে সহজে পড়তে পারেন।
              </p>
              <Link to="/epaper">
                <Button variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                  ই-পেপার পড়ুন <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="flex justify-center order-first lg:order-last">
              <Link to="/epaper" className="max-w-[200px] sm:max-w-[300px] shadow-xl transform rotate-3 hover:-rotate-1 transition-transform duration-300 block">
                <img 
                  src={latestEPaper?.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
                  alt={latestEPaper?.title || 'আজকের ই-পেপার'}
                  className="w-full h-auto border-4 sm:border-8 border-background rounded"
                  loading="lazy"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Grid Section */}
      <section className="news-container mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">বিভাগ অনুযায়ী</h2>
          <Link to="/categories">
            <Button variant="link" className="font-semibold hover:text-primary flex items-center text-sm">
              সব বিভাগ <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((category) => {
            // Use database image if available, else use fallback
            const categoryImage = category.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c';
            
            return (
              <Link 
                key={category.id} 
                to={`/category/${category.slug}`}
                className="relative group overflow-hidden rounded-lg aspect-video"
              >
                <img 
                  src={categoryImage} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <h3 className="text-white font-semibold p-3 sm:p-4 text-sm sm:text-base transition-transform duration-300 group-hover:translate-y-[-5px]">
                    {category.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      
      {/* Video Section */}
      {videos.length > 0 && (
        <section className="bg-muted py-8 sm:py-10 mb-8 sm:mb-10">
          <div className="news-container">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">ভিডিও</h2>
              <Link to="/videos">
                <Button variant="link" className="font-semibold hover:text-primary flex items-center text-sm">
                  সব ভিডিও <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {videos.map((video) => (
                <Link 
                  key={video.id} 
                  to={`/videos?v=${video.id}`}
                  className="bg-card rounded-lg overflow-hidden shadow group cursor-pointer block"
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={video.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
                      alt={video.title}
                      className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                      <div className="bg-primary p-3 sm:p-4 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">{video.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-2 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                      <span>{formatDateBengali(video.publish_date)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Newsletter Subscription */}
      <section className="news-container mb-8 sm:mb-10">
        <div className="bg-muted rounded-lg p-6 sm:p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">আমাদের নিউজলেটার</h2>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
              প্রতিদিনের সেরা খবর, বিশ্লেষণ এবং বিশেষ প্রতিবেদন আপনার ইমেইলে পেতে সাবস্ক্রাইব করুন।
            </p>
            <form className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="আপনার ইমেইল"
                className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm sm:text-base"
                required
              />
              <Button type="submit" className="w-full sm:w-auto">
                সাবস্ক্রাইব
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Bottom Ad Banner */}
      <AdBanner position="homepage" slot="bottom" className="news-container mb-8" />

      {/* Empty State */}
      {articles.length === 0 && !isLoading && (
        <div className="news-container text-center py-20">
          <p className="text-muted-foreground text-lg">কোনো সংবাদ পাওয়া যায়নি</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
