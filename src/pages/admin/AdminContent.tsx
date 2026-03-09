import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCourses, useLectures, useNotes, useChapters } from "@/lib/supabase-data";
import { useCreateCourse, useDeleteCourse, useCreateChapter, useDeleteChapter, useCreateLecture, useDeleteLecture, useCreateNote, useDeleteNote } from "@/lib/supabase-mutations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, FileText, Plus, Upload, BookOpen, Eye, Trash2, FolderPlus, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const AdminContent = () => {
  // Course form
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseInstructor, setCourseInstructor] = useState("");
  const [courseEmoji, setCourseEmoji] = useState("📚");
  const [courseThumbnailUrl, setCourseThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chapter form
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterCourseId, setChapterCourseId] = useState("");

  // Lecture form
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [lecTitle, setLecTitle] = useState("");
  const [lecYoutubeUrl, setLecYoutubeUrl] = useState("");
  const [lecDuration, setLecDuration] = useState("10:00");
  const [lecCourseId, setLecCourseId] = useState("");
  const [lecChapterId, setLecChapterId] = useState("");
  const [lecFreePreview, setLecFreePreview] = useState(false);

  // Note form
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [notePages, setNotePages] = useState("");
  const [noteFileUrl, setNoteFileUrl] = useState("");
  const [noteCourseId, setNoteCourseId] = useState("");
  const [noteChapterId, setNoteChapterId] = useState("");

  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures();
  const { data: notes = [] } = useNotes();
  const { data: chapters = [] } = useChapters();

  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const createChapter = useCreateChapter();
  const deleteChapter = useDeleteChapter();
  const createLecture = useCreateLecture();
  const deleteLecture = useDeleteLecture();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const filteredChaptersForLecture = chapters.filter((c) => c.course_id === lecCourseId);
  const filteredChaptersForNote = chapters.filter((c) => c.course_id === noteCourseId);

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setCourseThumbnailUrl("");
  };

  const uploadThumbnail = async (): Promise<string | undefined> => {
    if (!thumbnailFile) return courseThumbnailUrl || undefined;
    setUploading(true);
    const ext = thumbnailFile.name.split(".").pop();
    const path = `courses/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("thumbnails").upload(path, thumbnailFile);
    setUploading(false);
    if (error) { toast.error("Upload failed: " + error.message); return undefined; }
    const { data: urlData } = supabase.storage.from("thumbnails").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleCreateCourse = async () => {
    if (!courseTitle) return toast.error("Course title is required");
    const thumbUrl = await uploadThumbnail();
    createCourse.mutate({
      title: courseTitle, description: courseDesc, price: parseInt(coursePrice) || 0,
      category: courseCategory, instructor: courseInstructor || "Rajesh Kumar",
      thumbnail_emoji: courseEmoji, thumbnail_url: thumbUrl,
    }, {
      onSuccess: () => {
        toast.success("Course created!");
        setShowCourseForm(false);
        setCourseTitle(""); setCourseDesc(""); setCoursePrice(""); setCourseCategory(""); setCourseInstructor(""); setCourseThumbnailUrl("");
        setThumbnailFile(null); setThumbnailPreview("");
      },
    });
  };

  const handleCreateChapter = () => {
    if (!chapterTitle || !chapterCourseId) return toast.error("Fill all fields");
    const sortOrder = chapters.filter((c) => c.course_id === chapterCourseId).length;
    createChapter.mutate({ course_id: chapterCourseId, title: chapterTitle, sort_order: sortOrder }, {
      onSuccess: () => { toast.success("Chapter created!"); setShowChapterForm(false); setChapterTitle(""); },
    });
  };

  const handleCreateLecture = () => {
    if (!lecTitle || !lecYoutubeUrl || !lecCourseId || !lecChapterId) return toast.error("Fill all fields");
    const sortOrder = lectures.filter((l) => l.chapter_id === lecChapterId).length;
    createLecture.mutate({
      course_id: lecCourseId, chapter_id: lecChapterId, title: lecTitle,
      youtube_id: lecYoutubeUrl, duration: lecDuration, free_preview: lecFreePreview, sort_order: sortOrder,
    }, {
      onSuccess: () => {
        toast.success("Lecture added!");
        setShowLectureForm(false);
        setLecTitle(""); setLecYoutubeUrl(""); setLecFreePreview(false);
      },
    });
  };

  const handleCreateNote = () => {
    if (!noteTitle || !noteCourseId || !noteChapterId) return toast.error("Fill all fields");
    createNote.mutate({
      course_id: noteCourseId, chapter_id: noteChapterId, title: noteTitle,
      description: noteDesc, file_url: noteFileUrl || undefined, pages: parseInt(notePages) || 0,
    }, {
      onSuccess: () => {
        toast.success("Note uploaded!");
        setShowNoteForm(false);
        setNoteTitle(""); setNoteDesc(""); setNotePages(""); setNoteFileUrl("");
      },
    });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Content Management</h2>
      </div>
      <Tabs defaultValue="courses">
        <TabsList className="w-full">
          <TabsTrigger value="courses" className="flex-1"><BookOpen className="w-4 h-4 mr-1" /> Courses</TabsTrigger>
          <TabsTrigger value="videos" className="flex-1"><Video className="w-4 h-4 mr-1" /> Lectures</TabsTrigger>
          <TabsTrigger value="notes" className="flex-1"><FileText className="w-4 h-4 mr-1" /> Notes</TabsTrigger>
        </TabsList>

        {/* COURSES TAB */}
        <TabsContent value="courses" className="space-y-3 mt-3">
          <div className="flex gap-2">
            <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
              <DialogTrigger asChild><Button className="flex-1"><Plus className="w-4 h-4 mr-2" /> New Course</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Course</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1"><Label className="text-xs">Course Title *</Label><Input placeholder="e.g. Advanced Mathematics" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea placeholder="Course description..." rows={2} value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Price (₹)</Label><Input type="number" placeholder="999" value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-xs">Category</Label><Input placeholder="e.g. Mathematics" value={courseCategory} onChange={(e) => setCourseCategory(e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Instructor</Label><Input placeholder="Rajesh Kumar" value={courseInstructor} onChange={(e) => setCourseInstructor(e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-xs">Emoji Icon</Label><Input placeholder="📚" value={courseEmoji} onChange={(e) => setCourseEmoji(e.target.value)} /></div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Thumbnail URL</Label><Input placeholder="https://..." value={courseThumbnailUrl} onChange={(e) => setCourseThumbnailUrl(e.target.value)} /></div>
                  <Button className="w-full" onClick={handleCreateCourse} disabled={createCourse.isPending}>
                    {createCourse.isPending ? "Creating..." : "Create Course"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showChapterForm} onOpenChange={setShowChapterForm}>
              <DialogTrigger asChild><Button variant="secondary"><FolderPlus className="w-4 h-4 mr-2" /> Chapter</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Chapter</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Course *</Label>
                    <Select value={chapterCourseId} onValueChange={setChapterCourseId}>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.thumbnail_emoji} {c.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Chapter Title *</Label><Input placeholder="e.g. Chapter 1: Introduction" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} /></div>
                  <Button className="w-full" onClick={handleCreateChapter} disabled={createChapter.isPending}>Add Chapter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {courses.map((c) => {
            const courseChapters = chapters.filter((ch) => ch.course_id === c.id);
            const courseLectures = lectures.filter((l) => l.course_id === c.id);
            return (
              <Card key={c.id} className="p-3">
                <div className="flex items-center gap-3">
                  {c.thumbnail_url ? (
                    <img src={c.thumbnail_url} alt={c.title} className="w-14 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">{c.thumbnail_emoji}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">₹{c.price} · {courseChapters.length} ch · {courseLectures.length} lec</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{c.category}</Badge>
                  <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => {
                    if (confirm("Delete this course and all its content?")) deleteCourse.mutate(c.id);
                  }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
                {courseChapters.length > 0 && (
                  <div className="ml-4 mt-2 space-y-1">
                    {courseChapters.map((ch) => (
                      <div key={ch.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{ch.title}</span>
                        <span>({lectures.filter((l) => l.chapter_id === ch.id).length} lectures)</span>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive" onClick={() => deleteChapter.mutate(ch.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* LECTURES TAB */}
        <TabsContent value="videos" className="space-y-3 mt-3">
          <Dialog open={showLectureForm} onOpenChange={setShowLectureForm}>
            <DialogTrigger asChild><Button className="w-full"><Upload className="w-4 h-4 mr-2" /> Add Video Lecture</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Video Lecture</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Course *</Label>
                  <Select value={lecCourseId} onValueChange={(v) => { setLecCourseId(v); setLecChapterId(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.thumbnail_emoji} {c.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {lecCourseId && (
                  <div className="space-y-1">
                    <Label className="text-xs">Chapter *</Label>
                    <Select value={lecChapterId} onValueChange={setLecChapterId}>
                      <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                      <SelectContent>{filteredChaptersForLecture.map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1"><Label className="text-xs">Lecture Title *</Label><Input placeholder="e.g. Introduction to Algebra" value={lecTitle} onChange={(e) => setLecTitle(e.target.value)} /></div>
                <div className="space-y-1">
                  <Label className="text-xs">YouTube Video Link *</Label>
                  <Input placeholder="https://youtube.com/watch?v=..." value={lecYoutubeUrl} onChange={(e) => setLecYoutubeUrl(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground">Paste full YouTube URL. It will be auto-embedded in privacy mode.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Duration</Label><Input placeholder="10:00" value={lecDuration} onChange={(e) => setLecDuration(e.target.value)} /></div>
                  <div className="space-y-1 flex items-end gap-2 pb-0.5">
                    <Switch checked={lecFreePreview} onCheckedChange={setLecFreePreview} />
                    <Label className="text-xs">Free Preview</Label>
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreateLecture} disabled={createLecture.isPending}>
                  {createLecture.isPending ? "Adding..." : "Add Lecture"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {lectures.map((l) => (
            <Card key={l.id} className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Video className="w-4 h-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{l.title}</p>
                <p className="text-xs text-muted-foreground">{(l as any).chapters?.title} · {l.duration}</p>
              </div>
              {l.free_preview && <Badge className="bg-success/10 text-success border-0 text-[10px]"><Eye className="w-2.5 h-2.5 mr-0.5" /> Free</Badge>}
              <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => deleteLecture.mutate(l.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </Card>
          ))}
        </TabsContent>

        {/* NOTES TAB */}
        <TabsContent value="notes" className="space-y-3 mt-3">
          <Dialog open={showNoteForm} onOpenChange={setShowNoteForm}>
            <DialogTrigger asChild><Button className="w-full"><Upload className="w-4 h-4 mr-2" /> Upload Study Material</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload Notes / PDF</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Course *</Label>
                  <Select value={noteCourseId} onValueChange={(v) => { setNoteCourseId(v); setNoteChapterId(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.thumbnail_emoji} {c.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {noteCourseId && (
                  <div className="space-y-1">
                    <Label className="text-xs">Chapter *</Label>
                    <Select value={noteChapterId} onValueChange={setNoteChapterId}>
                      <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                      <SelectContent>{filteredChaptersForNote.map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1"><Label className="text-xs">Note Title *</Label><Input placeholder="e.g. Formula Sheet" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea placeholder="Brief description..." rows={2} value={noteDesc} onChange={(e) => setNoteDesc(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Pages</Label><Input type="number" placeholder="10" value={notePages} onChange={(e) => setNotePages(e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">File URL</Label><Input placeholder="https://..." value={noteFileUrl} onChange={(e) => setNoteFileUrl(e.target.value)} /></div>
                </div>
                <Button className="w-full" onClick={handleCreateNote} disabled={createNote.isPending}>
                  {createNote.isPending ? "Uploading..." : "Upload Notes"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {notes.map((n) => (
            <Card key={n.id} className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-destructive" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground">{(n as any).chapters?.title} · {n.pages} pages</p>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => deleteNote.mutate(n.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
