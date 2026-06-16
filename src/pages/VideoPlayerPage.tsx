import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useLecture, useCourses, useLectures, useDoubts, useCreateDoubt, useLectureProgress, useUpsertLectureProgress } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useAuth } from "@/lib/auth-context";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, Send, MessageCircle, Lock, Eye, Play, Maximize, Minimize, X, ShieldCheck, AlertTriangle, FastForward, Settings, RotateCcw, ShieldAlert, Rewind } from "lucide-react";
import { toast } from "sonner";
import { useAntiPiracy } from "@/hooks/useAntiPiracy";
import { useScreenProtection } from "@/hooks/useScreenProtection";
import { WatermarkOverlay } from "@/components/protection/WatermarkOverlay";
import { TabBlurOverlay } from "@/components/protection/TabBlurOverlay";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const VideoPlayerPage = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { hasPurchased } = usePurchase();
  const { user } = useAuth();
  const { data: lecture } = useLecture(lectureId);
  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures(courseId);
  const { data: lectureDoubts = [] } = useDoubts(lectureId);
  const { data: progressData = [] } = useLectureProgress();
  const createDoubt = useCreateDoubt();
  const upsertProgress = useUpsertLectureProgress();
  const [newDoubt, setNewDoubt] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ytProgress, setYtProgress] = useState({ currentTime: 0, duration: 0 });
  const [tabResumed, setTabResumed] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);
  const [showRecordingWarning, setShowRecordingWarning] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoNextEnabled, setAutoNextEnabled] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [ytPlaying, setYtPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoCompletedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  // Disabled anti-piracy hooks to prevent video pause issues
  // const { isTabHidden, devToolsOpen, screenRecordingDetected } = useAntiPiracy({ enabled: true });
  // const isScreenProtected = useScreenProtection();
  const isTabHidden = false;
  const devToolsOpen = false;
  const screenRecordingDetected = false;
  const isScreenProtected = false;

  // Re-arm blur protection each time user returns to the tab
  useEffect(() => {
    if (!isTabHidden) setTabResumed(false);
  }, [isTabHidden]);

  // Show warning when screen recording is detected
  useEffect(() => {
    if (screenRecordingDetected) {
      setShowRecordingWarning(true);
    }
  }, [screenRecordingDetected]);

  const course = courses.find((c) => c.id === courseId);
  const myProgress = progressData.find((p) => p.lecture_id === lectureId);
  const completed = myProgress?.completed ?? false;
  // Get lecture index in the course (sorted by chapter order and lecture order)
  const lectureIndex = lectures.findIndex(l => l.id === lectureId);
  const isFirstFive = lectureIndex >= 0 && lectureIndex < 5;
  const canAccess = lecture ? (lecture.free_preview || hasPurchased(courseId || "") || isFirstFive) : false;

  // Extract YouTube video ID from various URL formats or direct ID
  const extractYoutubeId = (input: string | undefined): string | null => {
    if (!input) return null;
    const trimmed = input.trim();
    
    // Already a valid 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    
    // Full YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const youtubeId = extractYoutubeId(lecture?.youtube_id);
  const videoUrl = lecture?.video_url;
  const hasYoutubeVideo = !!youtubeId;
  const hasUploadedVideo = videoUrl && videoUrl.trim().length > 0;
  
  // Detect if video URL is a Drive link
  const isDriveVideo = videoUrl?.includes('drive.google.com') || false;
  const hasDriveVideo = isDriveVideo;
  
  // Custom play button state
  const [showPlayButton, setShowPlayButton] = useState(true);

  // Get Drive embed URL
  const getDriveEmbedUrl = () => {
    if (!isDriveVideo || !videoUrl) return "";
    const match = videoUrl.match(/\/file\/d\/([^\/]+)/);
    if (match) {
      return "https://drive.google.com/file/d/" + match[1] + "/preview?rm=minimal";
    }
    return videoUrl;
  };

  // Video pause on tab switch disabled to prevent interference with video controls
  // Video will continue playing even when tab is switched

  // Auto-complete when 80% watched
  const handleAutoComplete = useCallback(() => {
    if (!user || completed || autoCompletedRef.current) return;
    autoCompletedRef.current = true;
    upsertProgress.mutate({
      user_id: user.id,
      lecture_id: lectureId!,
      watched_percent: 100,
      completed: true,
    });
    toast.success("Lecture automatically marked as completed!");
  }, [user, completed, lectureId, upsertProgress]);

  // Resume video from last watched position
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasUploadedVideo) return;

    // Apply playback speed
    video.playbackRate = playbackSpeed;

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        const pct = (video.currentTime / video.duration) * 100;
        if (pct >= 80 && !autoCompletedRef.current) {
          handleAutoComplete();
        }
        // Save progress periodically
        if (user && lectureId) {
          upsertProgress.mutate({
            user_id: user.id,
            lecture_id: lectureId!,
            watched_percent: pct,
            completed: completed
          });
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [hasUploadedVideo, completed, handleAutoComplete, myProgress, playbackSpeed, user, lectureId, upsertProgress]);

  // Handle playback speed change
  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    // YouTube playback speed via postMessage
    if (hasYoutubeVideo && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "setPlaybackRate", args: [speed] }),
        "*"
      );
    }
  };

  // Handle forward 10s
  const handleForward = () => {
    if (hasYoutubeVideo && iframeRef.current?.contentWindow) {
      const newTime = Math.min(ytProgress.currentTime + 10, ytProgress.duration);
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [newTime, true] }),
        "*"
      );
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
    }
  };

  // Handle backward 10s
  const handleBackward = () => {
    if (hasYoutubeVideo && iframeRef.current?.contentWindow) {
      const newTime = Math.max(ytProgress.currentTime - 10, 0);
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [newTime, true] }),
        "*"
      );
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  // Handle seek via progress bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (hasYoutubeVideo && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [time, true] }),
        "*"
      );
    } else if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Track YouTube iframe progress via postMessage API and handle auto-fullscreen
  useEffect(() => {
    if (!hasYoutubeVideo) return;
    autoCompletedRef.current = completed;

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("youtube")) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.event === "infoDelivery" && data?.info?.currentTime != null && data?.info?.duration) {
          const currentTime = data.info.currentTime;
          const duration = data.info.duration;
          setYtProgress({ currentTime, duration });
          
          const pct = (currentTime / duration) * 100;
          if (pct >= 80 && !autoCompletedRef.current && !completed) {
            handleAutoComplete();
          }
        }
        // Detect YouTube video state changes
        if (data?.event === "onStateChange") {
          const state = data?.info;
          // YouTube player states: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
          if (state === 1) {
            setYtPlaying(true);
            if (!videoStarted) setVideoStarted(true);
          } else if (state === 2 || state === 0) {
            setYtPlaying(false);
          }
        }
      } catch { /* ignore non-JSON messages */ }
    };

    window.addEventListener("message", handleMessage);

    // Kick off listening by sending "listening" command to iframe
    const kickstart = setInterval(() => {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"listening"}', "*");
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }), "*");
      }
    }, 1000);
    ytIntervalRef.current = kickstart;

    return () => {
      window.removeEventListener("message", handleMessage);
      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
    };
  }, [hasYoutubeVideo, completed, handleAutoComplete, videoStarted, isFullscreen]);

  // Auto-fullscreen disabled to prevent interference with video playback

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + secs.toString().padStart(2, '0');
  };

  const ytProgressPercent = ytProgress.duration > 0 ? (ytProgress.currentTime / ytProgress.duration) * 100 : 0;

  if (!lecture || !course) return (
    <div className="p-8 text-center">
      <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-3">
        <Play className="w-6 h-6 text-white" />
      </div>
      <p className="text-slate-400 text-sm">Lecture not found</p>
    </div>
  );

  if (!canAccess) {
    return (
      <div className="space-y-4 animate-slide-up">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {course.title}
        </button>
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Lecture Locked</h2>
          <p className="text-slate-500 text-sm mt-2">Purchase this course to unlock all lectures.</p>
          <button
            className="bg-gradient-to-r from-violet-600 to-pink-500 text-white mt-5 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all"
            onClick={() => navigate("/courses/" + courseId)}
          >
            View Course →
          </button>
        </div>
      </div>
    );
  }

  const handleMarkComplete = () => {
    if (!user) return;
    upsertProgress.mutate({
      user_id: user.id,
      lecture_id: lectureId!,
      watched_percent: 100,
      completed: true,
    });
    toast.success("Lecture marked as completed!");
  };

  const handleSubmitDoubt = () => {
    if (!newDoubt.trim() || !user) return;
    createDoubt.mutate({
      lecture_id: lectureId!,
      course_id: courseId!,
      user_id: user.id,
      student_name: user.name,
      question: newDoubt,
    });
    toast.success("Doubt submitted!");
    setNewDoubt("");
  };

  // Build YouTube embed URL with privacy-enhanced mode and redirect lock
  const getYoutubeEmbedUrl = () => {
    if (!hasYoutubeVideo) return "";
    const ytParams = "autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1&playsinline=1&cc_load_policy=0&enablejsapi=1&origin=" + encodeURIComponent(window.location.origin) + "&widget_referrer=" + encodeURIComponent(window.location.href) + "&fs=0";
    return "https://www.youtube-nocookie.com/embed/" + youtubeId + "?" + ytParams;
  };

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Back nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {/* Protection indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-emerald-100">
          <ShieldCheck className="w-3 h-3" />
          Protected Content
        </div>
      </div>

      {/* DevTools warning */}
      {devToolsOpen && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 animate-slide-up">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-amber-300 text-xs font-semibold">Developer tools detected. Content protection is active.</p>
        </div>
      )}

      {/* Desktop 2-col: player area left, doubts right */}
      <div className="md:grid md:grid-cols-[1.6fr_1fr] md:gap-6 md:items-start">
      <div className="space-y-4">

      {/* PREMIUM VIDEO PLAYER */}
      <div
        ref={videoContainerRef}
        className={"relative overflow-hidden shadow-2xl transition-all duration-300 " + (isFullscreen ? "fixed inset-0 z-50 rounded-none bg-black flex items-center justify-center" : "rounded-2xl bg-black border border-slate-200 shadow-sm w-full max-w-full")}
        data-protected
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className={"bg-black relative w-full " + (isFullscreen ? "h-full" : "aspect-video max-w-full")}>
          {hasUploadedVideo ? (
            isDriveVideo ? (
              <div className="relative w-full h-full overflow-hidden">
                <iframe
                  src={getDriveEmbedUrl()}
                  title={lecture.title}
                  className="absolute w-full h-full border-0"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
                {/* Custom play button overlay */}
                {showPlayButton && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <button
                      onClick={() => setShowPlayButton(false)}
                      className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <Play className="w-8 h-8 text-white ml-1" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                controls
                controlsList="nodownload"
                playsInline
                poster={lecture.thumbnail_url || undefined}
              >
                Your browser does not support the video tag.
              </video>
            )
          ) : hasYoutubeVideo ? (
            <div className="relative w-full h-full overflow-hidden">
              <iframe
                ref={iframeRef}
                src={getYoutubeEmbedUrl()}
                title={lecture.title}
                className="absolute border-0"
                style={{ top: '-60px', left: 0, width: '100%', height: 'calc(100% + 120px)' }}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
              
              {/* Redirect lock overlays */}
              {/* Top overlay - covers title bar and channel avatar */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-black pointer-events-none z-[50]" />
              
              {/* Top-left overlay - blocks channel avatar */}
              <div className="absolute top-0 left-0 w-20 h-16 bg-black z-[60] pointer-events-auto" />
              
              {/* Top-right overlay - blocks "..." menu */}
              <div className="absolute top-0 right-0 w-24 h-16 bg-black z-[60] pointer-events-auto" />
              
              {/* Bottom-right overlay - blocks share/watch later buttons */}
              <div className="absolute bottom-0 right-0 w-48 h-20 bg-black z-[60] pointer-events-auto" />
              
              {/* Bottom gradient - allows controls to work through */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/95 to-transparent pointer-events-none z-[50]" />
              
              {/* Brand stamp */}
              <div className="absolute top-2 left-2 z-[70] px-2 py-0.5 rounded bg-gradient-to-r from-violet-600 to-pink-500 text-white text-[10px] font-semibold pointer-events-none">
                UPSC Nadiya
              </div>
              
              {/* Custom Play Button Overlay - shows when YouTube video is paused */}
              {!ytPlaying && (
                <div className="absolute inset-0 z-[7] flex items-center justify-center pointer-events-auto bg-black/30">
                  <button
                    onClick={() => {
                      if (iframeRef.current?.contentWindow) {
                        iframeRef.current.contentWindow.postMessage(
                          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
                          "*"
                        );
                      }
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                  >
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
                  </button>
                </div>
              )}
              
              {/* Custom Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 z-[8] px-2 sm:px-3 pb-3 sm:pb-4 pointer-events-none">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Time display */}
                  <span className="text-[9px] sm:text-[10px] text-white/90 font-medium min-w-[60px] sm:min-w-[70px]">
                    {formatTime(ytProgress.currentTime)} / {formatTime(ytProgress.duration)}
                  </span>
                  {/* Progress bar - clickable for seeking */}
                  <input
                    type="range"
                    min="0"
                    max={ytProgress.duration || 100}
                    step="0.1"
                    value={ytProgress.currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer pointer-events-auto"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <span className="text-sm">No video added yet for this lecture</span>
              <span className="text-xs text-muted-foreground/70">Add a YouTube ID, Drive link, or upload a video in admin</span>
            </div>
          )}
        </div>

        {/* Custom Fullscreen Toggle & Playback Controls */}
        {(hasUploadedVideo || hasYoutubeVideo) && (
          <div className="absolute bottom-3 right-3 z-[10] flex items-center gap-2">
            {/* Backward 10s */}
            <button
              onClick={handleBackward}
              className="bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 transition-colors"
              title="Backward 10s"
            >
              <Rewind className="w-4 h-4" />
            </button>

            {/* Forward 10s */}
            <button
              onClick={handleForward}
              className="bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 transition-colors"
              title="Forward 10s"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Playback Speed Control */}
            <div className="relative">
              <button 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 transition-colors flex items-center gap-1"
              >
                <FastForward className="w-4 h-4" />
                <span className="text-xs font-bold">{playbackSpeed}x</span>
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-xl p-2 border border-white/10 min-w-[120px]">
                  <p className="text-[10px] text-slate-400 font-semibold mb-2 px-1">Playback Speed</p>
                  <div className="space-y-1">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaybackSpeedChange(speed);
                          setShowSpeedMenu(false);
                        }}
                        className={"w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors " + (speed === playbackSpeed ? "bg-primary text-white" : "text-slate-300 hover:bg-white/10")}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Auto-Next Toggle */}
            <button
              onClick={() => setAutoNextEnabled(!autoNextEnabled)}
              className={"bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 transition-colors " + (autoNextEnabled ? "text-primary" : "text-slate-400")}
              title="Auto-play next lecture"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* Close button in fullscreen */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-[10] bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Anti-piracy Watermark */}
        <WatermarkOverlay visible={!isFullscreen} />

        {/* Tab-switch blur overlay disabled */}

        {/* Branding badge */}
        {!isFullscreen && (
          <div className="absolute top-3 right-3 pointer-events-none z-10">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/10">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              UPSC Nadiya
            </div>
          </div>
        )}

        {/* Free Preview Badge */}
        {(lecture.free_preview || isFirstFive) && !isFullscreen && (
          <div className="absolute top-3 left-3 pointer-events-none z-10">
            <div className="flex items-center gap-1 bg-emerald-500/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
              <Eye className="w-3 h-3" /> Free Preview
            </div>
          </div>
        )}
      </div>

      {/* Lecture info + complete */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-800 leading-snug">{lecture.title}</h2>
            <p className="text-slate-400 text-xs mt-0.5">{course.title}</p>
            {lecture.duration && (
              <p className="text-slate-500 text-[10px] mt-1">Duration: {lecture.duration}</p>
            )}
          </div>
          {completed ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-emerald-100 shrink-0">
              <CheckCircle className="w-3.5 h-3.5" /> Completed
            </div>
          ) : (
            <button
              onClick={handleMarkComplete}
              className="flex items-center gap-1.5 bg-violet-600 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shrink-0 shadow-sm hover:shadow-md transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Mark Done
            </button>
          )}
        </div>
      </div>

      </div>{/* end left column */}

      {/* RIGHT COLUMN: doubts */}
      <div className="space-y-3 mt-4 md:mt-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <h3 className="font-semibold text-sm text-slate-800">Doubts & Discussion</h3>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Textarea
            placeholder="Ask a doubt about this lecture..."
            value={newDoubt}
            onChange={(e) => setNewDoubt(e.target.value)}
            rows={2}
            className="rounded-xl border-slate-200 bg-slate-50 text-slate-800 resize-none text-sm focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            onClick={handleSubmitDoubt}
          >
            <Send className="w-3.5 h-3.5" /> Submit Doubt
          </button>
        </div>

        {lectureDoubts.length > 0 ? (
          <div className="space-y-2.5">
            {lectureDoubts.map((d) => (
              <div key={d.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {d.student_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{d.student_name}</span>
                  {d.reply ? (
                    <span className="ml-auto bg-emerald-50 text-emerald-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100">Answered</span>
                  ) : (
                    <span className="ml-auto bg-amber-50 text-amber-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-amber-100">Pending</span>
                  )}
                </div>
                <p className="text-sm text-slate-600">{d.question}</p>
                {d.reply && (
                  <div className="bg-violet-50 rounded-xl p-3 mt-2.5 border border-violet-100">
                    <p className="text-[9px] font-semibold text-violet-600 uppercase tracking-wide mb-1">Teacher's Reply</p>
                    <p className="text-xs text-slate-500">{d.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
            <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No doubts yet. Be the first to ask!</p>
          </div>
        )}
      </div>{/* end right column */}
      </div>{/* end 2-col grid */}
    </div>
  );
};

export default VideoPlayerPage;
