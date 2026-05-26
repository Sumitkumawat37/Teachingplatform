import { Card } from "@/components/ui/card";
import { useCourses, useLectures, useQuizzes, useAnnouncements, useDoubts, useProfiles } from "@/lib/supabase-data";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Users, BookOpen, Trophy, Megaphone, TrendingUp, Video, MessageCircle, ShoppingCart, Calendar, Clock, UserCheck, BarChart3, Activity, Mail, Phone, MapPin, Award, Edit } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

const studentActivityData = [
  { day: "Mon", active: 42 }, { day: "Tue", active: 38 }, { day: "Wed", active: 55 },
  { day: "Thu", active: 47 }, { day: "Fri", active: 62 }, { day: "Sat", active: 30 }, { day: "Sun", active: 25 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures();
  const { data: quizzes = [] } = useQuizzes();
  const { data: announcements = [] } = useAnnouncements();
  const { data: doubts = [] } = useDoubts();
  const { data: profiles = [] } = useProfiles();
  const [studentProfiles, setStudentProfiles] = useState<any[]>([]);

  // Get current teacher's profile
  const myProfile = profiles.find((p: any) => p.user_id === user?.id);

  useEffect(() => {
    const fetchStudentProfiles = async () => {
      const { data: userRoles } = await supabase.from("user_roles").select("user_id, role");
      const adminUserIds = userRoles
        ?.filter((r: any) => r.role === "admin" || r.role === "super_admin")
        .map((r: any) => r.user_id) || [];
      const students = profiles.filter((p: any) => !adminUserIds.includes(p.user_id));
      setStudentProfiles(students);
    };
    if (profiles.length > 0) {
      fetchStudentProfiles();
    }
  }, [profiles]);

  const pendingDoubts = doubts.filter((d) => !d.reply).length;
  const isSuperAdmin = role === "super_admin";

  const stats = [
    { icon: Users, label: "Students", value: studentProfiles.length, color: "gradient-primary", subtext: "Total enrolled", to: "/admin/students" },
    { icon: BookOpen, label: "Courses", value: courses.length, color: "gradient-info", subtext: "Available", to: "/admin/content" },
    { icon: Trophy, label: "Quizzes", value: quizzes.length, color: "gradient-warning", subtext: "Created", to: "/admin/quizzes" },
    { icon: Video, label: "Lectures", value: lectures.length, color: "gradient-success", subtext: "Published", to: "/admin/content" },
    { icon: Megaphone, label: "Announcements", value: announcements.length, color: "gradient-primary", subtext: "Active", to: "/admin/announcements" },
    { icon: MessageCircle, label: "Pending Doubts", value: pendingDoubts, color: "gradient-warning", subtext: "Need reply", to: "/admin/doubts" },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Manage your courses and track student progress</p>
          </div>
          <div>
            <BarChart3 className="w-12 h-12 text-primary" />
          </div>
        </div>
      </div>

      {/* Profile Section - Visible to Teachers and Super Admin */}
      <Card className="p-6 bg-card border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-primary/30 shadow-lg shadow-primary/20 mx-auto sm:mx-0">
              <img
                src={myProfile?.avatar_url || "/shivam-sir.jpg"}
                alt={myProfile?.name || "Teacher"}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = "/shivam-sir.jpg"; }}
              />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {myProfile?.name || "Teacher"}
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary">Faculty</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">UPSC Expert & Course Instructor</p>
              </div>
              <button
                onClick={() => navigate("/admin/profile")}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Edit className="w-4 h-4 text-primary" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary icon-glow-purple" />
                <span className="truncate">{myProfile?.email || user?.email || "teacher@upscbynadia.com"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary icon-glow-purple" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary icon-glow-purple" />
                <span>New Delhi, India</span>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{studentProfiles.length}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{lectures.length}</p>
                <p className="text-xs text-muted-foreground">Lectures</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label} 
            className="p-5 bg-card border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(stat.to)}
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Student Activity Chart */}
        <Card className="p-6 bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Student Activity
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={studentActivityData}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
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
        <Card className="p-6 bg-card border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/admin/access")}
              className="p-4 bg-muted/50 rounded-xl border border-border hover:bg-muted transition-all duration-200 text-left"
            >
              <ShoppingCart className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">Course Access</p>
              <p className="text-xs text-muted-foreground mt-1">Manage enrollments</p>
            </button>
            <button
              onClick={() => navigate("/admin/live")}
              className="p-4 bg-muted/50 rounded-xl border border-border hover:bg-muted transition-all duration-200 text-left"
            >
              <Video className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">Live Classes</p>
              <p className="text-xs text-muted-foreground mt-1">Schedule sessions</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Students */}
      <Card className="p-6 bg-card border border-border shadow-sm">
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
          {studentProfiles.slice(0, 4).map((student) => (
            <div key={student.user_id || student.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {student.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground truncate">{student.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
          ))}
          {studentProfiles.length === 0 && (
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
