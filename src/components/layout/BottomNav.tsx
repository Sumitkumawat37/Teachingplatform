import { Home, BookOpen, User, LayoutDashboard, Users, Video, UserCog, GraduationCap } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

const studentNav = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/mentoring", icon: GraduationCap, label: "Mentoring" },
  { to: "/profile", icon: User, label: "Profile" },
];

const adminNav = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/content", icon: BookOpen, label: "Content" },
  { to: "/admin/students", icon: Users, label: "Students" },
  { to: "/admin/live", icon: Video, label: "Live" },
];

const superAdminNav = [
  { to: "/superadmin",       icon: LayoutDashboard, label: "Dashboard" },
  { to: "/superadmin/users", icon: UserCog,         label: "Users" },
  { to: "/admin/content",    icon: BookOpen,        label: "Content" },
  { to: "/admin/students",   icon: Users,           label: "Students" },
  { to: "/admin/live",       icon: Video,           label: "Live" },
];

export function BottomNav() {
  const { role } = useAuth();
  const items = role === "super_admin" ? superAdminNav : (role === "admin" || role === "teacher") ? adminNav : studentNav;
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-3 mb-3">
        <div className="rounded-2xl px-2 py-1.5 border border-white/60 shadow-[0_-4px_24px_rgba(15,23,42,0.06)]" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="flex justify-around items-center">
            {items.map((item) => {
              const exactRoutes = ["/", "/admin", "/superadmin"];
              const isActive = location.pathname === item.to ||
                (!exactRoutes.includes(item.to) && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative min-w-[52px] ${
                    isActive ? "" : "active:scale-95"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-pink-500 shadow-sm shadow-violet-500/20"
                      : ""
                  }`}>
                    <item.icon className={`transition-all duration-200 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`} style={{ width: '18px', height: '18px' }} />
                  </div>
                  <span className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-slate-800" : "text-slate-400"
                  }`}>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
