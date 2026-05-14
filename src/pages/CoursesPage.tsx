import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useNavigate } from "react-router-dom";
import { Lock, ShoppingCart, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const CoursesPage = () => {
  const navigate = useNavigate();
  const { hasPurchased, purchaseCourse } = usePurchase();
  const { data: courses = [], isLoading } = useCourses();

  const handleBuyCourse = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    toast.info("Processing demo payment...", { duration: 1500 });
    setTimeout(() => {
      purchaseCourse(courseId);
      toast.success("🎉 Course purchased! All lectures unlocked.");
    }, 1500);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading courses...</div>;

  return (
    <div className="space-y-4 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold">Course Marketplace</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Tap any course to preview · 2 free lectures included</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {courses.map((course, i) => {
          const purchased = hasPurchased(course.id);
          return (
            <Card
              key={course.id}
              className="overflow-hidden cursor-pointer transition-all hover:card-shadow-lg hover:scale-[1.02] active:scale-[0.98] flex flex-col"
              onClick={() => navigate(`/courses/${course.id}`)}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Square thumbnail */}
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-primary/10">
                    {course.thumbnail_emoji || "📚"}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />

                {/* Status badge */}
                {purchased ? (
                  <Badge className="absolute top-2 right-2 bg-success text-success-foreground border-0 text-[9px] gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> ENROLLED
                  </Badge>
                ) : (
                  <Badge className="absolute top-2 right-2 bg-background/90 text-foreground border-0 text-[9px] gap-0.5">
                    <Eye className="w-2.5 h-2.5" /> 2 FREE
                  </Badge>
                )}

                {/* Category */}
                {course.category && (
                  <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground border-0 text-[9px]">
                    {course.category}
                  </Badge>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="font-bold text-xs text-primary-foreground line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                </div>
              </div>

              {/* Footer */}
              <div className="p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  {!purchased ? (
                    <p className="text-sm font-bold text-primary">₹{course.price}</p>
                  ) : (
                    <p className="text-[10px] text-success font-semibold">Continue learning</p>
                  )}
                  <p className="text-[10px] text-muted-foreground truncate">{course.instructor}</p>
                </div>
                {!purchased ? (
                  <Button
                    size="sm"
                    className="h-7 px-2 text-[10px] shrink-0"
                    onClick={(e) => handleBuyCourse(e, course.id)}
                  >
                    <ShoppingCart className="w-3 h-3" />
                  </Button>
                ) : (
                  <Lock className="w-4 h-4 text-success shrink-0" style={{ transform: "none" }} />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {courses.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          No courses yet. Check back soon!
        </Card>
      )}
    </div>
  );
};

export default CoursesPage;
