import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, FastForward, Rewind } from "lucide-react";

interface CustomVideoPlayerProps {
  youtubeId: string;
  title: string;
  autoplay?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

// Convert YouTube ID to privacy-enhanced embed URL with redirect lock
function toYoutubeEmbed(youtubeId: string): string {
  const ytParams = "autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1&playsinline=1&cc_load_policy=0&enablejsapi=1&origin=" + encodeURIComponent(window.location.origin) + "&widget_referrer=" + encodeURIComponent(window.location.href);
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
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const embedUrl = toYoutubeEmbed(youtubeId);

  // Prevent screen recording and screenshot
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const preventKeys = (e: KeyboardEvent) => {
      // Prevent common screenshot keys
      if (
        (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
        (e.metaKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
        (e.key === 'PrintScreen') ||
        (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) ||
        (e.metaKey && e.shiftKey && (e.key === 'c' || e.key === 'C'))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleBlur = () => {
      // Pause video when tab is blurred to prevent recording
      if (isPlaying) {
        setIsPlaying(false);
        sendCommand('pauseVideo');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        setIsPlaying(false);
        sendCommand('pauseVideo');
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeys);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Prevent text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeys);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isPlaying]);

  // Send command to YouTube iframe via postMessage
  const sendCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    }
  };

  // Listen for YouTube iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("youtube")) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.event === "infoDelivery" && data?.info?.currentTime != null && data?.info?.duration) {
          setCurrentTime(data.info.currentTime);
          setDuration(data.info.duration);
          onProgress?.(data.info.currentTime, data.info.duration);
        }
        if (data?.event === "onStateChange") {
          const state = data?.info;
          // YouTube player states: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
          if (state === 1) {
            setIsPlaying(true);
          } else if (state === 2 || state === 0) {
            setIsPlaying(false);
            if (state === 0) {
              onEnded?.();
            }
          }
        }
      } catch { /* ignore non-JSON messages */ }
    };

    window.addEventListener("message", handleMessage);

    // Kick off listening
    const kickstart = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage('{"event":"listening"}', "*");
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }), "*");
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["infoDelivery"] }), "*");
      }
    }, 1000);

    progressIntervalRef.current = kickstart;

    return () => {
      window.removeEventListener("message", handleMessage);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [onProgress, onEnded]);

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
    if (isPlaying) {
      sendCommand("pauseVideo");
    } else {
      sendCommand("playVideo");
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    sendCommand("seekTo", [time, true]);
    setCurrentTime(time);
  };

  const handleForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    sendCommand("seekTo", [newTime, true]);
    setCurrentTime(newTime);
  };

  const handleBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    sendCommand("seekTo", [newTime, true]);
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (isMuted) {
      sendCommand("unMute");
      setVolume(100);
      setIsMuted(false);
    } else {
      sendCommand("mute");
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    sendCommand("setVolume", [vol]);
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

          {/* Backward 10s */}
          <button
            onClick={handleBackward}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all flex-shrink-0"
            title="Backward 10s"
          >
            <Rewind className="w-4 h-4 text-white" />
          </button>

          {/* Forward 10s */}
          <button
            onClick={handleForward}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all flex-shrink-0"
            title="Forward 10s"
          >
            <FastForward className="w-4 h-4 text-white" />
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
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
            />
          </div>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-white text-[10px] sm:text-xs font-medium min-w-[35px] sm:min-w-[40px]">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer"
            />
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
