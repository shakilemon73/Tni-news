import { useEffect } from 'react';
import { getSiteSettings } from '@/lib/services/settings-service';

/**
 * Keeps the browser favicon / apple-touch-icon in sync with the favicon
 * configured in admin settings. Adds a cache-busting param so browsers
 * pick up a changed icon immediately.
 */
const setIcon = (rel: string, href: string, type?: string) => {
  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`)
  );

  if (links.length === 0) {
    const link = document.createElement('link');
    link.rel = rel;
    if (type) link.type = type;
    link.href = href;
    document.head.appendChild(link);
    return;
  }

  links.forEach((link) => {
    if (type) link.type = type;
    link.href = href;
  });
};

const guessType = (url: string): string | undefined => {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  if (clean.endsWith('.ico')) return 'image/x-icon';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.webp')) return 'image/webp';
  return undefined;
};

const SiteFavicon = () => {
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        const settings = await getSiteSettings();
        if (cancelled || !settings) return;

        if (settings.favicon) {
          const bust = `${settings.favicon}${settings.favicon.includes('?') ? '&' : '?'}v=${encodeURIComponent(
            settings.updated_at || Date.now().toString()
          )}`;
          const type = guessType(settings.favicon);
          setIcon('icon', bust, type);
          setIcon('shortcut icon', bust, type);
        }

        if (settings.logo) {
          setIcon('apple-touch-icon', settings.logo);
        }
      } catch {
        // ignore – keep the default icon
      }
    };

    sync();
    // Re-sync when the tab regains focus, so admin changes appear right away
    window.addEventListener('focus', sync);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', sync);
    };
  }, []);

  return null;
};

export default SiteFavicon;
