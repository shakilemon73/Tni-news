import { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAdvertisements, getAdvertisementBySlot, type Advertisement } from '@/lib/services/advertisement-service';

interface AdBannerProps {
  position?: string;
  slot?: string;
  className?: string;
  showLabel?: boolean;
}

const AdBanner = ({ position = 'homepage', slot, className, showLabel = true }: AdBannerProps) => {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const impressionTracked = useRef(false);

  useEffect(() => {
    const loadAd = async () => {
      try {
        setIsLoading(true);
        let adData: Advertisement | null = null;
        
        if (slot) {
          adData = await getAdvertisementBySlot(position, slot);
        } else {
          const ads = await getAdvertisements(position, 1);
          adData = ads[0] || null;
        }
        
        setAd(adData);
      } catch (error) {
        console.error('Error loading ad:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAd();
  }, [position, slot]);

  // Track impression when ad becomes visible
  useEffect(() => {
    if (ad && !impressionTracked.current) {
      impressionTracked.current = true;
      // We could track impression here if needed
    }
  }, [ad]);

  const handleClick = () => {
    if (ad?.link_url) {
      // Track click could be added here
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div className={cn("bg-muted animate-pulse rounded-lg", className)}>
        <div className="h-24 sm:h-32 flex items-center justify-center text-muted-foreground text-sm">
          বিজ্ঞাপন লোড হচ্ছে...
        </div>
      </div>
    );
  }

  if (!ad) {
    // Show placeholder when no ad is available
    return (
      <div className={cn("bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg", className)}>
        <div className="h-24 sm:h-32 flex flex-col items-center justify-center text-muted-foreground text-sm gap-1">
          <span>বিজ্ঞাপনের স্থান</span>
          <span className="text-xs">({position}{slot ? ` - ${slot}` : ''})</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      {showLabel && (
        <div className="absolute top-1 left-1 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
          বিজ্ঞাপন
        </div>
      )}
      
      {ad.image_url ? (
        <div 
          className="cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
          onClick={handleClick}
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div 
          className="bg-gradient-to-r from-primary/10 to-primary/5 border rounded-lg p-4 cursor-pointer hover:bg-primary/15 transition-colors"
          onClick={handleClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">{ad.title}</h4>
              {ad.content && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ad.content}</p>
              )}
            </div>
            {ad.link_url && (
              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdBanner;
