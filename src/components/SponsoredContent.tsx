import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getAdvertisementsByType, type Advertisement } from '@/lib/services/advertisement-service';

interface SponsoredContentProps {
  className?: string;
  limit?: number;
}

const SponsoredContent = ({ className, limit = 3 }: SponsoredContentProps) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSponsoredContent = async () => {
      try {
        setIsLoading(true);
        const data = await getAdvertisementsByType('sponsored', limit);
        setAds(data);
      } catch (error) {
        console.error('Error loading sponsored content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSponsoredContent();
  }, [limit]);

  if (isLoading) {
    return (
      <section className={cn("news-container mb-8 sm:mb-10", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-card border rounded-lg overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (ads.length === 0) {
    // Show placeholder for admins to see where sponsored content goes
    return (
      <section className={cn("news-container mb-8 sm:mb-10", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">স্পন্সরড কন্টেন্ট</h2>
        </div>
        <div className="bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg p-8">
          <div className="text-center text-muted-foreground">
            <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">স্পন্সরড কন্টেন্ট এখানে দেখানো হবে</p>
            <p className="text-xs mt-1">অ্যাডমিন প্যানেল থেকে "sponsored" টাইপের বিজ্ঞাপন যোগ করুন</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("news-container mb-8 sm:mb-10", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="h-5 w-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-bold">স্পন্সরড কন্টেন্ট</h2>
        <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">বিজ্ঞাপন</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <a
            key={ad.id}
            href={ad.link_url || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {ad.image_url && (
              <div className="relative overflow-hidden">
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  স্পন্সরড
                </div>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {ad.title}
              </h3>
              {ad.content && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{ad.content}</p>
              )}
              {ad.link_url && (
                <div className="flex items-center gap-1 mt-3 text-xs text-primary">
                  <span>আরও জানুন</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default SponsoredContent;
