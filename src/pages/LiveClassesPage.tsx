import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLiveClasses, useCourses } from "@/lib/supabase-data";
import { Video, Calendar, Clock, ExternalLink, CheckCircle, X } from "lucide-react";
import { useState } from "react";

const LiveClassesPage = () => {
  const { data: liveClasses = [] } = useLiveClasses();
  const { data: courses = [] } = useCourses();

  const upcoming = liveClasses.filter((c) => c.status === "upcoming");
  const completed = liveClasses.filter((c) => c.status === "completed");

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <h2 className="text-xl font-bold">Live Classes</h2>

      {upcoming.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Upcoming</h3>
          <div className="space-y-3">
            {upcoming.map((cls) => (
              <Card key={cls.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{cls.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(cls as any).courses?.title} · {(cls as any).chapters?.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(cls.scheduled_at)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(cls.scheduled_at)}</span>
                    </div>
                    <Button size="sm" className="mt-3 w-full" onClick={() => {
                      const link = cls.meeting_link?.startsWith("http") ? cls.meeting_link : `https://${cls.meeting_link}`;
                      window.open(link, "_blank", "noopener,noreferrer");
                    }}>
                      <ExternalLink className="w-3 h-3 mr-1" /> Join Live Class
                    </Button>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0 shrink-0">Live</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Past Classes</h3>
          <div className="space-y-2">
            {completed.map((cls) => (
              <Card key={cls.id} className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{cls.title}</h4>
                  <p className="text-xs text-muted-foreground">{formatDate(cls.scheduled_at)}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">Done</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClassesPage;
