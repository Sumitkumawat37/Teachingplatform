import { Home, BookOpen, FileText, Trophy, User, LayoutDashboard, Users, Megaphone, Video, MessageCircle, Lock, Calendar, BarChart3 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

const studentNav = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/live-classes", icon: Video, label: "Live" },
  { to: "/quizzes", icon: Trophy, label: "Quizzes" },
  { to: "/profile", icon: User, label: "Profile" },
];

const adminNav = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/content", icon: BookOpen, label: "Content" },
  { to: "/admin/quizzes", icon: Trophy, label: "Quizzes" },
  { to: "/admin/students", icon: Users, label: "Students" },
  { to: "/admin/live", icon: Video, label: "Live" },
];

export function BottomNav() {
  const { role } = useAuth();
  const items = role === "admin" ? adminNav : studentNav;
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40 shadow-lg">
      <div className="max-w-5xl mx-auto px-2 py-2">
        <div className="flex justify-around items-center">
          {items.map((item) => {
            const isActive = location.pathname === item.to ||
              (item.to !== "/" && item.to !== "/admin" && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 rounded-full bg-primary"></div>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
