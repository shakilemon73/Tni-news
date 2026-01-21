import { useEffect, useState } from 'react';
import { getSiteSettings } from '@/lib/services/settings-service';

interface GoogleAdsenseProps {
  slot: 'header' | 'sidebar' | 'article_top' | 'article_bottom' | 'in_feed';
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

interface AdsenseSettings {
  adsense_enabled: boolean;
  adsense_client_id: string;
  adsense_slots: {
    header: string;
    sidebar: string;
    article_top: string;
    article_bottom: string;
    in_feed: string;
  };
}

const GoogleAdsense = ({ slot, format = 'auto', className = '' }: GoogleAdsenseProps) => {
  const [settings, setSettings] = useState<AdsenseSettings | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        setSettings({
          adsense_enabled: (data as any).adsense_enabled || false,
          adsense_client_id: (data as any).adsense_client_id || '',
          adsense_slots: (data as any).adsense_slots || {
            header: '',
            sidebar: '',
            article_top: '',
            article_bottom: '',
            in_feed: ''
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!settings?.adsense_enabled || !settings?.adsense_client_id) return;

    // Load AdSense script if not already loaded
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsense_client_id}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, [settings?.adsense_enabled, settings?.adsense_client_id]);

  useEffect(() => {
    if (isLoaded && settings?.adsense_enabled) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [isLoaded, settings?.adsense_enabled]);

  // Don't render if AdSense is not enabled or slot ID is missing
  if (!settings?.adsense_enabled || !settings?.adsense_client_id) {
    return null;
  }

  const slotId = settings.adsense_slots[slot];
  if (!slotId) {
    return null;
  }

  // Format styles based on ad type
  const getFormatStyle = () => {
    switch (format) {
      case 'rectangle':
        return { display: 'block', width: '300px', height: '250px' };
      case 'horizontal':
        return { display: 'block', width: '100%', height: '90px' };
      case 'vertical':
        return { display: 'block', width: '160px', height: '600px' };
      case 'fluid':
        return { display: 'block' };
      default:
        return { display: 'block' };
    }
  };

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={getFormatStyle()}
        data-ad-client={settings.adsense_client_id}
        data-ad-slot={slotId}
        data-ad-format={format === 'auto' ? 'auto' : undefined}
        data-full-width-responsive={format === 'auto' ? 'true' : undefined}
      />
    </div>
  );
};

export default GoogleAdsense;
