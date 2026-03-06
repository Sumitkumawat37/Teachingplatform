import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { liveClasses, attendance, courses } from "@/lib/mock-data";
import { Video, Plus, Calendar, Users, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminLiveClasses = () => {
  const [title, setTitle] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [viewAttendanceId, setViewAttendanceId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!title || !meetingLink || !selectedCourse) return toast.error("Please fill all fields");
    toast.success("Live class scheduled — demo only");
    setTitle("");
    setMeetingLink("");
    setSelectedCourse("");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const classAttendance = viewAttendanceId ? attendance.filter((a) => a.liveClassId === viewAttendanceId) : [];

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Live Classes</h2>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Schedule New Class
        </h3>
        <Input placeholder="Class title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.thumbnail} {c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Meeting link (Zoom/Google Meet)" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
        <Button className="w-full" onClick={handleCreate}>
          <Calendar className="w-4 h-4 mr-2" /> Schedule Live Class
        </Button>
      </Card>

      <div className="space-y-3">
        {liveClasses.map((cls) => {
          const course = courses.find((c) => c.id === cls.courseId);
          return (
            <Card key={cls.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cls.status === "completed" ? "bg-success/10" : "bg-primary/10"}`}>
                  <Video className={`w-5 h-5 ${cls.status === "completed" ? "text-success" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm truncate">{cls.title}</h4>
                    <Badge variant={cls.status === "completed" ? "secondary" : "default"} className="text-[10px]">
                      {cls.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{course?.title} · {cls.duration}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {formatDate(cls.scheduledAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => setViewAttendanceId(cls.id)}>
                      <Eye className="w-3 h-3 mr-1" /> Attendance ({cls.attendees.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Attendance — {cls.title}</DialogTitle>
                    </DialogHeader>
                    {classAttendance.length > 0 ? (
                      <div className="space-y-2">
                        {classAttendance.map((a) => (
                          <div key={a.studentId} className="flex items-center gap-3 p-2 rounded-lg bg-accent/50">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {a.studentName.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{a.studentName}</p>
                              <p className="text-[10px] text-muted-foreground">Joined: {new Date(a.joinedAt).toLocaleTimeString()}</p>
                            </div>
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
          );
        })}
      </div>
    </div>
  );
};

export default AdminLiveClasses;
