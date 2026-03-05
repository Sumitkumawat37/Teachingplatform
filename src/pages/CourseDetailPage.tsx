import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lectures, courses } from "@/lib/mock-data";
import { useParams, useNavigate } from "react-router-dom";
import { Play, CheckCircle, ChevronLeft, Clock } from "lucide-react";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId);
  const courseLectures = lectures.filter((l) => l.courseId === courseId);

  const chapters = [...new Set(courseLectures.map((l) => l.chapter))];

  if (!course) return <div className="p-8 text-center text-muted-foreground">Course not found</div>;

  return (
    <div className="space-y-4 animate-slide-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className={`rounded-2xl p-5 bg-gradient-to-r ${course.color}`}>
        <div className="text-4xl mb-2">{course.thumbnail}</div>
        <h2 className="text-xl font-bold text-primary-foreground">{course.title}</h2>
        <p className="text-primary-foreground/70 text-sm mt-1">{course.description}</p>
        <div className="flex items-center gap-3 mt-3 text-primary-foreground/80 text-xs">
          <span>{course.chapters} chapters</span>
          <span>·</span>
          <span>{course.lectures} lectures</span>
        </div>
      </div>

      {chapters.map((chapter) => (
        <div key={chapter}>
          <h3 className="font-bold text-sm mb-2 text-muted-foreground uppercase tracking-wide">{chapter}</h3>
          <div className="space-y-2">
            {courseLectures
              .filter((l) => l.chapter === chapter)
              .map((lecture) => (
                <Card
                  key={lecture.id}
                  className="p-3 flex items-center gap-3 cursor-pointer hover:card-shadow transition-shadow"
                  onClick={() => navigate(`/courses/${courseId}/lecture/${lecture.id}`)}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    lecture.completed ? "bg-success/10" : "bg-primary/10"
                  }`}>
                    {lecture.completed ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Play className="w-4 h-4 text-primary" fill="currentColor" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{lecture.title}</h4>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                      <Clock className="w-3 h-3" /> {lecture.duration}
                    </div>
                  </div>
                  {lecture.completed && <Badge variant="secondary" className="text-[10px]">Done</Badge>}
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseDetailPage;
