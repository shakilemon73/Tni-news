import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Play, Calendar } from 'lucide-react';
import { getPublishedVideoPosts } from '@/lib/services/video-service';
import { getCategories } from '@/lib/services/category-service';
import { getSiteSettings } from '@/lib/services/settings-service';
import YouTubePlayer from '@/components/YouTubePlayer';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VideosPageSkeleton } from '@/components/skeletons';
import type { VideoPost, Category, SiteSettings } from '@/types/database';

const formatDateBengali = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const VideosPage = () => {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [videosData, categoriesData, settingsData] = await Promise.all([
          getPublishedVideoPosts(50),
          getCategories(),
          getSiteSettings()
        ]);
        setVideos(videosData);
        setCategories(categoriesData);
        setSettings(settingsData);
        
        const catMap: Record<string, string> = {};
        categoriesData.forEach((cat: Category) => {
          catMap[cat.id] = cat.name;
        });
        setCategoryMap(catMap);
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const siteName = settings?.site_name || 'নিউজ পোর্টাল';

  const getCategoryName = (video: VideoPost): string => {
    if (video.category_ids && video.category_ids.length > 0) {
      return categoryMap[video.category_ids[0]] || 'সাধারণ';
    }
    return 'সাধারণ';
  };

  const handleVideoClick = (video: VideoPost) => {
    setSelectedVideo(video);
  };

  if (isLoading) {
    return <VideosPageSkeleton />;
  }

  return (
    <>
      <Helmet>
        <title>ভিডিও - {siteName}</title>
        <meta name="description" content="সর্বশেষ ভিডিও সংবাদ ও প্রতিবেদন দেখুন" />
      </Helmet>

      <div className="news-container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ভিডিও</h1>
          <p className="text-muted-foreground">সর্বশেষ ভিডিও সংবাদ ও প্রতিবেদন দেখুন</p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12">
            <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">কোনো ভিডিও পাওয়া যায়নি</h2>
            <p className="text-muted-foreground">শীঘ্রই নতুন ভিডিও যোগ করা হবে।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div 
                key={video.id} 
                onClick={() => handleVideoClick(video)}
                className="bg-card rounded-lg overflow-hidden shadow group hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={video.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
                    alt={video.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary p-4 rounded-full">
                      <Play className="h-8 w-8 text-primary-foreground fill-current" />
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    {getCategoryName(video)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDateBengali(video.publish_date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedVideo?.title || 'ভিডিও প্লেয়ার'}
          </DialogTitle>
          {selectedVideo && (
            <div>
              <div className="aspect-video">
                <YouTubePlayer 
                  videoUrl={selectedVideo.video_url} 
                  title={selectedVideo.title}
                  thumbnail={selectedVideo.thumbnail}
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{selectedVideo.title}</h2>
                {selectedVideo.description && (
                  <p className="text-muted-foreground">{selectedVideo.description}</p>
                )}
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDateBengali(selectedVideo.publish_date)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideosPage;
