import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLiveClasses, useCourses, useChapters, useAttendance } from "@/lib/supabase-data";
import { useCreateLiveClass, useDeleteLiveClass } from "@/lib/supabase-mutations";
import { Video, Calendar, Clock, Eye, Trash2, ExternalLink, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LiveMeetingFrame } from "@/components/LiveMeetingFrame";
import { LiveDiagnostic } from "@/components/LiveDiagnostic";

const AdminLiveClasses = () => {
  const [title, setTitle] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState("60 min");
  const [viewAttendanceId, setViewAttendanceId] = useState<string | null>(null);
  const [activeClass, setActiveClass] = useState<any | null>(null);
  const [diagUrl, setDiagUrl] = useState<string | null>(null);
  const buildLink = (raw: string) => !raw ? "" : raw.startsWith("http") ? raw : `https://${raw}`;

  const { data: liveClasses = [] } = useLiveClasses();
  const { data: courses = [] } = useCourses();
  const { data: chapters = [] } = useChapters();
  const { data: classAttendance = [] } = useAttendance(viewAttendanceId || undefined);

  const createLiveClass = useCreateLiveClass();
  const deleteLiveClass = useDeleteLiveClass();

  const filteredChapters = chapters.filter((c) => c.course_id === selectedCourse);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const handleSchedule = () => {
    if (!title || !selectedCourse || !selectedChapter || !scheduledDate || !meetingLink) return toast.error("Fill all fields");
    createLiveClass.mutate({
      course_id: selectedCourse, chapter_id: selectedChapter, title,
      scheduled_at: new Date(scheduledDate).toISOString(), meeting_link: meetingLink, duration,
    }, {
      onSuccess: () => { toast.success("Live class scheduled!"); setTitle(""); setMeetingLink(""); setScheduledDate(""); },
    });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Live Classes</h2>
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Schedule New Class</h3>
        <Input placeholder="Class title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setSelectedChapter(""); }}>
          <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
          <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.thumbnail_emoji} {c.title}</SelectItem>)}</SelectContent>
        </Select>
        {selectedCourse && (
          <Select value={selectedChapter} onValueChange={setSelectedChapter}>
            <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
            <SelectContent>{filteredChapters.map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Date & Time *</Label>
            <Input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Duration</Label>
            <Input placeholder="60 min" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>
        <Input placeholder="Meeting link (Jitsi, Google Meet, Zoom, YouTube Live…)" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
        <p className="text-[11px] text-muted-foreground -mt-1">
          Tip: Jitsi & YouTube Live play in-app. Google Meet / Zoom open in a new tab automatically.
        </p>
        <Button className="w-full" onClick={handleSchedule} disabled={createLiveClass.isPending}>
          <Calendar className="w-4 h-4 mr-2" /> {createLiveClass.isPending ? "Scheduling..." : "Schedule Live Class"}
        </Button>
      </Card>
      <div className="space-y-3">
        {liveClasses.map((cls) => (
          <Card key={cls.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cls.status === "completed" ? "bg-success/10" : "bg-primary/10"}`}>
                <Video className={`w-5 h-5 ${cls.status === "completed" ? "text-success" : "text-primary"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm truncate">{cls.title}</h4>
                  <Badge variant={cls.status === "completed" ? "secondary" : "default"} className="text-[10px]">{cls.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{(cls as any).courses?.title} · {cls.duration}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {formatDate(cls.scheduled_at)}</p>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => deleteLiveClass.mutate(cls.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {cls.status !== "completed" && (
                <Button size="sm" className="flex-1" onClick={() => setActiveClass(cls)}>
                  <ExternalLink className="w-3 h-3 mr-1" /> Join
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setDiagUrl(buildLink(cls.meeting_link))}>
                <ShieldCheck className="w-3 h-3 mr-1" /> Test
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setViewAttendanceId(cls.id)}>
                    <Eye className="w-3 h-3 mr-1" /> Attendance
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Attendance — {cls.title}</DialogTitle></DialogHeader>
                  {classAttendance.length > 0 ? (
                    <div className="space-y-2">
                      {classAttendance.map((a) => (
                        <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent/50">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {a.student_name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <div><p className="text-sm font-medium">{a.student_name}</p><p className="text-[10px] text-muted-foreground">Joined: {new Date(a.joined_at).toLocaleTimeString()}</p></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No attendance recorded yet</p>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!activeClass} onOpenChange={(o) => !o && setActiveClass(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-sm truncate">{activeClass?.title}</DialogTitle>
            <Button size="sm" variant="ghost" onClick={() => setActiveClass(null)}><X className="w-4 h-4" /></Button>
          </DialogHeader>
          {activeClass && (
            <LiveMeetingFrame url={buildLink(activeClass.meeting_link)} title={activeClass.title} />
          )}
        </DialogContent>
      </Dialog>
      <LiveDiagnostic open={!!diagUrl} url={diagUrl || ""} onClose={() => setDiagUrl(null)} />
    </div>
  );
};

export default AdminLiveClasses;
