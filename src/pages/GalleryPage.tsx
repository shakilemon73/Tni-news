import { useState, useEffect } from 'react';
import { Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMediaFiles, MediaFile } from '@/lib/services/media-service';
import { GalleryPageSkeleton } from '@/components/skeletons';

const GalleryPage = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setIsLoading(true);
        const mediaData = await getMediaFiles();
        // Filter only images
        const images = mediaData.filter(item => 
          item.file_type?.startsWith('image/')
        );
        setMedia(images);
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMedia();
  }, []);

  if (isLoading) {
    return <GalleryPageSkeleton />;
  }

  return (
    <div className="news-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ফটো গ্যালারি</h1>
        <p className="text-muted-foreground">আমাদের সংগ্রহ থেকে ছবি দেখুন</p>
      </div>

      {media.length === 0 ? (
        <div className="text-center py-12">
          <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">কোনো ছবি পাওয়া যায়নি</h2>
          <p className="text-muted-foreground">শীঘ্রই নতুন ছবি যোগ করা হবে।</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div 
              key={item.id}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => setSelectedImage(item)}
            >
              <img
                src={item.file_url}
                alt={item.alt_text || item.filename}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={selectedImage.file_url}
            alt={selectedImage.alt_text || selectedImage.filename}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
