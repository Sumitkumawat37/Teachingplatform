import { useState, useRef, useEffect } from 'react';
import { Play, AlertTriangle } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  startTime?: number;
  autoplay?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnd?: () => void;
}

export function YouTubePlayer({ 
  videoId, 
  title = "Video", 
  startTime = 0,
  autoplay = false,
  onProgress,
  onEnd 
}: YouTubePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (typeof window !== 'undefined' && !window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        tag.onload = () => {
          window.YT.ready(() => {
            setIsLoaded(true);
          });
        };
      } else if (window.YT) {
        setIsLoaded(true);
      }
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && containerRef.current && !playerRef.current) {
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          start: startTime,
          autoplay: autoplay ? 1 : 0,
          playerVars: {
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                const duration = playerRef.current?.getDuration() || 0;
                const checkProgress = () => {
                  if (playerRef.current && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
                    const currentTime = playerRef.current.getCurrentTime();
                    onProgress?.(currentTime, duration);
                    requestAnimationFrame(checkProgress);
                  }
                };
                checkProgress();
              }
              if (event.data === window.YT.PlayerState.ENDED) {
                onEnd?.();
              }
            },
            onError: (event) => {
              console.error('YouTube player error:', event.data);
              setHasError(true);
            },
          },
        });
      } catch (error) {
        console.error('Failed to initialize YouTube player:', error);
        setHasError(true);
      }
    }
  }, [isLoaded, videoId, startTime, autoplay, onProgress, onEnd]);

  if (hasError) {
    return (
      <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center">
        <div className="text-center p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Unable to play video</p>
          <p className="text-sm text-slate-500 mt-1">Please check your connection or try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 text-sm">Loading video...</p>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`aspect-video rounded-2xl overflow-hidden ${isLoaded ? '' : 'hidden'}`}
        title={title}
      />
    </div>
  );
}
