import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, Sparkles, User, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { usePreferences } from '@/hooks/use-preferences';
import {
  getPersonalizedRecommendations,
  getTrendingArticles,
  getCategoryRecommendations
} from '@/lib/services/recommendation-service';
import type { Article } from '@/types/database';

// Helper function to format date in Bengali
const formatDateBengali = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Helper function to estimate reading time in Bengali
const getReadingTime = (content: string): string => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const bengaliMinutes = minutes.toString().split('').map(d => bengaliNumerals[parseInt(d)]).join('');
  return `${bengaliMinutes} মিনিট`;
};

const ArticleCard = ({ article, badge }: { article: Article; badge?: string }) => (
  <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
    <Link to={`/article/${article.slug || article.id}`}>
      <div className="relative overflow-hidden">
        <img
          src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'}
          alt={article.title}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {badge && (
          <Badge className="absolute top-2 right-2 bg-primary/90">{badge}</Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDateBengali(article.publish_date)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getReadingTime(article.content)}
          </span>
        </div>
      </div>
    </Link>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-card rounded-lg overflow-hidden shadow-sm">
    <Skeleton className="w-full h-40" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const PersonalizedFeed = () => {
  const { user } = useAuth();
  const { recommendedContent } = usePreferences();
  const [personalizedArticles, setPersonalizedArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personalized');

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        const [trending] = await Promise.all([
          getTrendingArticles(8)
        ]);
        setTrendingArticles(trending);

        if (user && recommendedContent) {
          const [personalized, category] = await Promise.all([
            getPersonalizedRecommendations(user.id, 8),
            getCategoryRecommendations(user.id, 8)
          ]);
          setPersonalizedArticles(personalized);
          setCategoryArticles(category);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [user, recommendedContent]);

  // If user is not logged in or personalization is off, show trending only
  if (!user || !recommendedContent) {
    return (
      <section className="news-container mb-10">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">ট্রেন্ডিং খবর</h2>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                badge={index < 3 ? `#${index + 1}` : undefined}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="news-container mb-10">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">আপনার জন্য বাছাই করা</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-muted">
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            ব্যক্তিগতকৃত
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            ট্রেন্ডিং
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            পছন্দের বিভাগ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personalized" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : personalizedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {personalizedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">আরও পড়ুন, আরও সুপারিশ পান</h3>
              <p className="text-muted-foreground mb-4">
                যত বেশি খবর পড়বেন, আমরা তত ভালো সুপারিশ দিতে পারব।
              </p>
              <Link to="/category/latest">
                <Button>সর্বশেষ খবর দেখুন</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  badge={index < 3 ? `#${index + 1}` : undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : categoryArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoryArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">পছন্দের বিভাগ নির্ধারণ করুন</h3>
              <p className="text-muted-foreground">
                বিভিন্ন বিভাগের খবর পড়লে আমরা আপনার পছন্দ বুঝতে পারব।
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default PersonalizedFeed;
