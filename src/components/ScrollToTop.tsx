import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component ensures pages scroll to top on navigation
 * - Scrolls to top on route changes
 * - Disables browser scroll restoration
 * - Handles hash fragments appropriately
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Cleanup on unmount - restore default behavior
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    // If there's a hash, let the browser handle scrolling to the anchor
    if (hash) {
      // Small delay to ensure the element exists in DOM
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    // Scroll to top immediately on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // Also ensure body and document element are at top
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
