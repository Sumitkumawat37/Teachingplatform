import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courses, performanceData } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { BookOpen, Trophy, TrendingUp } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 animate-slide-up">
      <h2 className="text-xl font-bold">My Dashboard</h2>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: BookOpen, label: "Courses", value: "3", color: "bg-primary/10 text-primary" },
          { icon: Trophy, label: "Avg Score", value: "82%", color: "bg-success/10 text-success" },
          { icon: TrendingUp, label: "Streak", value: "12d", color: "bg-warning/10 text-warning" },
        ].map((stat) => (
          <Card key={stat.label} className="p-3 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color.split(" ")[1]}`} />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

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
          {courses.map((course) => (
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
