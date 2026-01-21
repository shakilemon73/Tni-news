import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const REFRESH_MS = 5 * 60 * 1000;

interface TrendingTag {
  tag: string;
  count: number;
}

const TrendingTopics = () => {
  const [trendingData, setTrendingData] = useState<TrendingTag[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const lastFetchedRef = useRef<number>(0);
  
  const itemsPerView = 4;
  const maxIndex = Math.max(0, trendingData.length - itemsPerView);

  const loadTrendingTopics = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);

    try {
      // Get articles with their tags and views, ordered by views (and recency for ties)
      const { data: articles, error } = await supabase
        .from('articles')
        .select('tags, views, publish_date')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .order('publish_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Aggregate tags and their view counts
      const tagCounts: Record<string, number> = {};

      articles?.forEach((article) => {
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach((rawTag: string) => {
            const tag = rawTag?.trim();
            if (!tag) return;

            const views = typeof article.views === 'number' ? article.views : 0;
            tagCounts[tag] = (tagCounts[tag] || 0) + Math.max(views, 1);
          });
        }
      });

      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTrendingData(sortedTags);
      setActiveIndex(0);
      lastFetchedRef.current = Date.now();
    } catch (error) {
      console.error('Error loading trending topics:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTrendingTopics(false);
  }, [loadTrendingTopics]);

  // Refresh periodically + on tab focus (so it doesn't feel "hardcoded")
  useEffect(() => {
    const interval = window.setInterval(() => {
      loadTrendingTopics(true);
    }, REFRESH_MS);

    const onFocus = () => {
      // refresh if data is older than 1 minute
      if (Date.now() - lastFetchedRef.current > 60_000) {
        loadTrendingTopics(true);
      }
    };

    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadTrendingTopics]);

  // Also refresh when navigating back to home / between pages
  useEffect(() => {
    if (Date.now() - lastFetchedRef.current > REFRESH_MS) {
      loadTrendingTopics(true);
    }
  }, [location.pathname, loadTrendingTopics]);
  
  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };
  
  const handleNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, maxIndex));
  };
  
  // Format number with Bengali numerals
  const formatNumberToBengali = (num: number): string => {
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(char => {
      if (/\d/.test(char)) {
        return bengaliNumerals[parseInt(char, 10)];
      }
      return char;
    }).join('');
  };
  
  // Format view count
  const formatViewCount = (count: number): string => {
    if (count >= 10000) {
      return `${formatNumberToBengali(Math.floor(count / 1000))}K+`;
    }
    if (count >= 1000) {
      return `${formatNumberToBengali(Math.round(count / 100) / 10)}K`;
    }
    return formatNumberToBengali(count);
  };

  if (isLoading || trendingData.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 py-3 border-b">
      <div className="news-container">
        <div className="flex items-center">
          <div className="flex items-center gap-1 mr-4 text-news-700">
            <TrendingUp size={16} className="text-news-700" />
            <span className="font-semibold text-sm">ট্রেন্ডিং:</span>
          </div>
          
          <div className="relative flex-1 overflow-hidden">
            <div className="flex gap-4 transition-transform duration-300" 
                 style={{ transform: `translateX(-${activeIndex * 130}px)` }}>
              {trendingData.map((item, index) => (
                <Link 
                  key={index}
                  to={`/search?q=${encodeURIComponent(item.tag)}`}
                  className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border hover:border-primary transition-colors min-w-max"
                >
                  <span className="text-sm">{item.tag}</span>
                  <span className="text-xs text-gray-500">{formatViewCount(item.count)}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={handlePrev}
              disabled={activeIndex === 0}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={handleNext}
              disabled={activeIndex >= maxIndex}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingTopics;
