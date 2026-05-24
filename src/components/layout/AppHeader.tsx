import { Bell, LogOut, User, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { useAnnouncements } from "@/lib/supabase-data";
import { useEffect, useMemo, useState, useCallback } from "react";
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

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

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
    window.addEventListener("popstate", onRouteChange, { passive: true });
    return () => window.removeEventListener("popstate", onRouteChange);
  }, []);

  const unread = useMemo(
    () => announcements.filter((a: any) => new Date(a.created_at).getTime() > lastSeen).length,
    [announcements, lastSeen]
  );

  const handleBellClick = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(LAST_SEEN_KEY, String(now));
    setLastSeen(now);
  }, []);

  const handleProfileClick = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.03]" style={{ background: 'rgba(247,246,250,0.78)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="px-4 md:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo — mobile only (desktop uses sidebar) */}
          <div className="flex items-center gap-2.5 md:hidden">
            <div>
              <h1 className="text-sm font-semibold text-slate-800 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                UPSC Nadiya
              </h1>
              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                role === "super_admin"
                  ? "bg-amber-50 text-amber-600"
                  : role === "admin"
                  ? "bg-violet-50 text-violet-600"
                  : "bg-pink-50 text-pink-600"
              }`}>
                {role === "super_admin" ? "Super Admin" : role === "admin" ? "Teacher" : "Student"}
              </div>
            </div>
          </div>

          {/* Desktop: search bar + greeting */}
          <div className="hidden md:flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, lectures, notes..."
                className="w-full pl-10 pr-4 py-2 bg-white/70 border border-slate-200/60 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white focus:border-violet-300/60 transition-all"
              />
            </div>
            <p className="text-sm text-slate-500 whitespace-nowrap">
              Welcome back, <span className="font-semibold text-slate-700">{user?.name?.split(' ')[0] ?? 'there'}</span>
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              onClick={handleBellClick}
              className="relative w-9 h-9 rounded-xl bg-white/70 hover:bg-white border border-slate-200/60 transition-all duration-200 flex items-center justify-center shadow-sm"
            >
              <Bell className="w-[18px] h-[18px] text-slate-400" />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-sm shadow-pink-400/25">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {/* Profile — mobile only (sidebar handles it on desktop) */}
            <button
              onClick={handleProfileClick}
              className="md:hidden w-9 h-9 rounded-xl bg-white/70 hover:bg-white border border-slate-200/60 transition-all duration-200 flex items-center justify-center shadow-sm"
            >
              <User className="w-[18px] h-[18px] text-slate-500" />
            </button>

            {/* Logout — mobile only */}
            <button
              onClick={handleLogout}
              className="md:hidden w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200/80 transition-all duration-200 flex items-center justify-center"
            >
              <LogOut className="w-[18px] h-[18px] text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
