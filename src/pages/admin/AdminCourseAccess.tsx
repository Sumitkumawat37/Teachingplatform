import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCourses, useProfiles, useAllPurchases } from "@/lib/supabase-data";
import { Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const AdminCourseAccess = () => {
  const { data: courses = [] } = useCourses();
  const { data: profiles = [] } = useProfiles();
  const { data: purchases = [] } = useAllPurchases();
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || "");
  const qc = useQueryClient();

  const course = courses.find((c) => c.id === selectedCourse);

  const handleToggleAccess = async (userId: string, studentName: string, hasAccess: boolean) => {
    if (hasAccess) {
      await supabase.from("purchases").delete().eq("user_id", userId).eq("course_id", selectedCourse);
      toast.success(`Revoked access for ${studentName}`);
    } else {
      await supabase.from("purchases").insert({ user_id: userId, course_id: selectedCourse });
      toast.success(`Granted access for ${studentName}`);
    }
    qc.invalidateQueries({ queryKey: ["all_purchases"] });
    qc.invalidateQueries({ queryKey: ["my_purchases"] });
  };

  if (courses.length > 0 && !selectedCourse) setSelectedCourse(courses[0].id);

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold text-slate-800">Course Access</h2>
      <p className="text-muted-foreground text-sm">Manually grant or revoke student access to courses</p>
      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.thumbnail_emoji} {c.title}</SelectItem>)}</SelectContent>
      </Select>
      {course && (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">{course.thumbnail_emoji}</div>
            <div><h3 className="font-bold text-sm">{course.title}</h3><p className="text-xs text-muted-foreground">₹{course.price}</p></div>
          </div>
          <div className="space-y-2">
            {profiles.map((s) => {
              const hasAccess = purchases.some((p) => p.user_id === s.user_id && p.course_id === selectedCourse);
              return (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {s.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.email}</p>
                  </div>
                  <Button size="sm" variant={hasAccess ? "destructive" : "default"} className="shrink-0 text-xs"
                    onClick={() => handleToggleAccess(s.user_id, s.name, hasAccess)}>
                    {hasAccess ? <><Lock className="w-3 h-3 mr-1" /> Revoke</> : <><Unlock className="w-3 h-3 mr-1" /> Grant</>}
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
