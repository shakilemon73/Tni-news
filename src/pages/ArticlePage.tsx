import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import {
  Clock, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy, 
  Bookmark, 
  BookmarkCheck,
  ChevronRight,
  Eye,
  Loader2,
  Send,
  User,
  Camera,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { getArticle, incrementArticleViews } from '@/lib/services/article-service';
import { trackPageView } from '@/lib/services/analytics-service';
import { getCategories } from '@/lib/services/category-service';
import { getSiteSettings } from '@/lib/services/settings-service';
import { saveArticle, unsaveArticle, isArticleSaved } from '@/lib/services/user-interaction-service';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useReadingTracker } from '@/hooks/use-reading-tracker';
import ArticleDownload from '@/components/ArticleDownload';
import CommentSection from '@/components/CommentSection';
import RelatedArticles from '@/components/RelatedArticles';
import { ArticlePageSkeleton } from '@/components/skeletons';
import type { Article, Category, SiteSettings } from '@/types/database';

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

// Helper function to format views in Bengali
const formatViewsBengali = (views: number): string => {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return views.toString().split('').map(d => bengaliNumerals[parseInt(d)] || d).join('');
};

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  
  const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({});
  const [authorName, setAuthorName] = useState<string>('');
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);
  }, []);

  const siteName = settings?.site_name || 'নিউজ পোর্টাল';
  
  useEffect(() => {
    const loadArticle = async () => {
      if (!id) {
        console.log('No article ID provided');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Loading article with ID/slug:', id);
        
        // Fetch categories first
        const categoriesData = await getCategories();
        
        // Create category map
        const catMap: Record<string, Category> = {};
        categoriesData.forEach((cat: Category) => {
          catMap[cat.id] = cat;
        });
        setCategoryMap(catMap);
        
        // Fetch article
        const articleData = await getArticle(id);
        console.log('Article data received:', articleData);
        
        if (!articleData) {
          console.log('Article not found for ID/slug:', id);
          setArticle(null);
          return;
        }
        
        setArticle(articleData as Article);
        
        // Fetch author name and avatar from profiles table
        if (articleData.author_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', articleData.author_id)
            .single();
          
          if (profileData?.full_name) {
            setAuthorName(profileData.full_name);
          }
          if (profileData?.avatar_url) {
            setAuthorAvatar(profileData.avatar_url);
          }
        }
        
        // Track page view for analytics (new table)
        const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
        sessionStorage.setItem('session_id', sessionId);
        trackPageView(articleData.id, user?.id, sessionId, document.referrer).catch(err => 
          console.error('Error tracking page view:', err)
        );
        
        // Also increment legacy view count (don't await to not block UI)
        incrementArticleViews(articleData.id).catch(err => 
          console.error('Error incrementing views:', err)
        );
        
        // Related articles now handled by RelatedArticles component
        
      } catch (error) {
        console.error('Error loading article:', error);
        setArticle(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArticle();
    
    // Set up reading progress tracking
    const handleScroll = () => {
      if (!document.getElementById('article-content')) return;
      
      const content = document.getElementById('article-content')!;
      const contentTop = content.getBoundingClientRect().top;
      const contentBottom = content.getBoundingClientRect().bottom;
      const windowHeight = window.innerHeight;
      
      if (contentTop < 0 && contentBottom > 0) {
        const totalHeight = contentBottom - contentTop;
        const visibleHeight = Math.min(contentBottom, windowHeight) - Math.max(contentTop, 0);
        const percent = (visibleHeight / totalHeight) * 100;
        setProgress(Math.min(100, Math.max(0, percent)));
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Scroll to top when article loads
    window.scrollTo(0, 0);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);
  
  // Check if article is bookmarked for logged in user
  useEffect(() => {
    const checkBookmark = async () => {
      if (user && article) {
        try {
          const saved = await isArticleSaved(user.id, article.id);
          setIsBookmarked(saved);
        } catch (error) {
          console.error('Error checking bookmark:', error);
        }
      }
    };
    checkBookmark();
  }, [user, article]);

  // Use reading tracker hook for logged in users
  useReadingTracker({ articleId: article?.id || '', trackTime: true });

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('বুকমার্ক করতে লগইন করুন');
      return;
    }
    
    if (!article) return;
    
    setIsBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await unsaveArticle(user.id, article.id);
        setIsBookmarked(false);
        toast.success('বুকমার্ক থেকে সরানো হয়েছে');
      } else {
        await saveArticle(user.id, article.id);
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
      setIsBookmarkLoading(false);
    }
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('লিংক কপি করা হয়েছে');
  };
  
  // Get category name from first category_id
  const getCategoryName = (art: Article): string => {
    if (art.category_ids && art.category_ids.length > 0) {
      return categoryMap[art.category_ids[0]]?.name || 'সাধারণ';
    }
    return 'সাধারণ';
  };
  
  // Get category slug
  const getCategorySlug = (art: Article): string => {
    if (art.category_ids && art.category_ids.length > 0) {
      return categoryMap[art.category_ids[0]]?.slug || 'general';
    }
    return 'general';
  };
  
  if (isLoading) {
    return <ArticlePageSkeleton />;
  }
  
  if (!article) {
    return (
      <div className="news-container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">নিবন্ধটি পাওয়া যায়নি</h1>
        <p className="text-muted-foreground mb-6">দুঃখিত, আপনি যে নিবন্ধটি খুঁজছেন তা পাওয়া যায়নি।</p>
        <Link to="/">
          <Button>হোমে ফিরে যান</Button>
        </Link>
      </div>
    );
  }

  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(article.title);
  const shareUrl = encodeURIComponent(articleUrl);

  // Extract SEO metadata if available
  const seoMetadata = article.seo_metadata as { title?: string; description?: string; keywords?: string[] } | null;
  const metaTitle = seoMetadata?.title || article.title;
  const metaDescription = seoMetadata?.description || article.excerpt || article.title;
  const metaKeywords = seoMetadata?.keywords?.join(', ') || article.tags?.join(', ') || '';

  return (
    <div className="py-10 md:py-14">
      {/* Dynamic Open Graph Meta Tags */}
      <Helmet>
        <title>{metaTitle} | {siteName}</title>
        <meta name="description" content={metaDescription} />
        {metaKeywords && <meta name="keywords" content={metaKeywords} />}
        
        {/* Open Graph - Enhanced for Facebook sharing */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        {article.featured_image && (
          <>
            <meta property="og:image" content={article.featured_image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={article.title} />
          </>
        )}
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="bn_BD" />
        <meta property="article:published_time" content={article.publish_date} />
        <meta property="article:modified_time" content={article.updated_at} />
        {authorName && <meta property="article:author" content={authorName} />}
        {article.tags && article.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card - Enhanced */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {article.featured_image && (
          <meta name="twitter:image" content={article.featured_image} />
        )}
        <meta name="twitter:site" content="@banglatimes" />
      </Helmet>

      <div className="news-container">
        <div className="max-w-4xl mx-auto">
          {/* Reading Progress Bar */}
          <div className="fixed top-0 left-0 z-40 w-full h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm mb-8 text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to={`/category/${getCategorySlug(article)}`} className="hover:text-primary transition-colors">
              {getCategoryName(article)}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="truncate">{article.title.substring(0, 30)}...</span>
          </nav>
          
          {/* Article Header */}
          <header className="mb-10">
            {/* Category Badge */}
            <Link 
              to={`/category/${getCategorySlug(article)}`}
              className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4 hover:bg-primary/20 transition-colors"
            >
              {getCategoryName(article)}
            </Link>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            
            {/* Author and Meta Info Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-6 border-t border-b border-border">
              {/* Author Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarImage src={authorAvatar || undefined} alt={authorName || 'লেখক'} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">লেখক</p>
                  <p className="font-semibold text-lg">
                    {authorName || 'স্টাফ রিপোর্টার'}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{formatDateBengali(article.publish_date)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getReadingTime(article.content)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* View Count & Download */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-5 w-5" />
                  <span className="text-sm">{formatViewsBengali(article.views || 0)} পাঠক</span>
                </div>
                <ArticleDownload 
                  article={article} 
                  categoryName={getCategoryName(article)}
                  authorName={authorName}
                />
              </div>
            </div>
          </header>
          
          {/* Featured Image with Credit */}
          {article.featured_image && (
            <figure className="mb-12">
              <div className="aspect-[16/9] rounded-xl overflow-hidden">
                <img 
                  src={article.featured_image} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {article.image_credit && (
                <figcaption className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Camera className="h-4 w-4" />
                  <span>ছবি: {article.image_credit}</span>
                </figcaption>
              )}
            </figure>
          )}
          
          {/* Article Content with Interspersed Gallery Images */}
          <div id="article-content" className="mb-12">
            {(() => {
              // Split content into paragraphs
              const paragraphs = article.content
                .split(/\n\n+/)
                .filter(p => p.trim())
                .map(p => p.replace(/\n/g, ' ').trim());
              
              const galleryImages = article.gallery_images || [];
              const galleryCredits = article.gallery_credits || [];
              
              // Calculate how to distribute images among paragraphs
              const totalParagraphs = paragraphs.length;
              const totalImages = galleryImages.length;
              
              // Insert an image after every N paragraphs (distribute evenly)
              const paragraphsPerImage = totalImages > 0 
                ? Math.max(2, Math.floor(totalParagraphs / (totalImages + 1)))
                : totalParagraphs;
              
              let imageIndex = 0;
              const elements: JSX.Element[] = [];
              
              paragraphs.forEach((paragraph, index) => {
                // Add paragraph
                elements.push(
                  <p 
                    key={`p-${index}`}
                    className="text-foreground/90 leading-[2] mb-8 text-justify text-lg lg:text-xl"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(paragraph) }}
                  />
                );
                
                // Check if we should insert an image after this paragraph
                const shouldInsertImage = 
                  imageIndex < totalImages && 
                  (index + 1) % paragraphsPerImage === 0 &&
                  index < totalParagraphs - 1; // Don't insert after last paragraph
                
                if (shouldInsertImage) {
                  elements.push(
                    <figure key={`img-${imageIndex}`} className="my-10 flex flex-col items-center">
                      <div className="w-full max-w-2xl mx-auto">
                        <img 
                          src={galleryImages[imageIndex]} 
                          alt={galleryCredits[imageIndex] || `ছবি ${imageIndex + 1}`}
                          className="w-full h-auto rounded-xl object-cover"
                        />
                        {galleryCredits[imageIndex] && (
                          <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">
                            {galleryCredits[imageIndex]}
                          </figcaption>
                        )}
                      </div>
                    </figure>
                  );
                  imageIndex++;
                }
              });
              
              // Add any remaining images at the end
              while (imageIndex < totalImages) {
                elements.push(
                  <figure key={`img-${imageIndex}`} className="my-10 flex flex-col items-center">
                    <div className="w-full max-w-2xl mx-auto">
                      <img 
                        src={galleryImages[imageIndex]} 
                        alt={galleryCredits[imageIndex] || `ছবি ${imageIndex + 1}`}
                        className="w-full h-auto rounded-xl object-cover"
                      />
                      {galleryCredits[imageIndex] && (
                        <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">
                          {galleryCredits[imageIndex]}
                        </figcaption>
                      )}
                    </div>
                  </figure>
                );
                imageIndex++;
              }
              
              return elements;
            })()}
          </div>
          
          {/* Tags Section */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">ট্যাগসমূহ</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Link 
                    to={`/search?q=${encodeURIComponent(tag)}`} 
                    key={index}
                    className="px-4 py-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full text-sm font-medium transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          
          {/* Article Footer - Share Buttons */}
          <div className="border-t border-b py-6 mb-10">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-1" />
                  <span>{formatViewsBengali(article.views || 0)} পাঠক</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant={isBookmarked ? "default" : "ghost"}
                        onClick={toggleBookmark}
                        disabled={isBookmarkLoading}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-5 w-5" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isBookmarked ? 'বুকমার্ক থেকে সরিয়ে ফেলুন' : 'বুকমার্ক করুন'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                      >
                        <Facebook className="h-5 w-5 text-[#1877F2]" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ফেসবুকে শেয়ার করুন</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${article.title}`, '_blank')}
                      >
                        <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>টুইটারে শেয়ার করুন</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank')}
                      >
                        <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>লিংকডইনে শেয়ার করুন</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => window.open(`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`, '_blank')}
                      >
                        <MessageCircle className="h-5 w-5 text-[#25D366]" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>হোয়াটসঅ্যাপে শেয়ার করুন</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, '_blank')}
                      >
                        <Send className="h-5 w-5 text-[#0088cc]" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>টেলিগ্রামে শেয়ার করুন</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={copyShareLink}
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>লিংক কপি করুন</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          {/* Comment Section */}
          <CommentSection articleId={article.id} />

          {/* AI-Powered Related Articles */}
          <section className="mb-12 mt-10">
            <RelatedArticles articleId={article.id} limit={4} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
