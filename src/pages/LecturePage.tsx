import { useParams, useNavigate } from "react-router-dom";
import { Play, ChevronLeft, Clock, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCourses, useLectures, useChapters, useCreateDoubt } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { CustomVideoPlayer } from "@/components/CustomVideoPlayer";

const LecturePage = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { hasPurchased } = usePurchase();
  const { user } = useAuth();
  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures(courseId);
  const { data: chapters = [] } = useChapters(courseId);
  const createDoubt = useCreateDoubt();
  const [newDoubt, setNewDoubt] = useState("");

  const course = Array.isArray(courses) ? courses.find((c) => c.id === courseId) : undefined;
  const lecture = Array.isArray(lectures) ? lectures.find((l) => l.id === lectureId) : undefined;
  const purchased = hasPurchased(courseId || "");

  const handleDoubtSubmit = () => {
    if (!newDoubt.trim() || !user || !lectureId || !courseId) return;
    createDoubt.mutate({
      lecture_id: lectureId,
      course_id: courseId,
      user_id: user.id,
      student_name: user.name || user.email,
      question: newDoubt,
    });
    toast.success("Doubt submitted successfully!");
    setNewDoubt("");
  };

  useEffect(() => {
    if (!lecture) {
      toast.error("Lecture not found");
      navigate(`/courses/${courseId}`);
      return;
    }
    // Get lecture index in the course (sorted by chapter order and lecture order)
    const lectureIndex = Array.isArray(lectures) ? lectures.findIndex(l => l.id === lectureId) : -1;
    const canAccess = lecture?.free_preview || purchased;
    if (!canAccess) {
      toast.error("Purchase this course to access this lecture");
      navigate(`/courses/${courseId}`);
      return;
    }
  }, [lecture, purchased, courseId, navigate, lectures]);

  if (!lecture || !course) return null;

  const lectureIndex = Array.isArray(lectures) ? lectures.findIndex((l) => l.id === lectureId) : -1;
  const prevLecture = lectureIndex > 0 && Array.isArray(lectures) ? lectures[lectureIndex - 1] : null;
  const nextLecture = lectureIndex >= 0 && lectureIndex < (lectures?.length || 0) - 1 && Array.isArray(lectures) ? lectures[lectureIndex + 1] : null;

  const handlePrev = () => {
    if (prevLecture) navigate(`/courses/${courseId}/lecture/${prevLecture.id}`);
  };

  const handleNext = () => {
    if (nextLecture) navigate(`/courses/${courseId}/lecture/${nextLecture.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Course
        </button>

        {/* Video Player */}
        <CustomVideoPlayer
          youtubeId={lecture.youtube_id}
          title={lecture.title}
          autoplay={true}
        />

        {/* Lecture Info */}
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{lecture.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {lecture.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {lecture.duration}
              </span>
            )}
            <span>Chapter: {Array.isArray(chapters) ? chapters.find((c) => c.id === lecture.chapter_id)?.title : ''}</span>
          </div>
        </Card>

        {/* Doubt Session Box */}
        <Card className="p-4 space-y-3 border border-pink-100/40 shadow-sm rounded-2xl" style={{ background: '#FFEAF4' }}>
          <h3 className="font-semibold text-sm flex items-center gap-2 text-slate-800">
            <MessageCircle className="w-4 h-4 text-violet-600" /> Ask a Doubt About This Lecture
          </h3>
          <Textarea
            placeholder="Type your doubt or question about this lecture here..."
            value={newDoubt}
            onChange={(e) => setNewDoubt(e.target.value)}
            rows={3}
            className="text-slate-800"
          />
          <Button className="w-full rounded-xl" onClick={handleDoubtSubmit} disabled={!newDoubt.trim()}>
            <Send className="w-4 h-4 mr-2" /> Submit Doubt
          </Button>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrev}
            disabled={!prevLecture}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Lecture
          </Button>
          <Button
            onClick={handleNext}
            disabled={!nextLecture}
            className="flex items-center gap-2"
          >
            Next Lecture <ChevronLeft className="w-4 h-4 rotate-180" />
          </Button>
        </div>

        {/* All Lectures List */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">All Lectures</h2>
          <div className="space-y-3">
            {Array.isArray(chapters) && chapters.map((chapter, ci) => (
              <div key={chapter.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                    {ci + 1}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800">{chapter.title}</h4>
                </div>
                <div className="space-y-2 pl-2">
                  {Array.isArray(lectures) && lectures
                    .filter((l) => l.chapter_id === chapter.id)
                    .map((l) => {
                      // Get lecture index in the course (sorted by chapter order and lecture order)
                      const lIndex = lectures.findIndex(lec => lec.id === l.id);
                      const lCanAccess = l.free_preview || purchased;
                      return (
                        <div
                          key={l.id}
                          className={`bg-white rounded-lg p-3 flex items-center gap-3 border border-slate-100 shadow-sm transition-all ${
                            l.id === lectureId ? "border-violet-500" : ""
                          } ${lCanAccess ? "cursor-pointer hover:shadow-md" : "opacity-60"}`}
                          onClick={() => {
                            if (lCanAccess) navigate(`/courses/${courseId}/lecture/${l.id}`);
                          }}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            lCanAccess ? "bg-gradient-to-br from-violet-500 to-pink-500" : "bg-slate-100"
                          }`}>
                            {lCanAccess ? <Play className="w-3.5 h-3.5 text-white fill-white" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-700 truncate">{l.title}</p>
                            {l.duration && <p className="text-xs text-slate-400">{l.duration}</p>}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LecturePage;
