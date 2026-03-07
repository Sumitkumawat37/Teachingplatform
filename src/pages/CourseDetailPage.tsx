import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lectures, courses } from "@/lib/mock-data";
import { usePurchase } from "@/lib/purchase-context";
import { useParams, useNavigate } from "react-router-dom";
import { Play, CheckCircle, ChevronLeft, Clock, Lock, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { hasPurchased, purchaseCourse } = usePurchase();
  const course = courses.find((c) => c.id === courseId);
  const courseLectures = lectures.filter((l) => l.courseId === courseId);
  const purchased = hasPurchased(courseId || "");

  const chapters = [...new Set(courseLectures.map((l) => l.chapter))];

  if (!course) return <div className="p-8 text-center text-muted-foreground">Course not found</div>;

  const handleBuy = () => {
    toast.info("Processing demo payment...", { duration: 1500 });
    setTimeout(() => {
      purchaseCourse(course.id);
      toast.success("🎉 Course purchased successfully! All lectures are now unlocked.");
    }, 1500);
  };

  const handleLectureClick = (lecture: typeof courseLectures[0]) => {
    const canAccess = lecture.freePreview || purchased;
    if (!canAccess) {
      toast.error("Purchase this course to unlock all lectures.");
      return;
    }
    navigate(`/courses/${courseId}/lecture/${lecture.id}`);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Course Header with Thumbnail */}
      <div className="rounded-2xl overflow-hidden relative">
        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-44 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-xl font-bold text-primary-foreground">{course.title}</h2>
          <p className="text-primary-foreground/70 text-sm mt-1">{course.description}</p>
          <div className="flex items-center gap-3 mt-2 text-primary-foreground/80 text-xs">
            <span>{course.chapters} chapters</span>
            <span>·</span>
            <span>{course.lectures} lectures</span>
            <span>·</span>
            <span>{course.instructor}</span>
          </div>
        </div>
      </div>

      {/* Purchase Banner */}
      {!purchased && (
        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Unlock Full Course</p>
              <p className="text-xs text-muted-foreground mt-0.5">First 2 lectures are free to preview</p>
              <p className="text-lg font-bold text-primary mt-1">₹{course.price}</p>
            </div>
            <Button onClick={handleBuy} size="lg">
              <ShoppingCart className="w-4 h-4 mr-2" /> Buy Course
            </Button>
          </div>
        </Card>
      )}

      {chapters.map((chapter) => (
        <div key={chapter}>
          <h3 className="font-bold text-sm mb-2 text-muted-foreground uppercase tracking-wide">{chapter}</h3>
          <div className="space-y-2">
            {courseLectures
              .filter((l) => l.chapter === chapter)
              .map((lecture) => {
                const canAccess = lecture.freePreview || purchased;
                return (
                  <Card
                    key={lecture.id}
                    className={`p-3 flex items-center gap-3 transition-shadow ${
                      canAccess ? "cursor-pointer hover:card-shadow" : "opacity-70"
                    }`}
                    onClick={() => handleLectureClick(lecture)}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      !canAccess ? "bg-muted" :
                      lecture.completed ? "bg-success/10" : "bg-primary/10"
                    }`}>
                      {!canAccess ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : lecture.completed ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <Play className="w-4 h-4 text-primary" fill="currentColor" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{lecture.title}</h4>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mt-0.5">
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {lecture.duration}</span>
                        {lecture.freePreview && !purchased && (
                          <Badge className="bg-success/10 text-success border-0 text-[10px]">
                            <Eye className="w-2.5 h-2.5 mr-0.5" /> Free
                          </Badge>
                        )}
                      </div>
                    </div>
                    {lecture.completed && <Badge variant="secondary" className="text-[10px]">Done</Badge>}
                    {!canAccess && <Lock className="w-4 h-4 text-muted-foreground" />}
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseDetailPage;
