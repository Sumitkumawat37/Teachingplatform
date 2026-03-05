import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { courses, lectures, notes } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, FileText, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

const AdminContent = () => {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Content Management</h2>
      </div>

      <Tabs defaultValue="videos">
        <TabsList className="w-full">
          <TabsTrigger value="videos" className="flex-1">
            <Video className="w-4 h-4 mr-1" /> Videos
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex-1">
            <FileText className="w-4 h-4 mr-1" /> Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-3 mt-3">
          <Button className="w-full" onClick={() => toast.success("Upload video feature — demo only")}>
            <Upload className="w-4 h-4 mr-2" /> Upload Video Lecture
          </Button>
          {lectures.map((l) => (
            <Card key={l.id} className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Video className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{l.title}</p>
                <p className="text-xs text-muted-foreground">{l.chapter} · {l.duration}</p>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notes" className="space-y-3 mt-3">
          <Button className="w-full" onClick={() => toast.success("Upload notes feature — demo only")}>
            <Upload className="w-4 h-4 mr-2" /> Upload Study Material
          </Button>
          {notes.map((n) => (
            <Card key={n.id} className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.chapter} · {n.pages} pages</p>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
