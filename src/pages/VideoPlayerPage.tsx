import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLecture, useCourses, useDoubts, useCreateDoubt, useLectureProgress, useUpsertLectureProgress } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useAuth } from "@/lib/auth-context";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, Send, MessageCircle, Lock, Eye, Play } from "lucide-react";
import { toast } from "sonner";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoCompletedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Track progress for uploaded videos
  useEffect(() => {
    autoCompletedRef.current = completed;
    const video = videoRef.current;
    if (!video || !hasUploadedVideo) return;

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        const pct = (video.currentTime / video.duration) * 100;
        if (pct >= 80 && !autoCompletedRef.current) {
          handleAutoComplete();
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [hasUploadedVideo, completed, handleAutoComplete]);

  if (!lecture || !course) return <div className="p-8 text-center text-muted-foreground">Lecture not found</div>;

  if (!canAccess) {
    return (
      <div className="space-y-4 animate-slide-up">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-lg font-bold">Lecture Locked</h2>
          <p className="text-muted-foreground text-sm mt-2">Purchase this course to unlock all lectures.</p>
          <Button className="mt-4" onClick={() => navigate(`/courses/${courseId}`)}>
            Go to Course
          </Button>
        </Card>
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

  // Build YouTube embed URL with privacy-enhanced mode
  const getYoutubeEmbedUrl = () => {
    if (!hasYoutubeVideo) return "";
    const params = new URLSearchParams({
      modestbranding: "1",
      rel: "0",
      controls: "1",
      playsinline: "1",
      showinfo: "0",
      iv_load_policy: "3",
      fs: "1",
      cc_load_policy: "0",
      disablekb: "0",
      enablejsapi: "1",
      origin: window.location.origin,
    });
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back to {course.title}
      </button>

      {/* Native-style Video Player */}
      <div
        className="relative rounded-2xl overflow-hidden bg-foreground/5 shadow-lg border border-border"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="w-full aspect-video bg-black relative">
          {hasUploadedVideo ? (
            // Native HTML5 Video Player for uploaded videos
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
          ) : hasYoutubeVideo ? (
            // Privacy-enhanced YouTube embed
            <iframe
              src={getYoutubeEmbedUrl()}
              title={lecture.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            // No video placeholder
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <span className="text-sm">No video added yet for this lecture</span>
              <span className="text-xs text-muted-foreground/70">Add a YouTube ID or upload a video in admin</span>
            </div>
          )}
        </div>

        {/* EduMaster Badge */}
        <div className="absolute top-2 right-2 pointer-events-none z-10">
          <Badge className="bg-primary/90 text-primary-foreground text-[10px] backdrop-blur-sm shadow-md">
            EduMaster Lecture
          </Badge>
        </div>

        {/* Free Preview Badge */}
        {lecture.free_preview && (
          <div className="absolute top-2 left-2 pointer-events-none z-10">
            <Badge className="bg-success text-success-foreground text-[10px]">
              <Eye className="w-3 h-3 mr-0.5" /> Free Preview
            </Badge>
          </div>
        )}
      </div>

      {/* Lecture Info */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">{lecture.title}</h2>
            <p className="text-muted-foreground text-sm">{course.title} · {(lecture as any).chapters?.title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {completed && <Badge className="bg-success text-success-foreground">Completed</Badge>}
          </div>
        </div>
      </div>

      {/* About Section */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-2">About this lecture</h3>
        <p className="text-muted-foreground text-sm">
          In this lecture, you'll learn about {lecture.title.toLowerCase()} with step-by-step examples and practice problems.
          Duration: {lecture.duration}.
        </p>
      </Card>

      {/* Mark Complete Button */}
      {!completed && (
        <Button onClick={handleMarkComplete} className="w-full" size="lg">
          <CheckCircle className="w-4 h-4 mr-2" /> Mark as Completed
        </Button>
      )}

      {/* Doubts Section */}
      <div>
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" /> Doubts & Discussion
        </h3>

        <Card className="p-3 mb-3">
          <Textarea
            placeholder="Ask a doubt about this lecture..."
            value={newDoubt}
            onChange={(e) => setNewDoubt(e.target.value)}
            rows={2}
          />
          <Button size="sm" className="mt-2 w-full" onClick={handleSubmitDoubt}>
            <Send className="w-3 h-3 mr-1" /> Submit Doubt
          </Button>
        </Card>

        {lectureDoubts.length > 0 ? (
          <div className="space-y-2">
            {lectureDoubts.map((d) => (
              <Card key={d.id} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {d.student_name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <span className="text-xs font-medium">{d.student_name}</span>
                  {d.reply ? (
                    <Badge className="bg-success/10 text-success border-0 text-[10px]">Answered</Badge>
                  ) : (
                    <Badge className="bg-warning/10 text-warning border-0 text-[10px]">Pending</Badge>
                  )}
                </div>
                <p className="text-sm">{d.question}</p>
                {d.reply && (
                  <div className="bg-accent/50 rounded-lg p-2 mt-2">
                    <p className="text-[10px] font-medium text-primary">Teacher's Reply</p>
                    <p className="text-xs text-muted-foreground">{d.reply}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-4">No doubts yet for this lecture</p>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerPage;
