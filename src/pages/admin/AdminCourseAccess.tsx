import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courses, students } from "@/lib/mock-data";
import { Lock, Unlock, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminCourseAccess = () => {
  const [selectedCourse, setSelectedCourse] = useState(courses[0].id);
  const course = courses.find((c) => c.id === selectedCourse);

  const handleToggleAccess = (studentName: string, hasAccess: boolean) => {
    toast.success(`${hasAccess ? "Revoked" : "Granted"} access for ${studentName} — demo only`);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Course Access</h2>
      <p className="text-muted-foreground text-sm">Manually grant or revoke student access to courses</p>

      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {courses.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.thumbnail} {c.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {course && (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">{course.thumbnail}</div>
            <div>
              <h3 className="font-bold text-sm">{course.title}</h3>
              <p className="text-xs text-muted-foreground">{course.chapters} chapters · {course.lectures} lectures</p>
            </div>
          </div>

          <div className="space-y-2">
            {students.map((s) => {
              const hasAccess = Array.isArray(s.courses) && s.courses.includes(selectedCourse);
              return (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {s.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={hasAccess ? "destructive" : "default"}
                    className="shrink-0 text-xs"
                    onClick={() => handleToggleAccess(s.name, hasAccess)}
                  >
                    {hasAccess ? (
                      <><Lock className="w-3 h-3 mr-1" /> Revoke</>
                    ) : (
                      <><Unlock className="w-3 h-3 mr-1" /> Grant</>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminCourseAccess;
