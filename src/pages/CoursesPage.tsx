import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courses } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";

const CoursesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">My Courses</h2>
      <div className="space-y-3">
        {courses.map((course, i) => (
          <Card
            key={course.id}
            className="overflow-hidden cursor-pointer hover:card-shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
            onClick={() => navigate(`/courses/${course.id}`)}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`h-2 bg-gradient-to-r ${course.color}`} />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{course.thumbnail}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm">{course.title}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{course.chapters} chapters</span>
                    <span>{course.lectures} lectures</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={course.progress} className="h-1.5 flex-1" />
                    <span className="text-xs font-semibold text-primary">{course.progress}%</span>
                  </div>
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
