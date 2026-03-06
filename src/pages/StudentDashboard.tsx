import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courses, performanceData, lectures, quizzes } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { BookOpen, Trophy, TrendingUp, Video, CheckCircle } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const completedLectures = lectures.filter((l) => l.completed).length;
  const totalLectures = lectures.length;
  const lecturePercent = Math.round((completedLectures / totalLectures) * 100);

  const completedQuizzes = quizzes.filter((q) => q.status === "completed").length;
  const avgQuizScore = quizzes.filter((q) => q.score !== null).reduce((a, b) => a + (b.score || 0), 0) / (quizzes.filter((q) => q.score !== null).length || 1);

  return (
    <div className="space-y-5 animate-slide-up">
      <h2 className="text-xl font-bold">My Dashboard</h2>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: BookOpen, label: "Courses", value: courses.filter((c) => !c.locked).length.toString(), color: "bg-primary/10 text-primary" },
          { icon: Trophy, label: "Avg Score", value: `${Math.round(avgQuizScore)}%`, color: "bg-success/10 text-success" },
          { icon: Video, label: "Lectures Done", value: `${completedLectures}/${totalLectures}`, color: "bg-info/10 text-info" },
          { icon: CheckCircle, label: "Quizzes Done", value: completedQuizzes.toString(), color: "bg-warning/10 text-warning" },
        ].map((stat) => (
          <Card key={stat.label} className="p-3 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color.split(" ")[1]}`} />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Lecture Progress */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-2">Lecture Progress</h3>
        <div className="flex items-center gap-3">
          <Progress value={lecturePercent} className="h-2 flex-1" />
          <span className="text-sm font-bold text-primary">{lecturePercent}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{completedLectures} of {totalLectures} lectures completed</p>
      </Card>

      {/* Performance Chart */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Performance Trend</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={performanceData}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="score" fill="hsl(217, 91%, 50%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Enrolled Courses */}
      <div>
        <h3 className="font-bold text-base mb-3">Enrolled Courses</h3>
        <div className="space-y-3">
          {courses.filter((c) => !c.locked).map((course) => (
            <Card
              key={course.id}
              className="p-4 cursor-pointer hover:card-shadow-lg transition-shadow"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{course.thumbnail}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{course.title}</h4>
                  <p className="text-muted-foreground text-xs">{course.chapters} chapters · {course.lectures} lectures</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={course.progress} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium text-primary">{course.progress}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
