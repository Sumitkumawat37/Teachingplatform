import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notes, courses } from "@/lib/mock-data";
import { FileText, Download } from "lucide-react";
import { useState } from "react";

const NotesPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const filteredNotes = selectedCourse === "all" ? notes : notes.filter((n) => n.courseId === selectedCourse);

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Study Material</h2>

      {/* Course Filter */}
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
            {c.thumbnail} {c.title.split(" ")[0]}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredNotes.map((note, i) => (
          <Card key={note.id} className="p-3 flex items-center gap-3" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{note.title}</h4>
              <p className="text-muted-foreground text-xs">{note.chapter} · {note.pages} pages</p>
            </div>
            <Button size="sm" variant="ghost" className="shrink-0">
              <Download className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
