import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCourses } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useNavigate } from "react-router-dom";
import { Lock, ShoppingCart, Eye } from "lucide-react";
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
      toast.success("🎉 Course purchased successfully! All lectures are now unlocked.");
    }, 1500);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading courses...</div>;

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Course Marketplace</h2>
      <div className="space-y-3">
        {courses.map((course, i) => {
          const purchased = hasPurchased(course.id);
          return (
            <Card
              key={course.id}
              className="overflow-hidden transition-all cursor-pointer hover:card-shadow-lg hover:scale-[1.01] active:scale-[0.99]"
              onClick={() => navigate(`/courses/${course.id}`)}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative">
                <img
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop"}
                  alt={course.title}
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="font-bold text-sm text-primary-foreground">{course.title}</h3>
                  <p className="text-primary-foreground/70 text-xs">{course.instructor}</p>
                </div>
                {!purchased && (
                  <Badge className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground border-0 text-[10px] flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> LOCKED
                  </Badge>
                )}
                {purchased && (
                  <Badge className="absolute top-2 right-2 bg-success/90 text-success-foreground border-0 text-[10px]">
                    ENROLLED
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <p className="text-muted-foreground text-xs line-clamp-1">{course.description}</p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                  <span className="text-[10px] bg-accent px-1.5 py-0.5 rounded">{course.category}</span>
                </div>
                {!purchased && (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">₹{course.price}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        <Eye className="w-2.5 h-2.5 mr-0.5" /> 2 Free Previews
                      </Badge>
                    </div>
                    <Button size="sm" className="text-xs h-7" onClick={(e) => handleBuyCourse(e, course.id)}>
                      <ShoppingCart className="w-3 h-3 mr-1" /> Buy Course
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CoursesPage;
