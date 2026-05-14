import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourses, useQuizAttempts, useLectureProgress, useLectures } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { BookOpen, Trophy, Video, CheckCircle } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { hasPurchased } = usePurchase();
  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures();
  const { data: attempts = [] } = useQuizAttempts();
  const { data: progress = [] } = useLectureProgress();

  const completedLectures = progress.filter((p) => p.completed).length;
  const totalLectures = lectures.length;
  const lecturePercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  const avgQuizScore = attempts.length > 0
    ? Math.round(attempts.reduce((a, b) => a + (b.total > 0 ? (b.score / b.total) * 100 : 0), 0) / attempts.length)
    : 0;

  const purchasedCourses = courses.filter((c) => hasPurchased(c.id));

  const chartData = attempts.slice(0, 6).reverse().map((a, i) => ({
    quiz: `Q${i + 1}`,
    score: a.total > 0 ? Math.round((a.score / a.total) * 100) : 0,
  }));

  return (
    <div className="space-y-5 animate-slide-up">
      <h2 className="text-xl font-bold">My Dashboard</h2>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: BookOpen, label: "Courses", value: purchasedCourses.length.toString(), color: "bg-primary/10 text-primary" },
          { icon: Trophy, label: "Avg Score", value: `${avgQuizScore}%`, color: "bg-success/10 text-success" },
          { icon: Video, label: "Lectures Done", value: `${completedLectures}/${totalLectures}`, color: "bg-info/10 text-info" },
          { icon: CheckCircle, label: "Quizzes Done", value: attempts.length.toString(), color: "bg-warning/10 text-warning" },
        ].map((stat) => (
          <Card key={stat.label} className="p-3 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color.split(" ")[1]}`} />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-2">Lecture Progress</h3>
        <div className="flex items-center gap-3">
          <Progress value={lecturePercent} className="h-2 flex-1" />
          <span className="text-sm font-bold text-primary">{lecturePercent}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{completedLectures} of {totalLectures} lectures completed</p>
      </Card>

      {chartData.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <XAxis dataKey="quiz" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="score" fill="hsl(217, 91%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div>
        <h3 className="font-bold text-base mb-3">Enrolled Courses</h3>
        <div className="space-y-3">
          {purchasedCourses.map((course) => (
            <Card key={course.id} className="p-4 cursor-pointer hover:card-shadow-lg transition-shadow" onClick={() => navigate(`/courses/${course.id}`)}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{course.thumbnail_emoji}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{course.title}</h4>
                  <p className="text-muted-foreground text-xs">{course.category}</p>
                </div>
              </div>
            </Card>
          ))}
          {purchasedCourses.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">No enrolled courses yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
