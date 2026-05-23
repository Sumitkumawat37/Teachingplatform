import { useCourses, useLectures, useChapters } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useParams, useNavigate } from "react-router-dom";
import { Play, ChevronLeft, Clock, Lock, Eye, ShoppingCart, CheckCircle, Users, BookOpen, Star } from "lucide-react";
import { toast } from "sonner";
import { memo } from "react";

const CourseDetailPage = memo(() => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { hasPurchased, purchaseCourse } = usePurchase();
  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures(courseId);
  const { data: chapters = [] } = useChapters(courseId);

  const course = courses.find((c) => c.id === courseId);
  const purchased = hasPurchased(courseId || "");

  const freeLectures = lectures.filter((l) => l.free_preview).length;

  if (!course) return (
    <div className="p-8 text-center">
      <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-3">
        <BookOpen className="w-6 h-6 text-white" />
      </div>
      <p className="text-gray-400 text-sm">Course not found</p>
    </div>
  );

  const handleBuy = () => {
    toast.info("Processing demo payment...", { duration: 1500 });
    setTimeout(() => {
      purchaseCourse(course.id);
      toast.success("🎉 Course purchased successfully! All lectures are now unlocked.");
    }, 1500);
  };

  const handleLectureClick = (lecture: typeof lectures[0]) => {
    const canAccess = lecture.free_preview || purchased;
    if (!canAccess) {
      toast.error("Purchase this course to unlock all lectures.");
      return;
    }
    navigate(`/courses/${courseId}/lecture/${lecture.id}`);
  };

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors press">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Desktop 2-col wrapper */}
      <div className="md:grid md:grid-cols-[1fr_1.2fr] md:gap-6 md:items-start">
      {/* LEFT COLUMN: hero + buy card */}
      <div className="space-y-4">

      {/* Hero card */}
      <div className="rounded-3xl overflow-hidden relative shadow-xl shadow-purple-900/30 neon-border">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-48 object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-purple-900/60 to-pink-900/40 flex items-center justify-center text-7xl">
            {course.thumbnail_emoji || "📚"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Category pill */}
        {course.category && (
          <div className="absolute top-3 left-3 gradient-hero text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-md">
            {course.category}
          </div>
        )}
        {purchased && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <CheckCircle className="w-2.5 h-2.5" /> Enrolled
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-xl font-extrabold text-white leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>{course.title}</h2>
          {course.description && (
            <p className="text-white/70 text-xs mt-1 line-clamp-2">{course.description}</p>
          )}
          {/* Meta pills */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {[
              { icon: BookOpen, label: `${chapters.length} chapters` },
              { icon: Play,     label: `${lectures.length} lectures` },
              { icon: Users,    label: course.instructor },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[9px] font-semibold px-2 py-1 rounded-full border border-white/20">
                <m.icon className="w-2.5 h-2.5" />
                {m.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buy / enrolled card */}
      {!purchased ? (
        <div className="glass-card rounded-3xl p-4 neon-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-extrabold text-white text-sm">Unlock Full Course</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                <span className="text-[10px] text-gray-500 ml-1">4.9 rating</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{freeLectures} free preview{freeLectures !== 1 ? "s" : ""} included</p>
              <p className="text-2xl font-extrabold text-purple-400 mt-1">₹{course.price}</p>
            </div>
            <button
              onClick={handleBuy}
              className="btn-action ripple urgency-pulse px-5 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-2 shrink-0"
            >
              <ShoppingCart className="w-4 h-4" /> Enroll Now
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-purple-500/10 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <p className="text-[10px] text-gray-500">Lifetime access · All future updates included · 24hr doubt support</p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 rounded-3xl p-4 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-emerald-400 text-sm">You're enrolled!</p>
            <p className="text-emerald-500/70 text-xs mt-0.5">All {lectures.length} lectures are unlocked for you.</p>
          </div>
        </div>
      )}

      </div>{/* end left column */}

      {/* RIGHT COLUMN: curriculum */}
      <div className="space-y-4 mt-4 md:mt-0">
        <h3 className="font-bold text-base text-white">Course Curriculum</h3>
        {chapters.map((chapter, ci) => (
          <div key={chapter.id}>
            {/* Chapter header */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                {ci + 1}
              </div>
              <h4 className="font-bold text-sm text-white">{chapter.title}</h4>
            </div>
            <div className="space-y-2 pl-2">
              {lectures
                .filter((l) => l.chapter_id === chapter.id)
                .map((lecture) => {
                  const canAccess = lecture.free_preview || purchased;
                  return (
                    <div
                      key={lecture.id}
                      className={`glass-card rounded-2xl p-3 flex items-center gap-3 neon-border transition-all duration-200 ${
                        canAccess ? "cursor-pointer card-interactive" : "opacity-60"
                      }`}
                      onClick={() => handleLectureClick(lecture)}
                    >
                      {/* Number / lock icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        !canAccess
                          ? "bg-white/5"
                          : "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30"
                      }`}>
                        {!canAccess ? (
                          <Lock className="w-3.5 h-3.5 text-gray-500" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-white" fill="white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm text-white truncate">{lecture.title}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lecture.duration && (
                            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                              <Clock className="w-2.5 h-2.5" /> {lecture.duration}
                            </span>
                          )}
                          {lecture.free_preview && !purchased && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                              <Eye className="w-2.5 h-2.5" /> Free
                            </span>
                          )}
                        </div>
                      </div>

                      {!canAccess && <Lock className="w-3.5 h-3.5 text-gray-600 shrink-0" />}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>{/* end right column */}
      </div>{/* end 2-col grid */}
    </div>
  );
});

export default CourseDetailPage;
