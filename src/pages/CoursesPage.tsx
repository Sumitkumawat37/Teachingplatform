import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const CoursesPage = () => {
  const navigate = useNavigate();

  const handleCourseClick = (course: typeof courses[0]) => {
    if (course.locked) {
      toast.error("This course is locked. Contact your teacher to get access.");
      return;
    }
    navigate(`/courses/${course.id}`);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">My Courses</h2>
      <div className="space-y-3">
        {courses.map((course, i) => (
          <Card
            key={course.id}
            className={`overflow-hidden transition-all ${
              course.locked ? "opacity-80" : "cursor-pointer hover:card-shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            }`}
            onClick={() => handleCourseClick(course)}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`h-2 bg-gradient-to-r ${course.color}`} />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{course.thumbnail}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{course.title}</h3>
                    {course.locked && (
                      <Badge className="bg-destructive/10 text-destructive border-0 text-[10px] flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> LOCKED
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{course.chapters} chapters</span>
                    <span>{course.lectures} lectures</span>
                  </div>
                  {course.locked ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">₹{course.price}</span>
                      <Button
                        size="sm"
                        className="text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info("Contact your teacher to unlock this course.");
                        }}
                      >
                        Request Access
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={course.progress} className="h-1.5 flex-1" />
                      <span className="text-xs font-semibold text-primary">{course.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
