import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Archive, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getArticles } from '@/lib/services/article-service';
import { getCategories } from '@/lib/services/category-service';
import { ArchivesPageSkeleton } from '@/components/skeletons';
import type { Article, Category } from '@/types/database';

const formatDateBengali = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const ArchivesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [articlesData, categoriesData] = await Promise.all([
          getArticles({ status: 'published' }),
          getCategories()
        ]);
        setArticles(articlesData as Article[]);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading archives:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredArticles = articles.filter(article => {
    const date = new Date(article.publish_date);
    return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
  });

  const getCategoryName = (article: Article): string => {
    if (article.category_ids && article.category_ids.length > 0) {
      const cat = categories.find(c => c.id === article.category_ids![0]);
      return cat?.name || 'সাধারণ';
    }
    return 'সাধারণ';
  };

  if (isLoading) {
    return <ArchivesPageSkeleton />;
  }

  return (
    <div className="news-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">আর্কাইভ</h1>
        <p className="text-muted-foreground">পুরনো সংবাদ খুঁজে দেখুন</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Date Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                তারিখ নির্বাচন
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">বছর</label>
                <div className="flex flex-wrap gap-2">
                  {years.map(year => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedYear(year)}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">মাস</label>
                <div className="grid grid-cols-2 gap-2">
                  {months.map((month, index) => (
                    <Button
                      key={month}
                      variant={selectedMonth === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMonth(index)}
                      className="text-xs"
                    >
                      {month}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              {months[selectedMonth]} {selectedYear} এর সংবাদ
            </h2>
            <p className="text-muted-foreground">মোট {filteredArticles.length}টি সংবাদ</p>
          </div>

          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Archive className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">কোনো সংবাদ পাওয়া যায়নি</h3>
                <p className="text-muted-foreground">এই সময়ে কোনো সংবাদ প্রকাশিত হয়নি।</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map(article => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      {article.featured_image && (
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <span className="text-xs text-primary font-medium">{getCategoryName(article)}</span>
                        <h3 className="font-semibold mb-1">
                          <Link to={`/article/${article.slug || article.id}`} className="hover:text-primary">
                            {article.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{article.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDateBengali(article.publish_date)}
                          </span>
                          <Link to={`/article/${article.slug || article.id}`}>
                            <Button variant="ghost" size="sm">
                              পড়ুন <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchivesPage;
