import { Bell, GraduationCap, LogOut, Search, Settings, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAnnouncements } from "@/lib/supabase-data";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const LAST_SEEN_KEY = "edumaster.notifications.lastSeen";

export function AppHeader() {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();
  const { data: announcements = [] } = useAnnouncements();
  const qc = useQueryClient();
  const [lastSeen, setLastSeen] = useState<number>(() => {
    const v = localStorage.getItem(LAST_SEEN_KEY);
    return v ? parseInt(v, 10) : 0;
  });

  // Realtime: refetch announcements + toast on new one
  useEffect(() => {
    const channel = supabase
      .channel("announcements-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "announcements" },
        (payload: any) => {
          qc.invalidateQueries({ queryKey: ["announcements"] });
          if (role !== "admin") {
            toast.message(payload.new?.title || "New announcement", {
              description: payload.new?.message,
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, role]);

  // Realtime: notify teacher of new student questions (doubts + live chat)
  useEffect(() => {
    if (role !== "admin") return;
    const channel = supabase
      .channel("teacher-questions-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "doubts" },
        (payload: any) => {
          qc.invalidateQueries({ queryKey: ["doubts"] });
          toast.message(`New doubt from ${payload.new?.student_name || "a student"}`, {
            description: payload.new?.question,
            action: { label: "View", onClick: () => navigate("/admin/doubts") },
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat" },
        (payload: any) => {
          if (payload.new?.is_teacher) return;
          toast.message(`Live question from ${payload.new?.sender_name || "a student"}`, {
            description: payload.new?.message,
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, qc, navigate]);

  // Realtime: notify student when their doubt receives a teacher reply
  useEffect(() => {
    if (role === "admin" || !user?.id) return;
    const channel = supabase
      .channel(`doubt-replies-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "doubts", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          const before = payload.old?.reply;
          const after = payload.new?.reply;
          if (after && after !== before) {
            qc.invalidateQueries({ queryKey: ["doubts"] });
            toast.success("Teacher replied to your doubt", {
              description: after,
              action: { label: "View", onClick: () => navigate("/doubts") },
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, user?.id, qc, navigate]);

  // Reset unread count when on the notifications page
  useEffect(() => {
    const onRouteChange = () => {
      if (window.location.pathname === "/notifications") {
        const now = Date.now();
        localStorage.setItem(LAST_SEEN_KEY, String(now));
        setLastSeen(now);
      }
    };
    onRouteChange();
    window.addEventListener("popstate", onRouteChange);
    return () => window.removeEventListener("popstate", onRouteChange);
  }, []);

  const unread = useMemo(
    () => announcements.filter((a: any) => new Date(a.created_at).getTime() > lastSeen).length,
    [announcements, lastSeen]
  );

  const handleBellClick = () => {
    const now = Date.now();
    localStorage.setItem(LAST_SEEN_KEY, String(now));
    setLastSeen(now);
    navigate("/notifications");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">UPSC by Nadiya Ma'am</h1>
              <Badge variant="secondary" className="text-[10px] px-2 py-0 h-4 font-medium">
                {role === "admin" ? "Teacher" : "Student"}
              </Badge>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Bar (desktop only) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl border border-border/40">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm placeholder-muted-foreground w-32 lg:w-48"
              />
            </div>

            {/* Notifications */}
            <button
              onClick={handleBellClick}
              className="relative w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 flex items-center justify-center border border-border/40"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold shadow-sm">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {/* Profile/Settings */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("/profile")}
                className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 flex items-center justify-center border border-border/40"
              >
                <User className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="w-10 h-10 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-all duration-200 flex items-center justify-center border border-destructive/20"
              >
                <LogOut className="w-5 h-5 text-destructive" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
