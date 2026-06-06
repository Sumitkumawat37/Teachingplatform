import { useCourses, useLectures, useChapters, useCourseFeedback, useCreateFeedback, useDeleteFeedback, useCourseReviewVideos } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useParams, useNavigate } from "react-router-dom";
import { Play, ChevronLeft, Clock, Lock, Eye, ShoppingCart, CheckCircle, Users, BookOpen, Star, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { memo, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ReviewVideoGallery } from "@/components/ReviewVideoGallery";

const CourseDetailPage = memo(() => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { hasPurchased, purchaseCourse } = usePurchase();
  const { user } = useAuth();
  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures(courseId);
  const { data: chapters = [] } = useChapters(courseId);
  const { data: feedback = [] } = useCourseFeedback(courseId);
  const createFeedback = useCreateFeedback();
  const deleteFeedback = useDeleteFeedback();
  const { data: reviewVideos = [] } = useCourseReviewVideos(courseId);

  // Review video gallery (manual trigger)
  const [showReviewGallery, setShowReviewGallery] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const course = courses.find((c) => c.id === courseId);
  const purchased = hasPurchased(courseId || "");

  // Feedback state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

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

  const handleSubmitFeedback = () => {
    if (!user) {
      toast.error("Please login to submit feedback");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    createFeedback.mutate({
      course_id: courseId!,
      user_id: user.id,
      rating,
      comment: comment.trim(),
    }, {
      onSuccess: () => {
        toast.success("Feedback submitted!");
        setRating(0);
        setComment("");
      },
      onError: () => toast.error("Failed to submit feedback"),
    });
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    if (confirm("Delete this feedback?")) {
      deleteFeedback.mutate(feedbackId, {
        onSuccess: () => toast.success("Feedback deleted"),
        onError: () => toast.error("Failed to delete feedback"),
      });
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Desktop 2-col wrapper */}
      <div className="md:grid md:grid-cols-[1fr_1.2fr] md:gap-6 md:items-start">
      {/* LEFT COLUMN: hero + buy card */}
      <div className="space-y-4">

      {/* Hero card */}
      <div className="rounded-2xl overflow-hidden relative shadow-sm border border-slate-100">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-48 object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center text-7xl">
            {course.thumbnail_emoji || "📚"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Category pill */}
        {course.category && (
          <div className="absolute top-3 left-3 bg-violet-600 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-sm">
            {course.category}
          </div>
        )}
        {purchased && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <CheckCircle className="w-2.5 h-2.5" /> Enrolled
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>{course.title}</h2>
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
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800 text-sm">Unlock Full Course</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                <span className="text-[10px] text-slate-400 ml-1">4.9 rating</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{freeLectures} free preview{freeLectures !== 1 ? "s" : ""} included</p>
              <p className="text-2xl font-bold text-violet-600 mt-1">₹{course.price}</p>
            </div>
            <button
              onClick={handleBuy}
              className="bg-gradient-to-r from-violet-600 to-pink-500 text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0 shadow-sm hover:shadow-md transition-all"
            >
              <ShoppingCart className="w-4 h-4" /> Enroll Now
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <p className="text-[10px] text-slate-400">Lifetime access · All future updates included · 24hr doubt support</p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-emerald-700 text-sm">You're enrolled!</p>
            <p className="text-emerald-600 text-xs mt-0.5">All {lectures.length} lectures are unlocked for you.</p>
          </div>
        </div>
      )}

      </div>{/* end left column */}

      {/* RIGHT COLUMN: curriculum */}
      <div className="space-y-4 mt-4 md:mt-0">
        <h3 className="font-semibold text-base text-slate-800">Course Curriculum</h3>
        {chapters.map((chapter, ci) => (
          <div key={chapter.id}>
            {/* Chapter header */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                {ci + 1}
              </div>
              <h4 className="font-semibold text-sm text-slate-800">{chapter.title}</h4>
            </div>
            <div className="space-y-2 pl-2">
              {lectures
                .filter((l) => l.chapter_id === chapter.id)
                .map((lecture) => {
                  const canAccess = lecture.free_preview || purchased;
                  return (
                    <div
                      key={lecture.id}
                      className={`bg-white rounded-xl p-3 flex items-center gap-3 border border-slate-100 shadow-sm transition-all duration-200 ${
                        canAccess ? "cursor-pointer hover:shadow-md" : "opacity-60"
                      }`}
                      onClick={() => handleLectureClick(lecture)}
                    >
                      {/* Number / lock icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        !canAccess
                          ? "bg-slate-50"
                          : "bg-gradient-to-br from-violet-500 to-pink-500 shadow-sm"
                      }`}>
                        {!canAccess ? (
                          <Lock className="w-3.5 h-3.5 text-gray-500" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-white" fill="white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm text-slate-700 truncate">{lecture.title}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lecture.duration && (
                            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                              <Clock className="w-2.5 h-2.5" /> {lecture.duration}
                            </span>
                          )}
                          {lecture.free_preview && !purchased && (
                            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                              <Eye className="w-2.5 h-2.5" /> Free
                            </span>
                          )}
                        </div>
                      </div>

                      {!canAccess && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>{/* end right column */}
      </div>{/* end 2-col grid */}

      {/* Feedback Section - Accessible to all students */}
      <div className="mt-6 space-y-4">
        <h3 className="font-semibold text-base text-slate-800">Course Feedback</h3>
        
        {/* Submit Feedback Form */}
        {user && (
          <Card className="p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Rate this course</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Share your experience with this course..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <Button
              onClick={handleSubmitFeedback}
              disabled={createFeedback.isPending}
              className="w-full"
            >
              {createFeedback.isPending ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Submit Feedback</>}
            </Button>
          </Card>
        )}

        {/* Feedback List */}
        {feedback.length > 0 ? (
          <div className="space-y-3">
            {feedback.map((fb: any) => (
              <Card key={fb.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(fb.profiles?.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-slate-800">{fb.profiles?.name || "Anonymous"}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= fb.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{fb.comment}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {user && (fb.user_id === user.id) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive shrink-0"
                      onClick={() => handleDeleteFeedback(fb.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No feedback yet. Be the first to share your experience!</p>
        )}
      </div>

      {/* Review Videos Section */}
      {reviewVideos.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-base text-slate-800">Course Review Videos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {reviewVideos.map((rv: any, index: number) => (
              <Card
                key={rv.id}
                className="cursor-pointer overflow-hidden hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedVideoIndex(index);
                  setShowReviewGallery(true);
                }}
              >
                <div className="aspect-video bg-slate-900 relative">
                  <img
                    src={`https://img.youtube.com/vi/${rv.youtube_id}/mqdefault.jpg`}
                    alt={rv.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-slate-700 truncate">{rv.title}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Review Video Gallery - Manual trigger */}
      <ReviewVideoGallery
        videos={reviewVideos}
        open={showReviewGallery}
        onOpenChange={setShowReviewGallery}
        startIndex={selectedVideoIndex}
      />
    </div>
  );
});

export default CourseDetailPage;
