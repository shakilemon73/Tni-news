import { useState, useEffect } from 'react';

export interface YouTubePlayerProps {
  videoUrl: string;
  title: string;
  thumbnail?: string;
  className?: string;
  autoplay?: boolean;
}

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const YouTubePlayer = ({ videoUrl, title, thumbnail, className = '', autoplay = false }: YouTubePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const videoId = getYouTubeVideoId(videoUrl);

  useEffect(() => {
    if (autoplay) setIsPlaying(true);
  }, [autoplay]);

  if (!videoId) {
    return (
      <div className={`aspect-video bg-muted flex items-center justify-center rounded-lg ${className}`}>
        <p className="text-muted-foreground">ভিডিও লোড করা যাচ্ছে না</p>
      </div>
    );
  }

  const thumbnailUrl = thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (!isPlaying) {
    return (
      <div 
        className={`aspect-video relative cursor-pointer group overflow-hidden rounded-lg ${className}`}
        onClick={() => setIsPlaying(true)}
      >
        <img 
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
          <div className="bg-primary p-4 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
            <svg 
              className="w-8 h-8 text-primary-foreground fill-current" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <h3 className="text-white font-semibold line-clamp-2">{title}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-video rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubePlayer;
