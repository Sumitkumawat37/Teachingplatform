import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCourses, useLectures, useNotes, useChapters, useCourseReviewVideos } from "@/lib/supabase-data";
import { useCreateCourse, useDeleteCourse, useUpdateCourse, useCreateChapter, useDeleteChapter, useCreateLecture, useDeleteLecture, useUpdateLecture, useCreateNote, useDeleteNote, useCreateReviewVideo, useDeleteReviewVideo } from "@/lib/supabase-mutations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, FileText, Plus, Upload, BookOpen, Eye, Trash2, FolderPlus, ImagePlus, HardDrive, X, Lock as LockIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleAuth } from "@/lib/google-oauth-context";

const AdminContent = () => {
  const { isSignedIn, signIn, listDriveFiles } = useGoogleAuth();
  
  // Course form
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showEditCourseForm, setShowEditCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState("");
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
  const [lecVideoUrl, setLecVideoUrl] = useState("");
  const [lecDuration, setLecDuration] = useState("10:00");
  const [lecCourseId, setLecCourseId] = useState("");
  const [lecChapterId, setLecChapterId] = useState("");
  const [lecFreePreview, setLecFreePreview] = useState(false);
  const [lecThumbnailFile, setLecThumbnailFile] = useState<File | null>(null);
  const [lecThumbnailPreview, setLecThumbnailPreview] = useState("");
  const [lecVideoFile, setLecVideoFile] = useState<File | null>(null);
  const [lecVideoUploading, setLecVideoUploading] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [lecUploading, setLecUploading] = useState(false);
  const lecFileInputRef = useRef<HTMLInputElement>(null);

  // YouTube Playlist Import
  const [showPlaylistImport, setShowPlaylistImport] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistCourseId, setPlaylistCourseId] = useState("");
  const [playlistChapterId, setPlaylistChapterId] = useState("");
  const [importingPlaylist, setImportingPlaylist] = useState(false);

  // Quick YouTube Video
  const [showQuickYoutube, setShowQuickYoutube] = useState(false);
  const [quickYoutubeUrl, setQuickYoutubeUrl] = useState("");
  const [quickYoutubeTitle, setQuickYoutubeTitle] = useState("");
  const [quickCourseId, setQuickCourseId] = useState("");
  const [quickChapterId, setQuickChapterId] = useState("");

  // Review Videos
  const [showReviewVideoForm, setShowReviewVideoForm] = useState(false);
  const [reviewVideoUrl, setReviewVideoUrl] = useState("");
  const [reviewVideoTitle, setReviewVideoTitle] = useState("");
  const [reviewVideoCourseId, setReviewVideoCourseId] = useState("");
  const [showReviewPlaylistForm, setShowReviewPlaylistForm] = useState(false);
  const [reviewPlaylistUrl, setReviewPlaylistUrl] = useState("");
  const [importingReviewPlaylist, setImportingReviewPlaylist] = useState(false);
  const { data: reviewVideos = [] } = useCourseReviewVideos(reviewVideoCourseId || undefined);

  // Note form
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [notePages, setNotePages] = useState("");
  const [noteFileUrl, setNoteFileUrl] = useState("");
  const [noteCourseId, setNoteCourseId] = useState("");
  const [noteChapterId, setNoteChapterId] = useState("");
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);

  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures();
  const { data: notes = [] } = useNotes();
  const { data: chapters = [] } = useChapters();

  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const updateCourse = useUpdateCourse();
  const createChapter = useCreateChapter();
  const deleteChapter = useDeleteChapter();
  const createLecture = useCreateLecture();
  const deleteLecture = useDeleteLecture();
  const updateLecture = useUpdateLecture();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const createReviewVideo = useCreateReviewVideo();
  const deleteReviewVideo = useDeleteReviewVideo();

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

  const handleEditCourse = (course: any) => {
    setEditingCourseId(course.id);
    setCourseTitle(course.title);
    setCourseDesc(course.description || "");
    setCoursePrice(course.price?.toString() || "");
    setCourseCategory(course.category || "");
    setCourseInstructor(course.instructor || "");
    setCourseEmoji(course.thumbnail_emoji || "📚");
    setCourseThumbnailUrl(course.thumbnail_url || "");
    setThumbnailPreview(course.thumbnail_url || "");
    setThumbnailFile(null);
    setShowEditCourseForm(true);
  };

  const handleUpdateCourse = async () => {
    if (!courseTitle) return toast.error("Course title is required");
    const thumbUrl = await uploadThumbnail();
    updateCourse.mutate({
      id: editingCourseId,
      title: courseTitle,
      description: courseDesc,
      price: parseInt(coursePrice) || 0,
      category: courseCategory,
      instructor: courseInstructor || "Rajesh Kumar",
      thumbnail_emoji: courseEmoji,
      ...(thumbUrl ? { thumbnail_url: thumbUrl } : {}),
    }, {
      onSuccess: () => {
        toast.success("Course updated!");
        setShowEditCourseForm(false);
        setEditingCourseId("");
        setCourseTitle(""); setCourseDesc(""); setCoursePrice(""); setCourseCategory(""); setCourseInstructor(""); setCourseThumbnailUrl("");
        setThumbnailFile(null); setThumbnailPreview("");
      },
      onError: (error: any) => toast.error("Failed to update course: " + error.message)
    });
  };

  const handleCreateChapter = () => {
    if (!chapterTitle || !chapterCourseId) return toast.error("Fill all fields");
    const sortOrder = chapters.filter((c) => c.course_id === chapterCourseId).length;
    createChapter.mutate({ course_id: chapterCourseId, title: chapterTitle, sort_order: sortOrder }, {
      onSuccess: () => { toast.success("Chapter created!"); setShowChapterForm(false); setChapterTitle(""); },
    });
  };

  const handleLecThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setLecThumbnailFile(file);
    setLecThumbnailPreview(URL.createObjectURL(file));
  };

  const uploadLecThumbnail = async (): Promise<string | undefined> => {
    if (!lecThumbnailFile) return undefined;
    setLecUploading(true);
    const ext = lecThumbnailFile.name.split(".").pop();
    const path = `lectures/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("thumbnails").upload(path, lecThumbnailFile);
    setLecUploading(false);
    if (error) { toast.error("Upload failed: " + error.message); return undefined; }
    const { data: urlData } = supabase.storage.from("thumbnails").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast.error("Please select a video file"); return; }
    if (file.size > 500 * 1024 * 1024) { toast.error("Video must be under 500MB"); return; }
    setLecVideoFile(file);
    setLecYoutubeUrl(""); // Clear YouTube URL when uploading video
  };

  const uploadVideoFile = async (): Promise<string | undefined> => {
    if (!lecVideoFile) return lecVideoUrl || undefined;
    setLecVideoUploading(true);
    const ext = lecVideoFile.name.split(".").pop();
    const path = `videos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("videos").upload(path, lecVideoFile);
    setLecVideoUploading(false);
    if (error) { toast.error("Video upload failed: " + error.message); return undefined; }
    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleCreateLecture = async () => {
    if (!lecTitle || !lecCourseId || !lecChapterId) return toast.error("Fill required fields");
    if (!lecYoutubeUrl && !lecVideoUrl && !lecVideoFile) return toast.error("Add a YouTube link or upload a video");
    
    const thumbUrl = await uploadLecThumbnail();
    const videoUrl = await uploadVideoFile();
    const sortOrder = lectures.filter((l) => l.chapter_id === lecChapterId).length;
    
    createLecture.mutate({
      course_id: lecCourseId, chapter_id: lecChapterId, title: lecTitle,
      youtube_id: lecYoutubeUrl || "", duration: lecDuration, free_preview: lecFreePreview, sort_order: sortOrder,
      ...(thumbUrl ? { thumbnail_url: thumbUrl } : {}),
      ...(videoUrl ? { video_url: videoUrl } : {}),
    } as any, {
      onSuccess: () => {
        toast.success("Lecture added!");
        setShowLectureForm(false);
        setLecTitle(""); setLecYoutubeUrl(""); setLecVideoUrl(""); setLecFreePreview(false);
        setLecThumbnailFile(null); setLecThumbnailPreview("");
        setLecVideoFile(null);
      },
    });
  };

  const handleToggleFreePreview = (lectureId: string, currentValue: boolean) => {
    updateLecture.mutate({ id: lectureId, free_preview: !currentValue }, {
      onSuccess: () => toast.success(!currentValue ? "Marked as free preview" : "Removed free preview"),
    });
  };

  const handleQuickYoutube = () => {
    if (!quickYoutubeUrl || !quickYoutubeTitle || !quickCourseId || !quickChapterId) {
      return toast.error("Fill all fields");
    }
    const sortOrder = lectures.filter((l) => l.chapter_id === quickChapterId).length;
    createLecture.mutate({
      course_id: quickCourseId,
      chapter_id: quickChapterId,
      title: quickYoutubeTitle,
      youtube_id: quickYoutubeUrl,
      duration: "10:00",
      free_preview: false,
      sort_order: sortOrder,
    } as any, {
      onSuccess: () => {
        toast.success("YouTube video added!");
        setShowQuickYoutube(false);
        setQuickYoutubeUrl("");
        setQuickYoutubeTitle("");
        setQuickCourseId("");
        setQuickChapterId("");
      },
      onError: () => toast.error("Failed to add YouTube video"),
    });
  };

  const handleAddReviewVideo = () => {
    if (!reviewVideoUrl || !reviewVideoTitle || !reviewVideoCourseId) {
      return toast.error("Fill all fields");
    }

    // Extract YouTube video ID from URL
    let youtubeId = reviewVideoUrl;
    const match = reviewVideoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (match && match[1]) {
      youtubeId = match[1];
    }

    const sortOrder = reviewVideos.length;
    createReviewVideo.mutate({
      course_id: reviewVideoCourseId,
      youtube_id: youtubeId,
      title: reviewVideoTitle,
      sort_order: sortOrder,
    }, {
      onSuccess: () => {
        toast.success("Review video added!");
        setReviewVideoUrl("");
        setReviewVideoTitle("");
      },
      onError: (error: any) => toast.error("Failed to add review video: " + error.message),
    });
  };

  const extractReviewPlaylistId = (url: string): string | null => {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  };

  const handleImportReviewPlaylist = async () => {
    if (!reviewPlaylistUrl || !reviewVideoCourseId) {
      return toast.error("Fill all fields");
    }

    const playlistId = extractReviewPlaylistId(reviewPlaylistUrl);
    if (!playlistId) {
      return toast.error("Invalid YouTube playlist URL");
    }

    setImportingReviewPlaylist(true);
    try {
      // Fetch playlist videos from YouTube Data API
      const apiKey = process.env.VITE_YOUTUBE_API_KEY || "";
      if (!apiKey) {
        toast.error("YouTube API key not configured");
        setImportingReviewPlaylist(false);
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`
      );
      const data = await response.json();

      if (data.error) {
        toast.error("Failed to fetch playlist: " + data.error.message);
        setImportingReviewPlaylist(false);
        return;
      }

      const videos = data.items || [];
      if (videos.length === 0) {
        toast.error("No videos found in playlist");
        setImportingReviewPlaylist(false);
        return;
      }

      // Add each video as a review video
      let addedCount = 0;
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const videoId = video.snippet.resourceId?.videoId;
        const title = video.snippet.title;

        if (videoId && title) {
          createReviewVideo.mutate(
            {
              course_id: reviewVideoCourseId,
              youtube_id: videoId,
              title: title,
              sort_order: reviewVideos.length + i,
            },
            {
              onSuccess: () => {
                addedCount++;
                if (addedCount === videos.length) {
                  toast.success(`Successfully imported ${addedCount} videos from playlist`);
                  setReviewPlaylistUrl("");
                  setShowReviewPlaylistForm(false);
                }
              },
            }
          );
        }
      }

      setImportingReviewPlaylist(false);
    } catch (error) {
      console.error("Error importing playlist:", error);
      toast.error("Failed to import playlist");
      setImportingReviewPlaylist(false);
    }
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

  const pickFromDrive = async () => {
    if (!isSignedIn) {
      try {
        await signIn();
      } catch (error) {
        toast.error("Failed to sign in to Google");
        return;
      }
    }
    
    setLoadingDrive(true);
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
      setShowDrivePicker(true);
      setLoadingDrive(false);
    } catch (error: any) {
      console.error('Error picking from Drive:', error);
      toast.error("Failed to load Drive files: " + (error.message || "Unknown error"));
      setLoadingDrive(false);
    }
  };

  const selectDriveFile = (file: any) => {
    setNoteFileUrl(file.webViewLink);
    setShowDrivePicker(false);
    toast.success(`Selected: ${file.name}`);
  };

  // Extract playlist ID from YouTube URL
  const extractPlaylistId = (url: string): string | null => {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  };

  // Import YouTube playlist
  const handleImportPlaylist = async () => {
    if (!playlistUrl || !playlistCourseId || !playlistChapterId) {
      return toast.error("Fill all fields");
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return toast.error("Invalid YouTube playlist URL");
    }

    setImportingPlaylist(true);
    try {
      // Fetch playlist videos using YouTube Data API
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error("YouTube API key not configured");
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const videos = data.items || [];
      if (videos.length === 0) {
        toast.warning("No videos found in playlist");
        setImportingPlaylist(false);
        return;
      }

      // Create lectures for each video
      let successCount = 0;
      const sortOrder = lectures.filter((l) => l.chapter_id === playlistChapterId).length;

      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const videoId = video.snippet?.resourceId?.videoId;
        const title = video.snippet?.title || `Video ${i + 1}`;
        
        if (videoId) {
          try {
            await createLecture.mutateAsync({
              course_id: playlistCourseId,
              chapter_id: playlistChapterId,
              title,
              youtube_id: videoId,
              duration: "10:00",
              free_preview: false,
              sort_order: sortOrder + i,
            } as any);
            successCount++;
          } catch (error) {
            console.error(`Failed to create lecture for video ${i + 1}:`, error);
          }
        }
      }

      toast.success(`Imported ${successCount}/${videos.length} videos from playlist`);
      setShowPlaylistImport(false);
      setPlaylistUrl("");
    } catch (error: any) {
      console.error("Playlist import error:", error);
      toast.error(error.message || "Failed to import playlist");
    } finally {
      setImportingPlaylist(false);
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Content Management</h2>
      </div>
      <Tabs defaultValue="courses">
        <TabsList className="w-full">
          <TabsTrigger value="courses" className="flex-1"><BookOpen className="w-4 h-4 mr-1" /> Courses</TabsTrigger>
          <TabsTrigger value="videos" className="flex-1"><Video className="w-4 h-4 mr-1" /> Lectures</TabsTrigger>
          <TabsTrigger value="review-videos" className="flex-1"><Video className="w-4 h-4 mr-1" /> Review Videos</TabsTrigger>
          <TabsTrigger value="notes" className="flex-1"><FileText className="w-4 h-4 mr-1" /> Notes</TabsTrigger>
        </TabsList>

        {/* COURSES TAB */}
        <TabsContent value="courses" className="space-y-3 mt-3">
          <div className="flex gap-2">
            <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
              <DialogTrigger asChild><Button className="flex-1"><Plus className="w-4 h-4 mr-2" /> New Course</Button></DialogTrigger>
              <DialogContent className="overflow-y-auto max-h-[85vh]">
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
                  <div className="space-y-1">
                    <Label className="text-xs">Course Thumbnail</Label>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img src={thumbnailPreview} alt="Preview" className="w-full h-28 object-cover rounded-lg border border-border" />
                        <Button size="sm" variant="secondary" className="absolute top-1 right-1 h-6 text-[10px]" onClick={() => { setThumbnailFile(null); setThumbnailPreview(""); }}>Remove</Button>
                      </div>
                    ) : (
                      <div
                        className="w-full h-28 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="w-6 h-6 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Click to upload image</span>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground">Or paste a URL:</p>
                    <Input placeholder="https://..." value={courseThumbnailUrl} onChange={(e) => { setCourseThumbnailUrl(e.target.value); setThumbnailFile(null); setThumbnailPreview(""); }} />
                  </div>
                  <Button className="w-full" onClick={handleCreateCourse} disabled={createCourse.isPending || uploading}>
                    {uploading ? "Uploading image..." : createCourse.isPending ? "Creating..." : "Create Course"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showEditCourseForm} onOpenChange={setShowEditCourseForm}>
              <DialogContent className="overflow-y-auto max-h-[85vh]">
                <DialogHeader><DialogTitle>Edit Course</DialogTitle></DialogHeader>
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
                  <div className="space-y-1">
                    <Label className="text-xs">Course Thumbnail</Label>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img src={thumbnailPreview} alt="Preview" className="w-full h-28 object-cover rounded-lg border border-border" />
                        <Button size="sm" variant="secondary" className="absolute top-1 right-1 h-6 text-[10px]" onClick={() => { setThumbnailFile(null); setThumbnailPreview(""); }}>Remove</Button>
                      </div>
                    ) : (
                      <div
                        className="w-full h-28 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="w-6 h-6 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Click to upload image</span>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground">Or paste a URL:</p>
                    <Input placeholder="https://..." value={courseThumbnailUrl} onChange={(e) => { setCourseThumbnailUrl(e.target.value); setThumbnailFile(null); setThumbnailPreview(""); }} />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleUpdateCourse} disabled={updateCourse.isPending || uploading}>
                      {uploading ? "Uploading image..." : updateCourse.isPending ? "Updating..." : "Update Course"}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowEditCourseForm(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showChapterForm} onOpenChange={setShowChapterForm}>
              <DialogTrigger asChild><Button variant="secondary"><FolderPlus className="w-4 h-4 mr-2" /> Chapter</Button></DialogTrigger>
              <DialogContent className="overflow-y-auto max-h-[85vh]">
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
                  <Button size="sm" variant="ghost" className="shrink-0" onClick={() => handleEditCourse(c)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => {
                    if (confirm("Delete this course and all its content?")) {
                      deleteCourse.mutate(c.id, {
                        onSuccess: () => toast.success("Course deleted successfully"),
                        onError: (error: any) => toast.error("Failed to delete course: " + error.message)
                      });
                    }
                  }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
                {courseChapters.length > 0 && (
                  <div className="ml-4 mt-2 space-y-1">
                    {courseChapters.map((ch) => (
                      <div key={ch.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{ch.title}</span>
                        <span>({lectures.filter((l) => l.chapter_id === ch.id).length} lectures)</span>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive" onClick={() => {
                          deleteChapter.mutate(ch.id, {
                            onSuccess: () => toast.success("Chapter deleted successfully"),
                            onError: (error: any) => toast.error("Failed to delete chapter: " + error.message)
                          });
                        }}><Trash2 className="w-3 h-3" /></Button>
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
          <div className="flex gap-2">
            <Dialog open={showLectureForm} onOpenChange={setShowLectureForm}>
              <DialogTrigger asChild><Button className="flex-1"><Upload className="w-4 h-4 mr-2" /> Add Video Lecture</Button></DialogTrigger>
              <DialogContent className="overflow-y-auto max-h-[85vh]">
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
                  
                  {/* Video Source Options */}
                  <div className="space-y-2 p-3 bg-accent/30 rounded-lg">
                    <p className="text-xs font-medium">Video Source (choose one)</p>
                    
                    {/* Option 1: YouTube URL */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Option 1: YouTube Link</Label>
                      <Input 
                        placeholder="https://youtube.com/watch?v=..." 
                        value={lecYoutubeUrl} 
                        onChange={(e) => { setLecYoutubeUrl(e.target.value); setLecVideoUrl(""); setLecVideoFile(null); }}
                        disabled={!!lecVideoFile || !!lecVideoUrl}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 py-1">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground">OR</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    
                    {/* Option 2: Upload Video */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Option 2: Upload Video</Label>
                      <input ref={videoFileInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoFileSelect} />
                      {lecVideoFile ? (
                        <div className="flex items-center gap-2 p-2 bg-success/10 rounded-lg">
                          <Video className="w-4 h-4 text-success" />
                          <span className="text-xs flex-1 truncate">{lecVideoFile.name}</span>
                          <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setLecVideoFile(null)}>Remove</Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full h-9 text-xs" 
                          onClick={() => videoFileInputRef.current?.click()}
                          disabled={!!lecYoutubeUrl}
                        >
                          <Upload className="w-3 h-3 mr-1" /> Select Video File
                        </Button>
                      )}
                      <p className="text-[10px] text-muted-foreground">Max 500MB. MP4, WebM, MOV supported.</p>
                    </div>
                    
                    {/* Option 3: Video URL */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Or paste video URL</Label>
                      <Input 
                        placeholder="https://your-video-host.com/video.mp4" 
                        value={lecVideoUrl} 
                        onChange={(e) => { setLecVideoUrl(e.target.value); setLecYoutubeUrl(""); setLecVideoFile(null); }}
                        disabled={!!lecVideoFile || !!lecYoutubeUrl}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Video Thumbnail</Label>
                    <input ref={lecFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLecThumbnailSelect} />
                    {lecThumbnailPreview ? (
                      <div className="relative">
                        <img src={lecThumbnailPreview} alt="Preview" className="w-full h-24 object-cover rounded-lg border border-border" />
                        <Button size="sm" variant="secondary" className="absolute top-1 right-1 h-6 text-[10px]" onClick={() => { setLecThumbnailFile(null); setLecThumbnailPreview(""); }}>Remove</Button>
                      </div>
                    ) : (
                      <div className="w-full h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => lecFileInputRef.current?.click()}>
                        <ImagePlus className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Upload thumbnail (optional)</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Duration</Label><Input placeholder="10:00" value={lecDuration} onChange={(e) => setLecDuration(e.target.value)} /></div>
                    <div className="space-y-1 flex items-end gap-2 pb-0.5">
                      <Switch checked={lecFreePreview} onCheckedChange={setLecFreePreview} />
                      <Label className="text-xs">Free Preview</Label>
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleCreateLecture} disabled={createLecture.isPending || lecUploading || lecVideoUploading}>
                    {lecVideoUploading ? "Uploading video..." : lecUploading ? "Uploading thumbnail..." : createLecture.isPending ? "Adding..." : "Add Lecture"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showPlaylistImport} onOpenChange={setShowPlaylistImport}>
              <DialogTrigger asChild><Button variant="secondary" className="flex-1"><Video className="w-4 h-4 mr-2" /> Import YouTube Playlist</Button></DialogTrigger>
              <DialogContent className="overflow-y-auto max-h-[85vh]">
                <DialogHeader><DialogTitle>Import YouTube Playlist</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Course *</Label>
                    <Select value={playlistCourseId} onValueChange={(v) => { setPlaylistCourseId(v); setPlaylistChapterId(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.thumbnail_emoji} {c.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {playlistCourseId && (
                    <div className="space-y-1">
                      <Label className="text-xs">Chapter *</Label>
                      <Select value={playlistChapterId} onValueChange={setPlaylistChapterId}>
                        <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                        <SelectContent>{chapters.filter((c) => c.course_id === playlistCourseId).map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">YouTube Playlist URL *</Label>
                    <Input 
                      placeholder="https://www.youtube.com/playlist?list=..." 
                      value={playlistUrl} 
                      onChange={(e) => setPlaylistUrl(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">Paste the full YouTube playlist URL. All videos will be imported as lectures.</p>
                  </div>
                  <Button className="w-full" onClick={handleImportPlaylist} disabled={importingPlaylist}>
                    {importingPlaylist ? "Importing..." : "Import Playlist"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showQuickYoutube} onOpenChange={setShowQuickYoutube}>
              <DialogTrigger asChild><Button variant="secondary" className="flex-1"><Video className="w-4 h-4 mr-2" /> Quick YouTube</Button></DialogTrigger>
              <DialogContent className="overflow-y-auto max-h-[85vh]">
                <DialogHeader><DialogTitle>Quick Add YouTube Video</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Course *</Label>
                    <Select value={quickCourseId} onValueChange={(v) => { setQuickCourseId(v); setQuickChapterId(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.thumbnail_emoji} {c.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {quickCourseId && (
                    <div className="space-y-1">
                      <Label className="text-xs">Chapter *</Label>
                      <Select value={quickChapterId} onValueChange={setQuickChapterId}>
                        <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                        <SelectContent>{chapters.filter((c) => c.course_id === quickCourseId).map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-1"><Label className="text-xs">YouTube URL *</Label><Input placeholder="https://youtube.com/watch?v=..." value={quickYoutubeUrl} onChange={(e) => setQuickYoutubeUrl(e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Video Title *</Label><Input placeholder="Video title" value={quickYoutubeTitle} onChange={(e) => setQuickYoutubeTitle(e.target.value)} /></div>
                  <Button className="w-full" onClick={handleQuickYoutube} disabled={createLecture.isPending}>
                    {createLecture.isPending ? "Adding..." : "Add Video"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {lectures.map((l) => (
            <Card key={l.id} className="p-3 flex items-center gap-3">
              {(l as any).thumbnail_url ? (
                <img src={(l as any).thumbnail_url} alt={l.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Video className="w-4 h-4 text-primary" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{l.title}</p>
                <p className="text-xs text-muted-foreground">{(l as any).chapters?.title} · {l.duration}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0" title="Toggle free preview">
                <Switch
                  checked={l.free_preview}
                  onCheckedChange={() => handleToggleFreePreview(l.id, l.free_preview)}
                  className="scale-75"
                />
                <span className="text-[10px] text-muted-foreground">{l.free_preview ? "Free" : "Locked"}</span>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => {
                deleteLecture.mutate(l.id, {
                  onSuccess: () => toast.success("Lecture deleted successfully"),
                  onError: (error: any) => toast.error("Failed to delete lecture: " + error.message)
                });
              }}><Trash2 className="w-3.5 h-3.5" /></Button>
            </Card>
          ))}
        </TabsContent>

        {/* REVIEW VIDEOS TAB */}
        <TabsContent value="review-videos" className="space-y-3 mt-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={reviewVideoCourseId} onValueChange={setReviewVideoCourseId}>
                <SelectTrigger><SelectValue placeholder="Select course to manage review videos" /></SelectTrigger>
                <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.thumbnail_emoji} {c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Dialog open={showReviewVideoForm} onOpenChange={setShowReviewVideoForm}>
              <DialogTrigger asChild><Button disabled={!reviewVideoCourseId}><Plus className="w-4 h-4 mr-2" /> Add Video</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Review Video</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1"><Label className="text-xs">YouTube URL *</Label><Input placeholder="https://youtube.com/watch?v=..." value={reviewVideoUrl} onChange={(e) => setReviewVideoUrl(e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Video Title *</Label><Input placeholder="Review video title" value={reviewVideoTitle} onChange={(e) => setReviewVideoTitle(e.target.value)} /></div>
                  <Button className="w-full" onClick={handleAddReviewVideo} disabled={createReviewVideo.isPending}>
                    {createReviewVideo.isPending ? "Adding..." : "Add Video"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showReviewPlaylistForm} onOpenChange={setShowReviewPlaylistForm}>
              <DialogTrigger asChild><Button disabled={!reviewVideoCourseId} variant="outline"><FolderPlus className="w-4 h-4 mr-2" /> Import Playlist</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Import YouTube Playlist</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1"><Label className="text-xs">Playlist URL *</Label><Input placeholder="https://youtube.com/playlist?list=..." value={reviewPlaylistUrl} onChange={(e) => setReviewPlaylistUrl(e.target.value)} /></div>
                  <Button className="w-full" onClick={handleImportReviewPlaylist} disabled={importingReviewPlaylist}>
                    {importingReviewPlaylist ? "Importing..." : "Import Playlist"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {reviewVideoCourseId && (
            <div className="space-y-3">
              {reviewVideos.length > 0 ? (
                reviewVideos.map((rv: any) => (
                  <Card key={rv.id} className="p-3 flex items-center gap-3">
                    <div className="w-32 h-20 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                      <iframe
                        width="128"
                        height="80"
                        src={`https://www.youtube.com/embed/${rv.youtube_id}`}
                        title={rv.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rv.title}</p>
                      <p className="text-xs text-muted-foreground">Order: {rv.sort_order + 1}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => {
                      if (confirm("Delete this review video?")) {
                        deleteReviewVideo.mutate(rv.id, {
                          onSuccess: () => toast.success("Review video deleted"),
                          onError: () => toast.error("Failed to delete review video"),
                        });
                      }
                    }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No review videos for this course yet.</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* NOTES TAB */}
        <TabsContent value="notes" className="space-y-3 mt-3">
          <Dialog open={showNoteForm} onOpenChange={setShowNoteForm}>
            <DialogTrigger asChild><Button className="w-full"><Upload className="w-4 h-4 mr-2" /> Upload Study Material</Button></DialogTrigger>
            <DialogContent className="overflow-y-auto max-h-[85vh]">
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
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-xs" 
                    onClick={pickFromDrive}
                    disabled={loadingDrive}
                  >
                    {loadingDrive ? "Loading..." : <><Upload className="w-3 h-3 mr-1" /> Pick from Drive</>}
                  </Button>
                </div>
                <Button className="w-full" onClick={handleCreateNote} disabled={createNote.isPending}>
                  {createNote.isPending ? "Uploading..." : "Upload Notes"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Drive File Picker Dialog */}
          <Dialog open={showDrivePicker} onOpenChange={setShowDrivePicker}>
            <DialogContent className="max-w-2xl overflow-y-auto max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>Select from Google Drive</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {loadingDrive ? (
                  <div className="text-center py-8">
                    <HardDrive className="w-8 h-8 mx-auto animate-spin text-purple-400" />
                    <p className="text-gray-400 mt-2">Loading files...</p>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <HardDrive className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                    <p className="text-gray-400">No files found in Drive</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-purple-500/50 cursor-pointer transition-all"
                        onClick={() => selectDriveFile(file)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.mimeType}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
