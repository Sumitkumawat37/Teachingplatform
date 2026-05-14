import { Card } from "@/components/ui/card";
import { useCourses, useLectures, useQuizzes, useAnnouncements, useDoubts, useProfiles } from "@/lib/supabase-data";
import { Users, BookOpen, Trophy, Megaphone, TrendingUp, Video, MessageCircle, ShoppingCart, Calendar, Clock, UserCheck, BarChart3, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

const studentActivityData = [
  { day: "Mon", active: 42 }, { day: "Tue", active: 38 }, { day: "Wed", active: 55 },
  { day: "Thu", active: 47 }, { day: "Fri", active: 62 }, { day: "Sat", active: 30 }, { day: "Sun", active: 25 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures();
  const { data: quizzes = [] } = useQuizzes();
  const { data: announcements = [] } = useAnnouncements();
  const { data: doubts = [] } = useDoubts();
  const { data: profiles = [] } = useProfiles();

  const pendingDoubts = doubts.filter((d) => !d.reply).length;

  const stats = [
    { icon: Users, label: "Students", value: profiles.length, color: "gradient-primary", subtext: "Total enrolled", to: "/admin/students" },
    { icon: BookOpen, label: "Courses", value: courses.length, color: "gradient-info", subtext: "Available", to: "/admin/content" },
    { icon: Trophy, label: "Quizzes", value: quizzes.length, color: "gradient-warning", subtext: "Created", to: "/admin/quizzes" },
    { icon: Video, label: "Lectures", value: lectures.length, color: "gradient-success", subtext: "Published", to: "/admin/content" },
    { icon: Megaphone, label: "Announcements", value: announcements.length, color: "gradient-primary", subtext: "Active", to: "/admin/announcements" },
    { icon: MessageCircle, label: "Pending Doubts", value: pendingDoubts, color: "gradient-warning", subtext: "Need reply", to: "/admin/doubts" },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Manage your courses and track student progress</p>
          </div>
          <div className="hidden sm:block">
            <BarChart3 className="w-12 h-12 text-primary animate-bounce-subtle" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label} 
            className="p-5 hover-lift cursor-pointer border-0 shadow-lg animate-scale-in" 
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => navigate(stat.to)}
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-foreground mb-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Student Activity Chart */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Student Activity
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={studentActivityData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="active" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/admin/access")}
              className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover-lift transition-all duration-200 text-left"
            >
              <ShoppingCart className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">Course Access</p>
              <p className="text-xs text-muted-foreground mt-1">Manage enrollments</p>
            </button>
            <button
              onClick={() => navigate("/admin/live")}
              className="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20 hover-lift transition-all duration-200 text-left"
            >
              <Video className="w-6 h-6 text-success mb-2" />
              <p className="text-sm font-medium text-foreground">Live Classes</p>
              <p className="text-xs text-muted-foreground mt-1">Schedule sessions</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Students */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Recent Students
          </h3>
          <button 
            onClick={() => navigate('/admin/students')}
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View all →
          </button>
        </div>
        <div className="space-y-3">
          {profiles.slice(0, 4).map((student, index) => (
            <div key={student.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-scale-in" style={{ animationDelay: `${(index + 6) * 100}ms` }}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {student.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground truncate">{student.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
          ))}
          {profiles.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">No students yet</h4>
              <p className="text-muted-foreground">Students will appear here when they enroll</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
