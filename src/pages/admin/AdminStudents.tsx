import { Card } from "@/components/ui/card";
import { students } from "@/lib/mock-data";
import { Users, Mail } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const AdminStudents = () => {
  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Student Management</h2>
      <p className="text-muted-foreground text-sm">{students.length} enrolled students</p>

      <div className="space-y-2">
        {students.map((s, i) => (
          <Card key={s.id} className="p-4" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {s.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{s.name}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {s.email}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{s.courses} courses</span>
                  <span>·</span>
                  <span>Avg: {s.avgScore}%</span>
                  <span>·</span>
                  <span>{s.lastActive}</span>
                </div>
                <Progress value={s.avgScore} className="h-1 mt-2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStudents;
