import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getArticles } from '@/lib/services/article-service';
import { getCategories } from '@/lib/services/category-service';
import { SearchResultSkeleton } from '@/components/skeletons';
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

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Article[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        const catMap: Record<string, Category> = {};
        categoriesData.forEach((cat: Category) => {
          catMap[cat.id] = cat;
        });
        setCategoryMap(catMap);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);
  
  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      const searchQuery = searchParams.get('q');
      if (!searchQuery?.trim()) {
        setResults([]);
        return;
      }
      
      try {
        setIsLoading(true);
        const articlesData = await getArticles({ search: searchQuery, status: 'published' });
        setResults(articlesData as unknown as Article[]);
      } catch (error) {
        console.error('Error searching articles:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [searchParams]);
  
  // Get category name
  const getCategoryName = (article: Article): string => {
    if (article.category_ids && article.category_ids.length > 0) {
      return categoryMap[article.category_ids[0]]?.name || 'সাধারণ';
    }
    return 'সাধারণ';
  };
  
  // Update URL when query changes
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };
  
  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
  };

  return (
    <div className="py-8">
      <div className="news-container">
        <div className="max-w-3xl mx-auto">
          {/* Search Form */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="আপনার অনুসন্ধান লিখুন..."
                className="h-12 pl-12 pr-12 text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              
              {query && (
                <button 
                  type="button" 
                  onClick={clearSearch} 
                  className="absolute right-24 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              
              <Button 
                type="submit" 
                className="absolute right-0 top-0 h-12 rounded-l-none"
              >
                অনুসন্ধান
              </Button>
            </form>
          </div>
          
          {/* Search Results */}
          {searchParams.get('q') && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">{searchParams.get('q')} এর জন্য অনুসন্ধান ফলাফল</h1>
                <p className="text-muted-foreground">
                  {isLoading ? 'অনুসন্ধান হচ্ছে...' : `${results.length} টি ফলাফল পাওয়া গেছে`}
                </p>
              </div>
              
              {isLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SearchResultSkeleton key={i} />
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-6">
                  {results.map((result) => (
                    <div key={result.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-1/4 min-w-[100px]">
                        <img 
                          src={result.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
                          alt={result.title}
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center text-xs mb-1">
                          <span className="text-primary font-medium">{getCategoryName(result)}</span>
                          <span className="mx-2">•</span>
                          <span className="text-muted-foreground">{formatDateBengali(result.publish_date)}</span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {getReadingTime(result.content)}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold mb-2">
                          <Link to={`/article/${result.slug || result.id}`} className="hover:text-primary">
                            {result.title}
                          </Link>
                        </h3>
                        
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {result.excerpt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">কোন ফলাফল পাওয়া যায়নি। দয়া করে আরেকটি অনুসন্ধান করুন।</p>
                </div>
              )}
            </div>
          )}
          
          {/* No Query State */}
          {!searchParams.get('q') && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">আপনি কি খুঁজছেন?</h2>
              <p className="text-muted-foreground mb-6">উপরে দেওয়া সার্চ বারে আপনার অনুসন্ধান লিখুন</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['বাংলাদেশ', 'খেলা', 'প্রযুক্তি', 'বিনোদন', 'রাজনীতি', 'অর্থনীতি'].map(term => (
                  <button 
                    key={term} 
                    onClick={() => {
                      setQuery(term);
                      setSearchParams({ q: term });
                    }}
                    className="bg-muted hover:bg-muted/80 px-4 py-2 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
