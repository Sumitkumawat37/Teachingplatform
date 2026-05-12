import { Bell, GraduationCap, LogOut } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">UPSC by Nadiya Ma'am</h1>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {role === "admin" ? "Teacher" : "Student"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBellClick}
            className="relative w-9 h-9 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
          >
            <Bell className="w-4 h-4 text-accent-foreground" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
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
