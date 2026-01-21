import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, AlertCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/types/database";

const BreakingNews = () => {
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBreakingNews = async () => {
      try {
        // Get articles published in the last 6 hours as "breaking" news
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .gte('publish_date', sixHoursAgo)
          .order('publish_date', { ascending: false })
          .limit(5);

        if (error) throw error;
        setBreakingNews((data as Article[]) || []);
      } catch (error) {
        console.error('Error loading breaking news:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBreakingNews();
  }, []);

  const startAutoScroll = () => {
    if (breakingNews.length === 0 || isPaused) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % breakingNews.length);
    }, 4000);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (breakingNews.length > 0 && !isPaused) {
      startAutoScroll();
      return () => stopAutoScroll();
    }
  }, [breakingNews.length, isPaused]);

  const handlePrev = () => {
    if (breakingNews.length === 0) return;
    stopAutoScroll();
    setActiveIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);
    startAutoScroll();
  };

  const handleNext = () => {
    if (breakingNews.length === 0) return;
    stopAutoScroll();
    setActiveIndex((prev) => (prev + 1) % breakingNews.length);
    startAutoScroll();
  };

  if (isLoading || breakingNews.length === 0) {
    return null;
  }

  return (
    <div 
      className="bg-destructive text-destructive-foreground py-2 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={containerRef}
    >
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-gradient-to-r from-destructive via-red-500 to-destructive animate-pulse opacity-30" />
      
      <div className="news-container flex items-center relative z-10">
        <div className="flex items-center gap-2 mr-4 flex-shrink-0">
          <div className="relative">
            <Zap size={16} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
          <span className="font-bold text-sm whitespace-nowrap">সদ্যপ্রাপ্ত</span>
          <span className="hidden sm:inline text-xs bg-white/20 px-1.5 py-0.5 rounded">
            LIVE
          </span>
        </div>
        
        <div className="relative flex-1 overflow-hidden h-6">
          {breakingNews.map((article, index) => (
            <div
              key={article.id}
              className={cn(
                "absolute w-full transition-all duration-500 transform",
                index === activeIndex
                  ? "translate-x-0 opacity-100"
                  : index < activeIndex
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
              )}
            >
              <Link 
                to={`/article/${article.slug || article.id}`}
                className="text-sm whitespace-nowrap overflow-hidden text-ellipsis block hover:underline font-medium"
              >
                {article.title}
              </Link>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {/* Progress dots */}
          <div className="hidden sm:flex gap-1 mr-2">
            {breakingNews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  stopAutoScroll();
                  setActiveIndex(index);
                  startAutoScroll();
                }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  index === activeIndex ? "bg-white w-3" : "bg-white/40 hover:bg-white/60"
                )}
                aria-label={`Go to news ${index + 1}`}
              />
            ))}
          </div>
          
          <button 
            onClick={handlePrev} 
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
            aria-label="Previous breaking news"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleNext} 
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
            aria-label="Next breaking news"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;
