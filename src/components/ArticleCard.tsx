import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Bookmark, BookmarkCheck, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { saveArticle, unsaveArticle, isArticleSaved } from '@/lib/services/user-interaction-service';
import type { Article } from '@/types/database';

// Helper function to format date in Bengali
export const formatDateBengali = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Helper function to estimate reading time in Bengali
export const getReadingTime = (content: string): string => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const bengaliMinutes = minutes.toString().split('').map(d => bengaliNumerals[parseInt(d)]).join('');
  return `${bengaliMinutes} মিনিট`;
};

// Format views in Bengali
export const formatViewsBengali = (views: number): string => {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return views.toString().split('').map(d => bengaliNumerals[parseInt(d)] || d).join('');
};

interface BookmarkButtonProps {
  articleId: string;
  size?: 'icon' | 'sm' | 'default';
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
}

export const BookmarkButton = ({ articleId, size = 'icon', variant = 'ghost', className = '' }: BookmarkButtonProps) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check bookmark status on first render
  const checkBookmark = async () => {
    if (checked || !user) return;
    try {
      const saved = await isArticleSaved(user.id, articleId);
      setIsBookmarked(saved);
      setChecked(true);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('বুকমার্ক করতে লগইন করুন');
      return;
    }

    if (!checked) {
      await checkBookmark();
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        await unsaveArticle(user.id, articleId);
        setIsBookmarked(false);
        toast.success('বুকমার্ক থেকে সরানো হয়েছে');
      } else {
        await saveArticle(user.id, articleId);
        setIsBookmarked(true);
        toast.success('বুকমার্ক করা হয়েছে');
      }
    } catch (error: any) {
      if (error.message === 'Article already saved') {
        setIsBookmarked(true);
      } else {
        toast.error('সমস্যা হয়েছে');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      size={size}
      variant={isBookmarked ? 'default' : variant}
      className={`transition-all duration-200 ${isBookmarked ? 'animate-scale-in' : ''} ${className}`}
      onClick={handleBookmark}
      disabled={isLoading}
      aria-label={isBookmarked ? 'বুকমার্ক থেকে সরান' : 'বুকমার্ক করুন'}
      aria-pressed={isBookmarked}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
};

interface ShareButtonProps {
  title: string;
  url?: string;
  size?: 'icon' | 'sm' | 'default';
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
}

export const ShareButton = ({ title, url, size = 'icon', variant = 'ghost', className = '' }: ShareButtonProps) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = url || window.location.href;
    
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
        toast.success('শেয়ার করা হয়েছে');
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('লিংক কপি করা হয়েছে');
    }).catch(() => {
      toast.error('লিংক কপি করতে ব্যর্থ হয়েছে');
    });
  };

  return (
    <Button 
      size={size}
      variant={variant}
      className={className}
      onClick={handleShare}
      aria-label="শেয়ার করুন"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
};

interface ArticleCardProps {
  article: Article;
  categoryName?: string;
  showExcerpt?: boolean;
  showActions?: boolean;
  imageHeight?: string;
  layout?: 'vertical' | 'horizontal';
}

export const ArticleCard = ({ 
  article, 
  categoryName = 'সাধারণ', 
  showExcerpt = true, 
  showActions = true,
  imageHeight = 'h-48',
  layout = 'vertical'
}: ArticleCardProps) => {
  const articleUrl = `/article/${article.slug || article.id}`;

  if (layout === 'horizontal') {
    return (
      <article className="flex gap-4 group bg-card rounded-lg overflow-hidden border p-4 clickable-card">
        {/* Image - Jonathan Ive: Purposeful Details */}
        <div className="w-1/3 min-w-[120px] overflow-hidden rounded-md">
          <Link to={articleUrl} aria-label={`পড়ুন: ${article.title}`}>
            <img 
              src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
              alt=""
              className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          {/* Meta Info - Susan Weinschenk: Scannable */}
          <div className="flex items-center text-xs mb-1 gap-2">
            <span className="text-primary font-medium">{categoryName}</span>
            <span className="text-muted-foreground/50">•</span>
            <time className="text-muted-foreground" dateTime={article.publish_date}>
              {formatDateBengali(article.publish_date)}
            </time>
          </div>
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-200">
            <Link to={articleUrl}>{article.title}</Link>
          </h3>
          {/* Social Proof - Susan Weinschenk */}
          <div className="flex items-center mt-2 text-xs text-muted-foreground gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getReadingTime(article.content)}
            </span>
            {article.views > 0 && (
              <span className="flex items-center gap-1 view-count">
                <Eye className="h-3 w-3" />
                {formatViewsBengali(article.views)} পাঠক
              </span>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-card rounded-lg overflow-hidden border clickable-card">
      {/* Image Container - Aarron Walter: Delightful Hover */}
      <Link to={articleUrl} aria-label={`পড়ুন: ${article.title}`}>
        <div className="overflow-hidden relative">
          <img 
            src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
            alt=""
            className={`w-full ${imageHeight} object-cover transition-transform duration-500 group-hover:scale-105`}
            loading="lazy"
          />
          {/* View count overlay - Social Proof */}
          {article.views > 0 && (
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViewsBengali(article.views)}
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        {/* Category & Reading Time - Steve Krug: Scannable */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            {categoryName}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getReadingTime(article.content)}
          </span>
        </div>
        
        {/* Title - Dieter Rams: Understandable */}
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary line-clamp-2 transition-colors duration-200 leading-snug">
          <Link to={articleUrl}>{article.title}</Link>
        </h3>
        
        {/* Excerpt - Susan Weinschenk: Memory-friendly chunks */}
        {showExcerpt && article.excerpt && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        
        {/* Footer - Don Norman: Clear Affordances */}
        <div className="flex justify-between items-center pt-2 border-t border-border/50">
          <time className="text-sm text-muted-foreground" dateTime={article.publish_date}>
            {formatDateBengali(article.publish_date)}
          </time>
          {showActions && (
            <div className="flex gap-1">
              <BookmarkButton 
                articleId={article.id} 
                className="h-8 w-8 touch-target hover:bg-primary/10" 
              />
              <ShareButton 
                title={article.title} 
                url={`${window.location.origin}${articleUrl}`} 
                className="h-8 w-8 touch-target hover:bg-primary/10" 
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
