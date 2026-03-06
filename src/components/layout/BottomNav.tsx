import { Home, BookOpen, FileText, Trophy, User, LayoutDashboard, Users, Megaphone, Video, MessageCircle, Lock } from "lucide-react";
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t safe-bottom">
      <div className="max-w-5xl mx-auto flex justify-around py-1.5 px-2">
        {items.map((item) => {
          const isActive = location.pathname === item.to ||
            (item.to !== "/" && item.to !== "/admin" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
