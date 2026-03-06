import { Bell, GraduationCap, LogOut, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { announcements } from "@/lib/mock-data";

export function AppHeader() {
  const { user, role, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">EduMaster</h1>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {role === "admin" ? "Teacher" : "Student"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => switchRole(role === "admin" ? "student" : "admin")}
            className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
            title={`Switch to ${role === "admin" ? "Student" : "Teacher"} view`}
          >
            <ArrowLeftRight className="w-4 h-4 text-accent-foreground" />
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="relative w-9 h-9 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
          >
            <Bell className="w-4 h-4 text-accent-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
              {announcements.length}
            </span>
          </button>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
          >
            <LogOut className="w-4 h-4 text-accent-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
