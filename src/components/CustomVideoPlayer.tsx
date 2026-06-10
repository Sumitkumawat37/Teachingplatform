import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

interface CustomVideoPlayerProps {
  youtubeId: string;
  title: string;
  autoplay?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

// Convert YouTube ID to privacy-enhanced embed URL with redirect lock
function toYoutubeEmbed(youtubeId: string): string {
  const ytParams = "autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1&playsinline=1&cc_load_policy=0&origin=" + encodeURIComponent(window.location.origin) + "&widget_referrer=" + encodeURIComponent(window.location.href);
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${ytParams}`;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  youtubeId,
  title,
  autoplay = false,
  onProgress,
  onEnded,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const embedUrl = toYoutubeEmbed(youtubeId);

  // Show/hide controls on hover
  const handleMouseEnter = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Note: YouTube iframe controls are disabled, play/pause is handled by the iframe itself
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (iframeRef.current) {
      // Note: Muting iframe requires postMessage communication
      // For simplicity, we'll just track the state
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group max-w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* YouTube iframe with redirect lock */}
      <div className="relative w-full h-full overflow-hidden">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          className="absolute border-0"
          style={{ top: '-60px', left: 0, width: '100%', height: 'calc(100% + 120px)' }}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        
        {/* Redirect lock overlays */}
        {/* Top overlay - covers title bar and channel avatar */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-black pointer-events-none z-[5]" />
        
        {/* Top-left overlay - blocks channel avatar */}
        <div className="absolute top-0 left-0 w-12 h-12 bg-black z-[6] pointer-events-auto" />
        
        {/* Top-right overlay - blocks "..." menu */}
        <div className="absolute top-0 right-0 w-16 h-12 bg-black z-[6] pointer-events-auto" />
        
        {/* Bottom-right overlay - blocks share/watch later buttons */}
        <div className="absolute bottom-0 right-0 w-44 h-14 bg-black z-[6] pointer-events-auto" />
        
        {/* Bottom gradient - allows controls to work through */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-[5]" />
        
        {/* Brand stamp */}
        <div className="absolute top-2 left-2 z-[7] px-2 py-0.5 rounded bg-gradient-to-r from-violet-600 to-pink-500 text-white text-[10px] font-semibold pointer-events-none">
          UPSC Nadiya
        </div>
      </div>

      {/* Custom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Play/Pause Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 pointer-events-auto"
            >
              <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1" />
            </button>
          )}
        </div>

        {/* Control Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all flex-shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 flex-shrink-0 hidden sm:flex">
            <button onClick={toggleMute} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all">
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-16 sm:w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
            />
          </div>

          {/* Progress Bar (visual only - iframe controls are hidden) */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-white text-[10px] sm:text-xs font-medium min-w-[35px] sm:min-w-[40px]">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
            <span className="text-white text-[10px] sm:text-xs font-medium min-w-[35px] sm:min-w-[40px]">{formatTime(duration)}</span>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all flex-shrink-0"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
};
