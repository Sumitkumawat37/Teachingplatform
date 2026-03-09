import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLecture, useCourses, useDoubts, useCreateDoubt, useLectureProgress, useUpsertLectureProgress } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useAuth } from "@/lib/auth-context";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, Send, MessageCircle, Lock, Eye, Play, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// Detect what kind of video URL it is
function getVideoType(url: string): "direct" | "drive" | "dropbox" | "iframe" | "unknown" {
  if (!url) return "unknown";
  if (/drive\.google\.com/.test(url)) return "drive";
  if (/dropbox\.com/.test(url)) return "dropbox";
  // Direct video file extensions
  if (/\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(url)) return "direct";
  // Supabase storage URLs are direct
  if (/supabase\.co\/storage/.test(url)) return "direct";
  // Fallback: treat as direct and let browser decide
  return "direct";
}

// Convert share links to embeddable/playable URLs
function toPlayableUrl(url: string): string {
  // Google Drive: convert share link to direct download stream
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  // Dropbox: change ?dl=0 to ?raw=1
  if (/dropbox\.com/.test(url)) {
    return url.replace("?dl=0", "?raw=1").replace("www.dropbox.com", "dl.dropboxusercontent.com");
  }
  return url;
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
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoCompletedRef = useRef(false);

  const course = courses.find((c) => c.id === courseId);
  const myProgress = progressData.find((p) => p.lecture_id === lectureId);
  const completed = myProgress?.completed ?? false;
  const canAccess = lecture ? (lecture.free_preview || hasPurchased(courseId || "")) : false;

  const isValidYoutubeId = (id: string) => /^[a-zA-Z0-9_-]{11}$/.test(id?.trim());
  const youtubeId = lecture?.youtube_id?.trim();
  const rawVideoUrl = ((lecture as any)?.video_url || "").trim();
  const hasYoutubeVideo = !!youtubeId && isValidYoutubeId(youtubeId);
  const hasUploadedVideo = !hasYoutubeVideo && rawVideoUrl.length > 0;

  const videoType = hasUploadedVideo ? getVideoType(rawVideoUrl) : "unknown";
  const playableUrl = hasUploadedVideo ? toPlayableUrl(rawVideoUrl) : "";
  // Google Drive needs an iframe; direct files use <video>
  const useIframeForVideo = videoType === "drive";

  const handleAutoComplete = useCallback(() => {
    if (!user || completed || autoCompletedRef.current) return;
    autoCompletedRef.current = true;
    upsertProgress.mutate({ user_id: user.id, lecture_id: lectureId!, watched_percent: 100, completed: true });
    toast.success("Lecture automatically marked as completed!");
  }, [user, completed, lectureId, upsertProgress]);

  useEffect(() => {
    autoCompletedRef.current = completed;
    const video = videoRef.current;
    if (!video || !hasUploadedVideo || useIframeForVideo) return;
    const onTime = () => {
      if (video.duration > 0 && (video.currentTime / video.duration) * 100 >= 80) handleAutoComplete();
    };
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [hasUploadedVideo, useIframeForVideo, completed, handleAutoComplete]);

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
          <Button className="mt-4" onClick={() => navigate(`/courses/${courseId}`)}>Go to Course</Button>
        </Card>
      </div>
    );
  }

  const handleMarkComplete = () => {
    if (!user) return;
    upsertProgress.mutate({ user_id: user.id, lecture_id: lectureId!, watched_percent: 100, completed: true });
    toast.success("Lecture marked as completed!");
  };

  const handleSubmitDoubt = () => {
    if (!newDoubt.trim() || !user) return;
    createDoubt.mutate({ lecture_id: lectureId!, course_id: courseId!, user_id: user.id, student_name: user.name, question: newDoubt });
    toast.success("Doubt submitted!");
    setNewDoubt("");
  };

  const getYoutubeEmbedUrl = () => {
    const params = new URLSearchParams({ rel: "0", modestbranding: "1", showinfo: "0", iv_load_policy: "3", fs: "1" });
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back to {course.title}
      </button>

      {/* Video Player */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border" onContextMenu={(e) => e.preventDefault()}>
        <div className="w-full aspect-video bg-black relative">

          {hasUploadedVideo && !videoError && useIframeForVideo && (
            // Google Drive / embed-only URLs
            <iframe
              src={playableUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={lecture.title}
            />
          )}

          {hasUploadedVideo && !videoError && !useIframeForVideo && (
            // Direct video file (Supabase storage, MP4 URL, Dropbox, etc.)
            <video
              ref={videoRef}
              key={playableUrl}
              src={playableUrl}
              className="absolute inset-0 w-full h-full"
              controls
              controlsList="nodownload"
              playsInline
              crossOrigin="anonymous"
              poster={lecture.thumbnail_url || undefined}
              onError={() => setVideoError(true)}
              onLoadedData={() => setVideoError(false)}
            >
              Your browser does not support the video tag.
            </video>
          )}

          {hasUploadedVideo && videoError && (
            // Fallback when video can't be played inline
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-muted-foreground font-medium">Can't play this video inline</p>
              <p className="text-xs text-muted-foreground">This may be a CORS restriction or unsupported format.</p>
              <a
                href={rawVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-primary underline"
              >
                <ExternalLink className="w-4 h-4" /> Open video in new tab
              </a>
            </div>
          )}

          {hasYoutubeVideo && (
            // Privacy-enhanced YouTube embed
            <iframe
              key={youtubeId}
              src={getYoutubeEmbedUrl()}
              title={lecture.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              frameBorder="0"
            />
          )}

          {!hasUploadedVideo && !hasYoutubeVideo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <span className="text-sm">No video added yet for this lecture</span>
            </div>
          )}
        </div>

        <div className="absolute top-2 right-2 pointer-events-none z-10">
          <Badge className="bg-primary/90 text-primary-foreground text-[10px] backdrop-blur-sm shadow-md">EduMaster Lecture</Badge>
        </div>
        {lecture.free_preview && (
          <div className="absolute top-2 left-2 pointer-events-none z-10">
            <Badge className="bg-success text-success-foreground text-[10px]">
              <Eye className="w-3 h-3 mr-0.5" /> Free Preview
            </Badge>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">{lecture.title}</h2>
            <p className="text-muted-foreground text-sm">{course.title} · {(lecture as any).chapters?.title}</p>
          </div>
          {completed && <Badge className="bg-success text-success-foreground shrink-0">Completed</Badge>}
        </div>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-2">About this lecture</h3>
        <p className="text-muted-foreground text-sm">
          In this lecture, you'll learn about {lecture.title.toLowerCase()} with step-by-step examples and practice problems. Duration: {lecture.duration}.
        </p>
      </Card>

      {!completed && (
        <Button onClick={handleMarkComplete} className="w-full" size="lg">
          <CheckCircle className="w-4 h-4 mr-2" /> Mark as Completed
        </Button>
      )}

      <div>
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" /> Doubts & Discussion
        </h3>
        <Card className="p-3 mb-3">
          <Textarea placeholder="Ask a doubt about this lecture..." value={newDoubt} onChange={(e) => setNewDoubt(e.target.value)} rows={2} />
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
