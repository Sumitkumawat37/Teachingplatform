import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { lectures, courses } from "@/lib/mock-data";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, Play } from "lucide-react";

const VideoPlayerPage = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const lecture = lectures.find((l) => l.id === lectureId);
  const course = courses.find((c) => c.id === courseId);
  const [completed, setCompleted] = useState(lecture?.completed ?? false);

  if (!lecture || !course) return <div className="p-8 text-center text-muted-foreground">Lecture not found</div>;

  return (
    <div className="space-y-4 animate-slide-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back to {course.title}
      </button>

      {/* Video Player Placeholder */}
      <div className="relative aspect-video rounded-2xl bg-foreground/5 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <Play className="w-8 h-8 text-primary" fill="currentColor" />
          </div>
          <p className="text-sm text-muted-foreground">Demo Video Player</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{lecture.duration}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div className="h-full bg-primary rounded-r" style={{ width: completed ? "100%" : "35%" }} />
        </div>
      </div>

      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">{lecture.title}</h2>
            <p className="text-muted-foreground text-sm">{course.title} · {lecture.chapter}</p>
          </div>
          {completed && <Badge className="bg-success text-success-foreground shrink-0">Completed</Badge>}
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
    </div>
  );
};

export default VideoPlayerPage;
