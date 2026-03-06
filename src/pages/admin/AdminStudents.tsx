import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { students, courses, lectures, quizzes } from "@/lib/mock-data";
import { Users, Mail, BookOpen, Video, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminStudents = () => {
  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Student Management</h2>
      <p className="text-muted-foreground text-sm">{students.length} enrolled students</p>

      <div className="space-y-3">
        {students.map((s, i) => (
          <Card key={s.id} className="p-4" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {s.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{s.name}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {s.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-primary/5">
                <BookOpen className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                <p className="text-sm font-bold">{Array.isArray(s.courses) ? s.courses.length : s.courses}</p>
                <p className="text-[9px] text-muted-foreground">Courses</p>
              </div>
              <div className="p-2 rounded-lg bg-info/5">
                <Video className="w-3.5 h-3.5 text-info mx-auto mb-0.5" />
                <p className="text-sm font-bold">{s.lecturesCompleted}</p>
                <p className="text-[9px] text-muted-foreground">Lectures</p>
              </div>
              <div className="p-2 rounded-lg bg-warning/5">
                <Trophy className="w-3.5 h-3.5 text-warning mx-auto mb-0.5" />
                <p className="text-sm font-bold">{s.quizzesAttempted}</p>
                <p className="text-[9px] text-muted-foreground">Quizzes</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Average Score</span>
                <span className="font-medium text-primary">{s.avgScore}%</span>
              </div>
              <Progress value={s.avgScore} className="h-1" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Last active: {s.lastActive}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStudents;
