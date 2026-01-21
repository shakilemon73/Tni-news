import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Eye, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { formatDateBengali, getReadingTime, formatViewsBengali } from './ArticleCard';
import type { Article } from '@/types/database';

const PopularArticles = () => {
  const [articles24h, setArticles24h] = useState<Article[]>([]);
  const [articles7d, setArticles7d] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('24h');

  useEffect(() => {
    const loadPopularArticles = async () => {
      try {
        setIsLoading(true);
        
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch articles from last 24 hours sorted by views
        const { data: data24h, error: error24h } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .gte('publish_date', last24h)
          .order('views', { ascending: false })
          .limit(5);

        // Fetch articles from last 7 days sorted by views
        const { data: data7d, error: error7d } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .gte('publish_date', last7d)
          .order('views', { ascending: false })
          .limit(5);

        if (error24h) console.error('Error loading 24h articles:', error24h);
        if (error7d) console.error('Error loading 7d articles:', error7d);

        // If no articles in 24h, fall back to all-time top viewed
        if (!data24h?.length) {
          const { data: allTime } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .order('views', { ascending: false })
            .limit(5);
          setArticles24h((allTime as Article[]) || []);
        } else {
          setArticles24h((data24h as Article[]) || []);
        }

        if (!data7d?.length) {
          const { data: allTime } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .order('views', { ascending: false })
            .limit(5);
          setArticles7d((allTime as Article[]) || []);
        } else {
          setArticles7d((data7d as Article[]) || []);
        }
      } catch (error) {
        console.error('Error loading popular articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPopularArticles();
  }, []);

  const renderArticleList = (articles: Article[]) => {
    if (articles.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          কোনো জনপ্রিয় সংবাদ পাওয়া যায়নি
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            to={`/article/${article.slug || article.id}`}
            className="flex gap-4 group hover:bg-muted/50 p-2 rounded-lg transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-sm">
              {['১', '২', '৩', '৪', '৫'][index] || index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatViewsBengali(article.views || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getReadingTime(article.content)}
                </span>
              </div>
            </div>
            {article.featured_image && (
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                loading="lazy"
              />
            )}
          </Link>
        ))}
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-4 p-2">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="news-container mb-8 sm:mb-10">
      <div className="bg-card border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">জনপ্রিয় সংবাদ</h2>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="24h" className="text-sm">
              গত ২৪ ঘন্টা
            </TabsTrigger>
            <TabsTrigger value="7d" className="text-sm">
              গত ৭ দিন
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="24h" className="mt-0">
            {isLoading ? renderSkeleton() : renderArticleList(articles24h)}
          </TabsContent>
          
          <TabsContent value="7d" className="mt-0">
            {isLoading ? renderSkeleton() : renderArticleList(articles7d)}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default PopularArticles;
