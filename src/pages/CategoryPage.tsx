import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ChevronRight, ChevronLeft, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCategoryBySlug, getCategories } from '@/lib/services/category-service';
import { getArticlesByCategory, getArticles } from '@/lib/services/article-service';
import { CategoryPageSkeleton } from '@/components/skeletons';
import type { Article, Category } from '@/types/database';

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

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const articlesPerPage = 9;
  
  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        setCurrentPage(1);
        
        // Handle special "latest" category
        if (slug === 'latest' || slug === 'সর্বশেষ') {
          const [articlesData, categoriesData] = await Promise.all([
            getArticles({ status: 'published' }),
            getCategories()
          ]);
          
          setCategory({
            id: 'latest',
            name: 'সর্বশেষ',
            slug: 'latest',
            description: 'সবচেয়ে সাম্প্রতিক খবর ও আপডেট',
            parent_id: null,
            created_at: '',
            updated_at: ''
          });
          
          setArticles(articlesData as unknown as Article[]);
          
          // Create category map
          const catMap: Record<string, Category> = {};
          categoriesData.forEach((cat: Category) => {
            catMap[cat.id] = cat;
          });
          setCategoryMap(catMap);
        } else {
          // Fetch category and articles
          const [categoryData, categoriesData] = await Promise.all([
            getCategoryBySlug(slug),
            getCategories()
          ]);
          
          if (!categoryData) {
            setCategory(null);
            setArticles([]);
            return;
          }
          
          setCategory(categoryData);
          
          // Fetch articles for this category
          const articlesData = await getArticlesByCategory(categoryData.id, 50);
          setArticles(articlesData as unknown as Article[]);
          
          // Create category map
          const catMap: Record<string, Category> = {};
          categoriesData.forEach((cat: Category) => {
            catMap[cat.id] = cat;
          });
          setCategoryMap(catMap);
        }
      } catch (error) {
        console.error('Error loading category data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [slug]);
  
  // Get category name from first category_id
  const getCategoryName = (article: Article): string => {
    if (article.category_ids && article.category_ids.length > 0) {
      return categoryMap[article.category_ids[0]]?.name || category?.name || 'সাধারণ';
    }
    return category?.name || 'সাধারণ';
  };
  
  // Pagination
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  
  const subcategories = [
    'সর্বশেষ',
    'জনপ্রিয়'
  ];
  
  if (isLoading) {
    return <CategoryPageSkeleton />;
  }
  
  if (!category) {
    return (
      <div className="py-12">
        <div className="news-container text-center">
          <h1 className="text-2xl font-bold mb-4">ক্যাটেগরি পাওয়া যায়নি</h1>
          <p className="text-muted-foreground mb-6">দুঃখিত, আপনি যে ক্যাটেগরিটি খুঁজছেন তা পাওয়া যায়নি।</p>
          <Link to="/">
            <Button>হোমে ফিরে যান</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <div className="news-container">
        {/* Category Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-3">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground max-w-3xl mx-auto">{category.description}</p>
          )}
        </div>
        
        {/* Subcategories & View Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <Tabs defaultValue={subcategories[0]}>
            <TabsList>
              {subcategories.map((subcat) => (
                <TabsTrigger key={subcat} value={subcat}>
                  {subcat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  <span>সাজানো</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>সর্বশেষ</DropdownMenuItem>
                <DropdownMenuItem>জনপ্রিয়</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex rounded-md overflow-hidden border">
              <button 
                className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : 'bg-background'}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button 
                className={`p-2 ${viewMode === 'list' ? 'bg-muted' : 'bg-background'}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Articles */}
        {currentArticles.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-6'
          }`}>
            {currentArticles.map((article) => (
              viewMode === 'grid' ? (
                // Grid View
                <div key={article.id} className="group bg-card rounded-lg overflow-hidden border">
                  <div className="overflow-hidden">
                    <img 
                      src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-primary">
                        {getCategoryName(article)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getReadingTime(article.content)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary line-clamp-2">
                      <Link to={`/article/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{formatDateBengali(article.publish_date)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                // List View
                <div key={article.id} className="flex flex-col sm:flex-row gap-4 group bg-card rounded-lg overflow-hidden border p-4">
                  <div className="sm:w-1/3 overflow-hidden rounded-md">
                    <img 
                      src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
                      alt={article.title}
                      className="w-full h-48 sm:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="sm:w-2/3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-primary">
                        {getCategoryName(article)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getReadingTime(article.content)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                      <Link to={`/article/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {article.excerpt}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{formatDateBengali(article.publish_date)}</span>
                      <Link to={`/article/${article.slug || article.id}`}>
                        <Button variant="link" className="pl-0 text-primary">
                          বিস্তারিত পড়ুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">এই ক্যাটেগরিতে কোন লেখা পাওয়া যায়নি।</p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
