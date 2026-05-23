import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useLecture, useCourses, useDoubts, useCreateDoubt, useLectureProgress, useUpsertLectureProgress } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useAuth } from "@/lib/auth-context";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, Send, MessageCircle, Lock, Eye, Play, Maximize, Minimize, X, ShieldCheck, AlertTriangle, FastForward, Settings, RotateCcw, ShieldAlert } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoCompletedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  const { isTabHidden, devToolsOpen, screenRecordingDetected } = useAntiPiracy({ enabled: true });
  const isScreenProtected = useScreenProtection();

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
  const canAccess = lecture ? (lecture.free_preview || hasPurchased(courseId || "")) : false;

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
      return `https://drive.google.com/file/d/${match[1]}/preview?rm=minimal`;
    }
    return videoUrl;
  };

  // Pause video when tab is hidden, resume when visible
  useEffect(() => {
    if (isTabHidden) {
      // Pause uploaded video
      if (hasUploadedVideo && !isDriveVideo && videoRef.current) {
        setWasPlaying(!videoRef.current.paused);
        videoRef.current.pause();
      }
      // Pause YouTube video
      if (hasYoutubeVideo && iframeRef.current?.contentWindow) {
        setWasPlaying(true);
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*"
        );
      }
    } else {
      // Resume uploaded video if it was playing
      if (hasUploadedVideo && !isDriveVideo && videoRef.current && wasPlaying) {
        videoRef.current.play().catch(() => {});
      }
      // Resume YouTube video if it was playing
      if (hasYoutubeVideo && iframeRef.current?.contentWindow && wasPlaying) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      }
    }
  }, [isTabHidden, hasUploadedVideo, hasYoutubeVideo, hasDriveVideo, wasPlaying]);

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
    if (ytPlayerRef.current && hasYoutubeVideo) {
      ytPlayerRef.current.setPlaybackRate(speed);
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
        // Detect when video starts playing for auto-fullscreen
        if (data?.event === "onStateChange" && data?.info === 1 && !videoStarted) {
          setVideoStarted(true);
          // Request fullscreen when video starts
          if (videoContainerRef.current && !isFullscreen) {
            videoContainerRef.current.requestFullscreen?.().catch(() => {});
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

  // Auto-fullscreen for uploaded videos when they start playing
  useEffect(() => {
    if (!hasUploadedVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      if (!videoStarted) {
        setVideoStarted(true);
        if (videoContainerRef.current && !isFullscreen) {
          videoContainerRef.current.requestFullscreen?.().catch(() => {});
        }
      }
    };

    video.addEventListener("play", handlePlay);
    return () => video.removeEventListener("play", handlePlay);
  }, [hasUploadedVideo, videoStarted, isFullscreen]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ytProgressPercent = ytProgress.duration > 0 ? (ytProgress.currentTime / ytProgress.duration) * 100 : 0;

  if (!lecture || !course) return (
    <div className="p-8 text-center">
      <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-3">
        <Play className="w-6 h-6 text-white" />
      </div>
      <p className="text-gray-400 text-sm">Lecture not found</p>
    </div>
  );

  if (!canAccess) {
    return (
      <div className="space-y-4 animate-slide-up">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {course.title}
        </button>
        <div className="glass-card rounded-3xl p-8 text-center neon-border">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <Lock className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Lecture Locked</h2>
          <p className="text-gray-400 text-sm mt-2">Purchase this course to unlock all lectures.</p>
          <button
            className="btn-action ripple mt-5 px-6 py-3 rounded-2xl text-sm font-bold"
            onClick={() => navigate(`/courses/${courseId}`)}
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

  // Build YouTube embed URL with privacy-enhanced mode and hidden branding
  const getYoutubeEmbedUrl = () => {
    if (!hasYoutubeVideo) return "";
    const params = new URLSearchParams({
      modestbranding: "1",
      rel: "0",
      controls: "1",
      playsinline: "0",
      showinfo: "0",
      iv_load_policy: "3",
      fs: "0",
      cc_load_policy: "0",
      disablekb: "1",
      enablejsapi: "1",
      origin: window.location.origin,
      widgetid: "1",
    });
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
  };

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Back nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors press">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {/* Protection indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-500/20">
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
        className={`relative overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen
            ? "fixed inset-0 z-50 rounded-none bg-black flex items-center justify-center"
            : "rounded-3xl bg-black border border-purple-500/15 shadow-purple-900/30"
        }`}
        data-protected
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className={`bg-black relative ${isFullscreen ? "w-full h-full" : "w-full aspect-video"}`}>
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
                className="absolute w-full h-full"
                style={{
                  top: '-100px',
                  left: 0,
                  width: '100%',
                  height: 'calc(100% + 200px)',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen={false}
              />
              {/* Top overlay - gradient to hide YouTube header completely */}
              <div className="absolute top-0 left-0 right-0 h-24 z-[5] pointer-events-auto" style={{ background: 'linear-gradient(to bottom, #000 80%, transparent)' }} />
              {/* Bottom overlay - gradient to hide YouTube footer */}
              <div className="absolute bottom-0 left-0 right-0 h-28 z-[5] pointer-events-none" style={{ background: 'linear-gradient(to top, #000 70%, transparent)' }} />
              {/* Bottom-right - blocks Watch on YouTube button */}
              <div className="absolute bottom-0 right-0 w-56 h-24 bg-black z-[6] pointer-events-auto" />
              {/* Top-right - blocks YouTube menu button */}
              <div className="absolute top-0 right-0 w-24 h-20 bg-black z-[6] pointer-events-auto" />
              {/* Top-left - blocks YouTube logo completely */}
              <div className="absolute top-0 left-0 w-32 h-20 bg-black z-[6] pointer-events-auto" />
              {/* Additional overlay for YouTube title area */}
              <div className="absolute top-20 left-0 right-0 h-12 bg-black z-[6] pointer-events-auto" />
              
              {/* Custom Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 z-[8] px-3 pb-4 pointer-events-none">
                <div className="flex items-center gap-2">
                  {/* Time display */}
                  <span className="text-[10px] text-white/90 font-medium min-w-[70px]">
                    {formatTime(ytProgress.currentTime)} / {formatTime(ytProgress.duration)}
                  </span>
                  {/* Progress bar */}
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${ytProgressPercent}%` }}
                    />
                  </div>
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
            {/* Playback Speed Control */}
            <div className="relative group">
              <button className="bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 transition-colors flex items-center gap-1">
                <FastForward className="w-4 h-4" />
                <span className="text-xs font-bold">{playbackSpeed}x</span>
              </button>
              <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-xl p-2 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity min-w-[120px]">
                <p className="text-[10px] text-gray-400 font-semibold mb-2 px-1">Playback Speed</p>
                <div className="space-y-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handlePlaybackSpeedChange(speed)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        speed === playbackSpeed ? "bg-primary text-white" : "text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Auto-Next Toggle */}
            <button
              onClick={() => setAutoNextEnabled(!autoNextEnabled)}
              className={`bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 transition-colors ${autoNextEnabled ? "text-primary" : "text-gray-400"}`}
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

        {/* Tab-switch blur overlay */}
        <TabBlurOverlay
          visible={(isTabHidden && !tabResumed) || isScreenProtected}
          onResume={() => setTabResumed(true)}
        />

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
        {lecture.free_preview && !isFullscreen && (
          <div className="absolute top-3 left-3 pointer-events-none z-10">
            <div className="flex items-center gap-1 bg-emerald-500/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
              <Eye className="w-3 h-3" /> Free Preview
            </div>
          </div>
        )}
      </div>

      {/* Lecture info + complete */}
      <div className="glass-card rounded-3xl p-4 neon-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white leading-snug">{lecture.title}</h2>
            <p className="text-gray-500 text-xs mt-0.5">{course.title}</p>
            {lecture.duration && (
              <p className="text-gray-500 text-[10px] mt-1">Duration: {lecture.duration}</p>
            )}
          </div>
          {completed ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-500/20 shrink-0">
              <CheckCircle className="w-3.5 h-3.5" /> Completed
            </div>
          ) : (
            <button
              onClick={handleMarkComplete}
              className="flex items-center gap-1.5 btn-primary text-[10px] font-bold px-3 py-1.5 rounded-full shrink-0"
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
          <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-bold text-sm text-white">Doubts & Discussion</h3>
        </div>

        <div className="glass-card rounded-3xl p-4 neon-border">
          <Textarea
            placeholder="Ask a doubt about this lecture..."
            value={newDoubt}
            onChange={(e) => setNewDoubt(e.target.value)}
            rows={2}
            className="rounded-2xl border-purple-500/15 bg-white/5 text-white resize-none input-glow text-sm"
          />
          <button
            className="btn-primary ripple w-full mt-3 py-2.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
            onClick={handleSubmitDoubt}
          >
            <Send className="w-3.5 h-3.5" /> Submit Doubt
          </button>
        </div>

        {lectureDoubts.length > 0 ? (
          <div className="space-y-2.5">
            {lectureDoubts.map((d) => (
              <div key={d.id} className="glass-card rounded-2xl p-4 animate-slide-up neon-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {d.student_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="text-xs font-semibold text-gray-300">{d.student_name}</span>
                  {d.reply ? (
                    <span className="ml-auto bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">Answered</span>
                  ) : (
                    <span className="ml-auto bg-amber-500/10 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">Pending</span>
                  )}
                </div>
                <p className="text-sm text-gray-300">{d.question}</p>
                {d.reply && (
                  <div className="bg-purple-500/10 rounded-xl p-3 mt-2.5 border border-purple-500/15">
                    <p className="text-[9px] font-bold text-purple-400 uppercase tracking-wide mb-1">Teacher's Reply</p>
                    <p className="text-xs text-gray-400">{d.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 text-center neon-border">
            <MessageCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No doubts yet. Be the first to ask!</p>
          </div>
        )}
      </div>{/* end right column */}
      </div>{/* end 2-col grid */}
    </div>
  );
};

export default VideoPlayerPage;
