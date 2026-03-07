import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { lectures, courses, doubts } from "@/lib/mock-data";
import { usePurchase } from "@/lib/purchase-context";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, Send, MessageCircle, Lock, Eye } from "lucide-react";
import { toast } from "sonner";

const VideoPlayerPage = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { hasPurchased } = usePurchase();
  const lecture = lectures.find((l) => l.id === lectureId);
  const course = courses.find((c) => c.id === courseId);
  const [completed, setCompleted] = useState(lecture?.completed ?? false);
  const [watchedPercent, setWatchedPercent] = useState(lecture?.watchedPercent ?? 0);
  const [newDoubt, setNewDoubt] = useState("");

  const lectureDoubts = doubts.filter((d) => d.lectureId === lectureId);

  if (!lecture || !course) return <div className="p-8 text-center text-muted-foreground">Lecture not found</div>;

  const canAccess = lecture.freePreview || hasPurchased(courseId || "");

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

  return (
    <div className="space-y-4 animate-slide-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back to {course.title}
      </button>

      {/* YouTube Video Player */}
      <div className="relative rounded-2xl overflow-hidden bg-foreground/5">
        <div className="w-full aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${lecture.youtubeId}?rel=0&modestbranding=1`}
            title={lecture.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {lecture.freePreview && (
          <div className="absolute top-2 left-2">
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
            <p className="text-muted-foreground text-sm">{course.title} · {lecture.chapter}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {completed && <Badge className="bg-success text-success-foreground">Completed</Badge>}
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
        <Button onClick={() => { setCompleted(true); toast.success("Lecture marked as completed!"); }} className="w-full" size="lg">
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
