import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLecture, useCourses, useDoubts, useCreateDoubt, useLectureProgress, useUpsertLectureProgress } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useAuth } from "@/lib/auth-context";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, Send, MessageCircle, Lock, Eye } from "lucide-react";
import { toast } from "sonner";

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

  const course = courses.find((c) => c.id === courseId);
  const myProgress = progressData.find((p) => p.lecture_id === lectureId);
  const completed = myProgress?.completed ?? false;

  if (!lecture || !course) return <div className="p-8 text-center text-muted-foreground">Lecture not found</div>;

  const canAccess = lecture.free_preview || hasPurchased(courseId || "");

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
        <div className="w-full aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${lecture.youtube_id}?modestbranding=1&rel=0&controls=1&showinfo=0&disablekb=0&iv_load_policy=3&fs=1`}
            title={lecture.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        </div>
        <div className="absolute top-2 right-2 pointer-events-none">
          <Badge className="bg-primary/90 text-primary-foreground text-[10px] backdrop-blur-sm shadow-md">
            EduMaster Lecture
          </Badge>
        </div>
        {lecture.free_preview && (
          <div className="absolute top-2 left-2 pointer-events-none">
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
