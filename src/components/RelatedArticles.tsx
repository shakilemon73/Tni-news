import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getSimilarArticles } from '@/lib/services/recommendation-service';
import type { Article } from '@/types/database';

// Helper function to format date in Bengali
const formatDateBengali = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short'
  });
};

// Helper function to estimate reading time in Bengali
const getReadingTime = (content: string): string => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const bengaliMinutes = minutes.toString().split('').map(d => bengaliNumerals[parseInt(d)]).join('');
  return `${bengaliMinutes} মি.`;
};

interface RelatedArticlesProps {
  articleId: string;
  limit?: number;
}

export const RelatedArticles = ({ articleId, limit = 4 }: RelatedArticlesProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRelated = async () => {
      setIsLoading(true);
      try {
        const related = await getSimilarArticles(articleId, limit);
        setArticles(related);
      } catch (error) {
        console.error('Error loading related articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (articleId) {
      loadRelated();
    }
  }, [articleId, limit]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">সম্পর্কিত খবর</h3>
        </div>
        <div className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-20 h-16 rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg">সম্পর্কিত খবর</h3>
      </div>
      
      <div className="space-y-4">
        {articles.map((article) => (
          <Link 
            key={article.id} 
            to={`/article/${article.slug || article.id}`}
            className="flex gap-3 group"
          >
            <div className="w-20 h-16 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{formatDateBengali(article.publish_date)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getReadingTime(article.content)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <Link 
        to="/category/latest" 
        className="flex items-center justify-center gap-1 mt-4 text-sm text-primary hover:text-primary/80 font-medium"
      >
        আরও দেখুন <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default RelatedArticles;
