import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { courses, lectures, notes } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, FileText, Plus, Upload, BookOpen, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminContent = () => {
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Content Management</h2>
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="w-full">
          <TabsTrigger value="courses" className="flex-1">
            <BookOpen className="w-4 h-4 mr-1" /> Courses
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex-1">
            <Video className="w-4 h-4 mr-1" /> Lectures
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex-1">
            <FileText className="w-4 h-4 mr-1" /> Notes
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-3 mt-3">
          <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Create New Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Course Title</Label>
                  <Input placeholder="e.g. Advanced Mathematics" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea placeholder="Course description..." rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Price (₹)</Label>
                    <Input type="number" placeholder="999" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <Input placeholder="e.g. Mathematics" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Instructor Name</Label>
                  <Input placeholder="e.g. Rajesh Kumar" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Thumbnail Image URL</Label>
                  <Input placeholder="https://..." />
                </div>
                <Button className="w-full" onClick={() => { toast.success("Course created — demo only"); setShowCourseForm(false); }}>
                  Create Course
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {courses.map((c) => (
            <Card key={c.id} className="p-3 flex items-center gap-3">
              <img src={c.thumbnailUrl} alt={c.title} className="w-14 h-10 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.chapters} chapters · {c.lectures} lectures · ₹{c.price}</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
            </Card>
          ))}
        </TabsContent>

        {/* Lectures Tab */}
        <TabsContent value="videos" className="space-y-3 mt-3">
          <Dialog open={showLectureForm} onOpenChange={setShowLectureForm}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Upload className="w-4 h-4 mr-2" /> Add Video Lecture
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Video Lecture</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Select Course</Label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Chapter Name</Label>
                  <Input placeholder="e.g. Algebra" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Lecture Title</Label>
                  <Input placeholder="e.g. Linear Equations" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">YouTube Video Link</Label>
                  <Input placeholder="https://youtube.com/watch?v=..." />
                  <p className="text-[10px] text-muted-foreground">Paste full YouTube URL. It will be auto-embedded.</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration</Label>
                  <Input placeholder="e.g. 25:00" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="freePreview" className="rounded" />
                  <Label htmlFor="freePreview" className="text-xs">Mark as Free Preview</Label>
                </div>
                <Button className="w-full" onClick={() => { toast.success("Lecture added — demo only"); setShowLectureForm(false); }}>
                  Add Lecture
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {lectures.map((l) => {
            const course = courses.find((c) => c.id === l.courseId);
            return (
              <Card key={l.id} className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{course?.title} · {l.chapter} · {l.duration}</p>
                </div>
                {l.freePreview && (
                  <Badge className="bg-success/10 text-success border-0 text-[10px]">
                    <Eye className="w-2.5 h-2.5 mr-0.5" /> Free
                  </Badge>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-3 mt-3">
          <Dialog open={showNoteForm} onOpenChange={setShowNoteForm}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Upload className="w-4 h-4 mr-2" /> Upload Study Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Notes / PDF</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Select Course</Label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Chapter</Label>
                  <Input placeholder="e.g. Algebra" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Note Title</Label>
                  <Input placeholder="e.g. Formula Sheet" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea placeholder="Brief description..." rows={2} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Upload PDF</Label>
                  <Input type="file" accept=".pdf" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Number of Pages</Label>
                  <Input type="number" placeholder="e.g. 12" />
                </div>
                <Button className="w-full" onClick={() => { toast.success("Notes uploaded — demo only"); setShowNoteForm(false); }}>
                  Upload Notes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {notes.map((n) => {
            const course = courses.find((c) => c.id === n.courseId);
            return (
              <Card key={n.id} className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{course?.title} · {n.chapter} · {n.pages} pages</p>
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
