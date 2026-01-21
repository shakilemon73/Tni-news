import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FolderOpen, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getCategories } from '@/lib/services/category-service';
import type { Category } from '@/types/database';

const CategoriesListPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default fallback image for categories without custom images
  const defaultCategoryImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c';

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="news-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">সকল বিভাগ</h1>
        <p className="text-muted-foreground">আপনার পছন্দের বিভাগ বেছে নিন</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">কোনো বিভাগ পাওয়া যায়নি</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={`/category/${category.slug}`}>
              <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={category.image || defaultCategoryImage}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesListPage;
