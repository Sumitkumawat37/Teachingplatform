import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, FastForward } from "lucide-react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface CustomVideoPlayerProps {
  youtubeId: string;
  title: string;
  autoplay?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  youtubeId,
  title,
  autoplay = false,
  onProgress,
  onEnded,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load YouTube Player API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        setPlayerReady(true);
      };
    } else {
      setPlayerReady(true);
    }
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    if (!playerReady || !youtubeId) return;

    const player = new window.YT.Player("youtube-player", {
      videoId: youtubeId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        disablekb: 1,
        fs: 0,
        cc_load_policy: 3,
        hl: "en",
        playsinline: 1,
        origin: window.location.origin,
        widget_referrer: window.location.href,
      },
      events: {
        onReady: (event: any) => {
          playerRef.current = event.target;
          setDuration(event.target.getDuration());
          if (autoplay) {
            event.target.playVideo();
            setIsPlaying(true);
          }
        },
        onStateChange: (event: any) => {
          const state = event.data;
          // YT.PlayerState: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
          if (state === 1) {
            setIsPlaying(true);
          } else if (state === 2) {
            setIsPlaying(false);
          } else if (state === 0) {
            setIsPlaying(false);
            onEnded?.();
          }
        },
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [playerReady, youtubeId, autoplay, onEnded]);

  // Track progress
  useEffect(() => {
    if (!playerRef.current || !isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        setCurrentTime(time);
        setDuration(dur);
        onProgress?.(time, dur);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, onProgress]);

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

  // Control functions
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const time = parseFloat(e.target.value);
    playerRef.current.seekTo(time, true);
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const vol = parseInt(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    playerRef.current.setVolume(vol);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setVolume(100);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (!playerRef.current) return;
    setPlaybackSpeed(speed);
    playerRef.current.setPlaybackRate(speed);
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group max-w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* YouTube Player */}
      <div id="youtube-player" className="absolute inset-0 w-full h-full" />
      
      {/* Top overlay to hide YouTube title and captions */}
      <div className="absolute top-0 left-0 right-0 h-12 sm:h-14 md:h-16 bg-black pointer-events-none z-10" />
      {/* Bottom-right overlay to hide YouTube logo */}
      <div className="absolute bottom-12 sm:bottom-14 md:bottom-16 right-0 w-16 sm:w-20 md:w-24 h-8 sm:h-10 md:h-12 bg-black pointer-events-none z-10" />

      {/* Custom Controls */}
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
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-white text-[10px] sm:text-xs font-medium min-w-[35px] sm:min-w-[40px]">{formatTime(duration)}</span>
          </div>

          {/* Playback Speed */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => handleSpeedChange(playbackSpeed === 2 ? 0.5 : playbackSpeed + 0.25)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
            >
              <FastForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
            <span className="absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 text-white text-[9px] sm:text-[10px] font-bold bg-black/70 px-1.5 py-0.5 rounded">
              {playbackSpeed}x
            </span>
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
