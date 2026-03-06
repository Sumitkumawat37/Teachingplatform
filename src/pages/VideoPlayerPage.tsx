import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { lectures, courses, doubts } from "@/lib/mock-data";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, Play, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const VideoPlayerPage = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const lecture = lectures.find((l) => l.id === lectureId);
  const course = courses.find((c) => c.id === courseId);
  const [completed, setCompleted] = useState(lecture?.completed ?? false);
  const [watchedPercent, setWatchedPercent] = useState(lecture?.watchedPercent ?? 0);
  const [newDoubt, setNewDoubt] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const lectureDoubts = doubts.filter((d) => d.lectureId === lectureId);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      const pct = Math.round((video.currentTime / video.duration) * 100);
      setWatchedPercent(pct);
      if (pct >= 80 && !completed) {
        setCompleted(true);
        toast.success("Lecture marked as completed! (80% watched)");
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [completed]);

  if (!lecture || !course) return <div className="p-8 text-center text-muted-foreground">Lecture not found</div>;

  return (
    <div className="space-y-4 animate-slide-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back to {course.title}
      </button>

      {/* Video Player */}
      <div className="relative rounded-2xl overflow-hidden bg-foreground/5">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          controls
          poster=""
          src={lecture.videoUrl}
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div className="h-full bg-primary rounded-r transition-all" style={{ width: `${watchedPercent}%` }} />
        </div>
      </div>

      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">{lecture.title}</h2>
            <p className="text-muted-foreground text-sm">{course.title} · {lecture.chapter}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {completed && <Badge className="bg-success text-success-foreground">Completed</Badge>}
            <span className="text-xs text-muted-foreground">{watchedPercent}% watched</span>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-2">About this lecture</h3>
        <p className="text-muted-foreground text-sm">
          In this lecture, you'll learn about {lecture.title.toLowerCase()} with step-by-step examples and practice problems.
          Duration: {lecture.duration}.
        </p>
      </Card>

      {!completed && (
        <Button onClick={() => setCompleted(true)} className="w-full" size="lg">
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
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={() => {
              if (!newDoubt.trim()) return;
              toast.success("Doubt submitted — demo only");
              setNewDoubt("");
            }}
          >
            <Send className="w-3 h-3 mr-1" /> Submit Doubt
          </Button>
        </Card>

        {lectureDoubts.length > 0 ? (
          <div className="space-y-2">
            {lectureDoubts.map((d) => (
              <Card key={d.id} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {d.studentName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="text-xs font-medium">{d.studentName}</span>
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
