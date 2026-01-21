import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { addToReadingHistory } from '@/lib/services/user-interaction-service';

interface UseReadingTrackerOptions {
  articleId: string;
  trackTime?: boolean;
}

export const useReadingTracker = ({ articleId, trackTime = true }: UseReadingTrackerOptions) => {
  const { user } = useAuth();
  const startTimeRef = useRef<number>(Date.now());
  const trackedRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track reading when component mounts
  const trackReading = useCallback(async (duration?: number) => {
    if (!user || !articleId || trackedRef.current) return;
    
    try {
      await addToReadingHistory(user.id, articleId, duration);
      trackedRef.current = true;
    } catch (error) {
      console.error('Error tracking reading:', error);
    }
  }, [user, articleId]);

  useEffect(() => {
    if (!user || !articleId) return;

    startTimeRef.current = Date.now();
    trackedRef.current = false;

    // Track immediately (mark as viewed)
    const timeout = setTimeout(() => {
      trackReading();
    }, 5000); // Track after 5 seconds (indicates actual reading intent)

    // If tracking time, update periodically
    if (trackTime) {
      intervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (user && articleId) {
          addToReadingHistory(user.id, articleId, duration);
        }
      }, 30000); // Update every 30 seconds
    }

    // Cleanup and final tracking on unmount
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Final tracking with total duration
      if (user && articleId && trackTime) {
        const totalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (totalDuration > 5) { // Only track if spent more than 5 seconds
          addToReadingHistory(user.id, articleId, totalDuration);
        }
      }
    };
  }, [user, articleId, trackTime, trackReading]);

  // Return a function to manually track
  return {
    trackReading
  };
};

export default useReadingTracker;
