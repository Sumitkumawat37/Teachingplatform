import { useNavigate } from "react-router-dom";
import { useCourses, useProfiles, useUserRoles, useLectures, useAllPurchases } from "@/lib/supabase-data";
import { useAuth } from "@/lib/auth-context";
import {
  Crown, Users, GraduationCap, BookOpen, Video, ShoppingCart,
  UserCog, Megaphone, MessageCircle, Trophy, Lock, BarChart3,
  TrendingUp, Activity, UserCheck, Star,
} from "lucide-react";

const SUPER_ADMIN_EMAILS = ["superadmin@demo.com"];

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profiles = [] } = useProfiles();
  const { data: userRoles = [] } = useUserRoles();
  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures();
  const { data: purchases = [] } = useAllPurchases();

  const totalTeachers = profiles.filter((p) =>
    userRoles.some((r) => r.user_id === p.user_id && r.role === "admin") &&
    !SUPER_ADMIN_EMAILS.includes((p.email ?? "").toLowerCase())
  ).length;
  
  // Debug logging
  console.log('SuperAdminDashboard - Profiles:', profiles);
  console.log('SuperAdminDashboard - User roles:', userRoles);
  console.log('SuperAdminDashboard - Total teachers:', totalTeachers);

  const totalStudents = profiles.filter((p) =>
    !userRoles.some((r) => r.user_id === p.user_id && r.role === "admin") &&
    !SUPER_ADMIN_EMAILS.includes((p.email ?? "").toLowerCase())
  ).length;

  const stats = [
    { label: "Total Users",  value: profiles.length,   icon: Users,       from: "from-amber-400",  to: "to-orange-500",   to_path: "/superadmin/users" },
    { label: "Teachers",     value: totalTeachers,      icon: UserCheck,   from: "from-violet-400", to: "to-purple-500",   to_path: "/superadmin/users" },
    { label: "Students",     value: totalStudents,      icon: GraduationCap, from: "from-sky-400",  to: "to-cyan-500",     to_path: "/admin/students" },
    { label: "Courses",      value: courses.length,     icon: BookOpen,    from: "from-emerald-400",to: "to-teal-500",     to_path: "/admin/content" },
    { label: "Lectures",     value: lectures.length,    icon: Video,       from: "from-pink-400",   to: "to-rose-500",     to_path: "/admin/content" },
    { label: "Purchases",    value: purchases.length,   icon: ShoppingCart,from: "from-indigo-400", to: "to-blue-500",     to_path: "/admin/access" },
  ];

  const quickActions = [
    { label: "User Management",  desc: "Add / promote / remove users",   icon: UserCog,       path: "/superadmin/users",        from: "from-amber-400",  to: "to-orange-500" },
    { label: "Content",          desc: "Courses, chapters & lectures",    icon: BookOpen,      path: "/admin/content",           from: "from-violet-400", to: "to-purple-500" },
    { label: "Students",         desc: "View all registered students",    icon: GraduationCap, path: "/admin/students",          from: "from-emerald-400",to: "to-teal-500" },
    { label: "Quizzes",          desc: "Create & manage quiz tests",      icon: Trophy,        path: "/admin/quizzes",           from: "from-yellow-400", to: "to-amber-500" },
    { label: "Announcements",    desc: "Post updates & notices",          icon: Megaphone,     path: "/admin/announcements",     from: "from-rose-400",   to: "to-pink-500" },
    { label: "Doubts",           desc: "Review & reply to queries",       icon: MessageCircle, path: "/admin/doubts",            from: "from-sky-400",   to: "to-cyan-500" },
    { label: "Live Classes",     desc: "Schedule & manage live sessions", icon: Activity,      path: "/admin/live",              from: "from-pink-400",   to: "to-rose-500" },
    { label: "Course Access",    desc: "Grant / revoke course access",    icon: Lock,          path: "/admin/access",            from: "from-indigo-400", to: "to-blue-500" },
  ];

  const recentUsers = [...profiles].slice(0, 6);

  const getRoleLabel = (userId: string, email: string) => {
    if (SUPER_ADMIN_EMAILS.includes((email ?? "").toLowerCase())) return { label: "Admin", cls: "bg-amber-500/15 text-amber-400" };
    if (userRoles.some((r) => r.user_id === userId && r.role === "admin")) return { label: "Teacher", cls: "bg-violet-500/15 text-violet-400" };
    return { label: "Student", cls: "bg-purple-500/15 text-purple-400" };
  };

  return (
    <div className="space-y-5 animate-slide-up">

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl p-5 shadow-xl neon-border"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #4c1d95 100%)" }}>
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-purple-400/15 rounded-full blur-2xl animate-blob" />
        <div className="absolute bottom-0 left-10 w-20 h-20 bg-pink-400/15 rounded-full blur-xl animate-blob-2" />
        <div className="absolute top-4 left-4 w-4 h-4 bg-purple-300/30 rounded-full animate-float" />
        <div className="absolute top-8 right-20 w-3 h-3 bg-pink-300/40 rounded-full animate-float-reverse" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Platform Admin</p>
              <h1 className="text-xl font-extrabold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                Welcome, {user?.name?.split(" ")[0] ?? "Admin"} 👑
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5">
              <Star className="w-3 h-3 text-yellow-200" />
              <span className="text-white text-[10px] font-bold">Full Platform Control</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5">
              <TrendingUp className="w-3 h-3 text-white" />
              <span className="text-white text-[10px] font-bold">{profiles.length} registered users</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5">
              <BarChart3 className="w-3 h-3 text-white" />
              <span className="text-white text-[10px] font-bold">{purchases.length} total purchases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map((s, index) => {
          const Icon = s.icon;
          return (
            <button
              key={`stat-${index}`}
              onClick={() => navigate(s.to_path)}
              className="glass-card rounded-2xl p-3 text-center neon-border hover:shadow-lg hover:shadow-purple-500/10 transition-all active:scale-95 group"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.from} ${s.to} flex items-center justify-center mx-auto mb-1.5 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className={`text-lg font-extrabold bg-gradient-to-br ${s.from} ${s.to} bg-clip-text text-transparent`}>{s.value}</p>
              <p className="text-[9px] text-gray-500 font-semibold">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-0.5">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a, index) => {
            const Icon = a.icon;
            return (
              <button
                key={`action-${index}`}
                onClick={() => navigate(a.path)}
                className="relative overflow-hidden rounded-2xl p-4 text-left bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg hover:shadow-purple-500/10 transition-all active:scale-95 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.from} ${a.to} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">{a.label}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">{a.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Users */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Users</p>
          <button
            onClick={() => navigate("/superadmin/users")}
            className="text-[10px] font-bold text-purple-400 hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="space-y-2">
          {recentUsers.map((p, i) => {
            const roleInfo = getRoleLabel(p.user_id, p.email ?? "");
            const initials = (p.name ?? p.email ?? "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div
                key={`recent-${p.id || i}`}
                className="glass-card rounded-2xl px-3.5 py-2.5 flex items-center gap-3 animate-slide-up neon-border"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-extrabold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{p.name}</p>
                  <p className="text-[9px] text-gray-500 truncate">{p.email}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${roleInfo.cls}`}>
                  {roleInfo.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
