
import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ArticleMediaProps = {
  type: 'video' | 'audio';
  src: string;
  title?: string;
  poster?: string;
};

const ArticleMedia = ({ type, src, title, poster }: ArticleMediaProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    
    const mediaElement = document.getElementById('media-element') as HTMLVideoElement | HTMLAudioElement;
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    const mediaElement = document.getElementById('media-element') as HTMLVideoElement | HTMLAudioElement;
    if (mediaElement) {
      mediaElement.muted = !mediaElement.muted;
    }
  };

  if (type === 'video') {
    return (
      <div className="my-6 rounded-lg overflow-hidden bg-black">
        <div className="aspect-video relative">
          <video 
            id="media-element"
            src={src} 
            poster={poster}
            className="w-full h-full object-contain"
            muted={isMuted}
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Button 
              onClick={togglePlay} 
              variant="default" 
              size="sm"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="ml-2">{isPlaying ? 'থামান' : 'চালান'}</span>
            </Button>
            <Button 
              onClick={toggleMute} 
              variant="outline" 
              size="icon"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-none"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {title && <p className="text-sm text-gray-500 mt-2">{title}</p>}
      </div>
    );
  }
  
  // Audio player
  return (
    <div className="my-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-3">শ্রবণ করুন</h3>
      <div className="flex items-center gap-4">
        <Button 
          onClick={togglePlay} 
          variant="default" 
          size="sm"
          className="rounded-full aspect-square"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex-1">
          <audio 
            id="media-element" 
            src={src} 
            className="w-full" 
            controls={false}
          />
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: "30%" }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1:23</span>
            <span>4:56</span>
          </div>
        </div>
        <Button 
          onClick={toggleMute} 
          variant="ghost" 
          size="sm"
          className="rounded-full aspect-square"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ArticleMedia;
