import { Card } from "@/components/ui/card";
import { students, courses, quizzes, announcements, liveClasses, lectures, doubts } from "@/lib/mock-data";
import { Users, BookOpen, Trophy, Megaphone, TrendingUp, Video, MessageCircle, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const studentActivityData = [
  { day: "Mon", active: 42 },
  { day: "Tue", active: 38 },
  { day: "Wed", active: 55 },
  { day: "Thu", active: 47 },
  { day: "Fri", active: 62 },
  { day: "Sat", active: 30 },
  { day: "Sun", active: 25 },
];

const AdminDashboard = () => {
  const pendingDoubts = doubts.filter((d) => !d.reply).length;

  const stats = [
    { icon: Users, label: "Students", value: students.length, color: "text-primary", bg: "bg-primary/10" },
    { icon: BookOpen, label: "Courses", value: courses.length, color: "text-info", bg: "bg-info/10" },
    { icon: Trophy, label: "Quizzes", value: quizzes.length, color: "text-warning", bg: "bg-warning/10" },
    { icon: Video, label: "Lectures", value: lectures.length, color: "text-success", bg: "bg-success/10" },
    { icon: Megaphone, label: "Announcements", value: announcements.length, color: "text-primary", bg: "bg-primary/10" },
    { icon: MessageCircle, label: "Pending Doubts", value: pendingDoubts, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold">Teacher Dashboard</h2>
        <p className="text-muted-foreground text-sm">Welcome back, Teacher Admin</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-1`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Student Activity (This Week)
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={studentActivityData}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="active" fill="hsl(217, 91%, 50%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Students */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Recent Students</h3>
        <div className="space-y-2">
          {students.slice(0, 3).map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-1.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {s.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.lastActive}</p>
              </div>
              <span className="text-xs font-medium text-primary">{s.avgScore}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
