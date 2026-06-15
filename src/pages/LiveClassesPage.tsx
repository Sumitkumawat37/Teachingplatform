import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLiveClasses, useCourses } from "@/lib/supabase-data";
import { Video, Calendar, Clock, ExternalLink, CheckCircle, X } from "lucide-react";
import { useState } from "react";
import { LiveMeetingFrame } from "@/components/LiveMeetingFrame";
import { LiveChat } from "@/components/LiveChat";
import { useMarkAttendance } from "@/lib/supabase-mutations";
import { useAuth } from "@/lib/auth-context";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const LiveClassesPage = () => {
  const { data: liveClasses = [] } = useLiveClasses();
  const { data: courses = [] } = useCourses();
  const [activeClass, setActiveClass] = useState<any | null>(null);
  const markAttendance = useMarkAttendance();
  const { user } = useAuth();

  const handleJoin = (cls: any) => {
    setActiveClass(cls);
    if (user) {
      markAttendance.mutate({ live_class_id: cls.id, student_name: user.name || user.email });
    }
  };

  const buildLink = (raw: string) => {
    if (!raw) return "";
    return raw.startsWith("http") ? raw : `https://${raw}`;
  };

  const now = new Date();
  const upcoming = liveClasses.filter((c) => {
    if (c.status !== "upcoming") return false;
    const scheduledAt = new Date(c.scheduled_at);
    const durationMatch = c.duration?.match(/(\d+)/);
    const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 60;
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);
    return now <= endTime;
  });
  const completed = liveClasses.filter((c) => {
    if (c.status === "completed") return true;
    if (c.status !== "upcoming") return false;
    const scheduledAt = new Date(c.scheduled_at);
    const durationMatch = c.duration?.match(/(\d+)/);
    const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 60;
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);
    return now > endTime;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const scrollRef = useScrollReveal();

  return (
    <div className="space-y-5 animate-slide-up" ref={scrollRef}>
      <h2 className="text-xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Live Classes</h2>

      {upcoming.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2 text-violet-600 uppercase tracking-wide">Upcoming</h3>
          <div className="space-y-3">
            {upcoming.map((cls) => (
              <Card key={cls.id} className="p-4 border border-slate-100/60 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-250" style={{ background: '#F3EEFF' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0 shadow-sm">
                    <Video className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-800">{cls.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(cls as any).courses?.title} · {(cls as any).chapters?.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(cls.scheduled_at)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(cls.scheduled_at)}</span>
                    </div>
                    <Button size="sm" className="mt-3 w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white border-0 shadow-sm hover:shadow-md" onClick={() => handleJoin(cls)}>
                      <ExternalLink className="w-3 h-3 mr-1" /> Join Live Class
                    </Button>
                  </div>
                  <Badge className="bg-violet-50 text-violet-600 border border-violet-100 shrink-0">Live</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2 text-slate-500 uppercase tracking-wide">Past Classes</h3>
          <div className="space-y-2">
            {completed.map((cls) => (
              <Card key={cls.id} className="p-3 flex items-center gap-3 bg-white border border-slate-100/60 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-slate-700 truncate">{cls.title}</h4>
                  <p className="text-xs text-slate-400">{formatDate(cls.scheduled_at)}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100">Done</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!activeClass} onOpenChange={(o) => !o && setActiveClass(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
            <DialogTitle className="text-sm truncate">{activeClass?.title}</DialogTitle>
            <Button size="sm" variant="ghost" onClick={() => setActiveClass(null)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>
          {activeClass && (
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_320px]">
              <div className="min-h-[40vh] md:min-h-0">
                <LiveMeetingFrame url={buildLink(activeClass.meeting_link)} title={activeClass.title} />
              </div>
              <div className="border-t md:border-t-0 md:border-l min-h-0 h-[40vh] md:h-auto">
                <LiveChat liveClassId={activeClass.id} isTeacher={false} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveClassesPage;
