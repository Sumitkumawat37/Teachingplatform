import { Card } from "@/components/ui/card";
import { useProfiles } from "@/lib/supabase-data";
import { Mail } from "lucide-react";

const AdminStudents = () => {
  const { data: profiles = [] } = useProfiles();

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Student Management</h2>
      <p className="text-muted-foreground text-sm">{profiles.length} registered users</p>
      <div className="space-y-3">
        {profiles.map((s, i) => (
          <Card key={s.id} className="p-4" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {s.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{s.name}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStudents;
