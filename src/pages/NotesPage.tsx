import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotes, useCourses } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { FileText, Download, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NotesPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const { hasPurchased } = usePurchase();
  const { data: notes = [] } = useNotes(selectedCourse);
  const { data: courses = [] } = useCourses();

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Study Material</h2>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <Button
          size="sm"
          variant={selectedCourse === "all" ? "default" : "secondary"}
          className="shrink-0 rounded-full text-xs"
          onClick={() => setSelectedCourse("all")}
        >
          All
        </Button>
        {courses.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={selectedCourse === c.id ? "default" : "secondary"}
            className="shrink-0 rounded-full text-xs"
            onClick={() => setSelectedCourse(c.id)}
          >
            {c.thumbnail_emoji} {c.title.split(" ")[0]}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {notes.map((note, i) => {
          const purchased = hasPurchased(note.course_id);
          return (
            <Card key={note.id} className={`p-3 flex items-center gap-3 ${!purchased ? "opacity-70" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                {purchased ? (
                  <FileText className="w-5 h-5 text-destructive" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{note.title}</h4>
                <p className="text-muted-foreground text-xs">{(note as any).chapters?.title} · {note.pages} pages</p>
                {!purchased && (
                  <p className="text-[10px] text-destructive mt-0.5">Purchase course to access</p>
                )}
              </div>
              {purchased ? (
                <Button size="sm" variant="ghost" className="shrink-0" onClick={() => toast.success("Download started — demo only")}>
                  <Download className="w-4 h-4" />
                </Button>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  <Lock className="w-2.5 h-2.5 mr-0.5" /> Locked
                </Badge>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NotesPage;
