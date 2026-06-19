import { useCourses } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useNavigate } from "react-router-dom";
import { Lock, ShoppingCart, Eye, CheckCircle2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { memo } from "react";

const CoursesPage = memo(() => {
  const navigate = useNavigate();
  const { hasPurchased, purchaseCourse } = usePurchase();
  const { data: courses = [], isLoading } = useCourses();
  
  // Ensure courses is always an array before mapping
  const coursesArray = Array.isArray(courses) ? courses : [];
  const scrollRef = useScrollReveal();

  const handleBuyCourse = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    toast.info("Processing demo payment...", { duration: 1500 });
    setTimeout(() => {
      purchaseCourse(courseId);
      toast.success("🎉 Course purchased! All lectures unlocked.");
    }, 1500);
  };

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in">
      <div className="h-16 rounded-3xl shimmer-bg" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-3xl overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="aspect-square shimmer-bg" />
            <div className="p-3 space-y-2">
              <div className="h-3 rounded-full shimmer-bg" />
              <div className="h-3 w-2/3 rounded-full shimmer-bg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5" ref={scrollRef}>
      {/* Header */}
      <div className="rounded-2xl p-5 border border-violet-100/40" style={{ background: 'linear-gradient(135deg, #F3EEFF 0%, #EAF6FF 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Course Marketplace</h2>
            <p className="text-slate-500 text-xs">Tap any course to explore</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {coursesArray.map((course) => {
          const purchased = hasPurchased(course.id);
          return (
            <div
              key={course.id}
              className="overflow-hidden cursor-pointer flex flex-col rounded-2xl bg-white shadow-sm border border-slate-100/60 hover:shadow-md hover:-translate-y-1 transition-all duration-250"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              {/* Square thumbnail */}
              <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-slate-50">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-violet-100 to-pink-100">
                    <span>{course.thumbnail_emoji || "📚"}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Status badge */}
                {purchased && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                    <CheckCircle2 className="w-2.5 h-2.5" /> ENROLLED
                  </div>
                )}

                {/* Category */}
                {course.category && (
                  <div className="absolute top-2 left-2 bg-violet-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {course.category}
                  </div>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <h3 className="font-semibold text-xs text-white line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  {!purchased ? (
                    <p className="text-sm font-bold text-violet-600">₹{course.price}</p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 font-semibold">▶ Continue</p>
                  )}
                  <p className="text-[10px] text-slate-400 truncate">{course.instructor}</p>
                </div>
                {!purchased ? (
                  <button
                    className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow shrink-0"
                    onClick={(e) => handleBuyCourse(e, course.id)}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-white" />
                  </button>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {coursesArray.length === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500 text-sm">
          No courses yet. Check back soon!
        </div>
      )}
    </div>
  );
});

export default CoursesPage;
