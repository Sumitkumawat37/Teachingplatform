import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotes, useCourses } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useAuth } from "@/lib/auth-context";
import { FileText, Download, Lock, X, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useScreenProtection } from "@/hooks/useScreenProtection";
import { DriveNotesIntegration } from "@/components/DriveNotesIntegration";

const NotesPage = () => {
  const { role } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [isTabBlurred, setIsTabBlurred] = useState(false);
  const { hasPurchased } = usePurchase();
  const { data: notes = [] } = useNotes(selectedCourse);
  const { data: courses = [] } = useCourses();
  const isScreenProtected = useScreenProtection();

  useEffect(() => {
    const handleBlur = () => setIsTabBlurred(true);
    const handleFocus = () => setIsTabBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const getEmbedUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    // Convert Google Drive link to embed format
    if (fileUrl.includes('drive.google.com')) {
      const match = fileUrl.match(/\/file\/d\/([^/]+)/);
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview?rm=minimal`;
      }
    }
    // For direct PDF links, use Google Docs Viewer with proper sizing
    if (fileUrl.endsWith('.pdf')) {
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}&rm=minimal`;
    }
    return fileUrl;
  };

  const scrollRef = useScrollReveal();

  return (
    <div className="space-y-4 animate-slide-up" ref={scrollRef}>
      <h2 className="text-xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Study Material</h2>

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

      {(role === 'admin' || role === 'super_admin') && <DriveNotesIntegration />}

      <div className="space-y-2">
        {notes.map((note, i) => {
          const purchased = hasPurchased(note.course_id);
          return (
            <Card key={note.id} className={`p-3 flex items-center gap-3 bg-white border border-slate-100/60 shadow-sm rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 ${!purchased ? "opacity-70" : ""}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${purchased ? "bg-rose-50" : "bg-slate-50"}`}>
                {purchased ? (
                  <FileText className="w-5 h-5 text-rose-500" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-400" />
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
                <Button size="sm" variant="ghost" className="shrink-0" onClick={() => setSelectedNote(note)}>
                  <Download className="w-4 h-4 text-slate-500" />
                </Button>
              ) : (
                <Badge variant="secondary" className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100">
                  <Lock className="w-2.5 h-2.5 mr-0.5" /> Locked
                </Badge>
              )}
            </Card>
          );
        })}
      </div>

      {selectedNote && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in">
          <div className="flex items-center justify-between p-3 md:p-4 bg-white border-b border-slate-200 z-10 shrink-0">
            <h3 className="font-semibold text-sm md:text-base text-slate-800 truncate pr-4">{selectedNote.title}</h3>
            <Button size="sm" variant="ghost" onClick={() => setSelectedNote(null)}>
              <X className="w-5 h-5 text-slate-500" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden relative bg-slate-50" style={{ minHeight: 'calc(100vh - 60px)' }}>
            {(isTabBlurred || isScreenProtected) ? (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
                <div className="text-center space-y-4 px-4">
                  <ShieldAlert className="w-16 h-16 mx-auto text-red-500" />
                  <div>
                    <p className="text-white text-lg font-semibold">Content Protected</p>
                    <p className="text-gray-400 text-sm mt-2">Return to this tab to view the content</p>
                  </div>
                </div>
              </div>
            ) : selectedNote.file_url ? (
              <>
                <iframe
                  src={getEmbedUrl(selectedNote.file_url)}
                  className="absolute inset-0 w-full h-full border-0"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={selectedNote.title}
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10">
                  <div className="bg-black/70 text-white text-xs px-3 py-2 rounded">
                    Screenshots are disabled
                  </div>
                </div>
                <div className="absolute top-4 right-4 pointer-events-none opacity-5 text-xs md:text-sm rotate-45 z-10">
                  {selectedNote.title} - UPSC Nadiya
                </div>
                <div className="absolute bottom-4 left-4 pointer-events-none opacity-5 text-xs md:text-sm -rotate-45 z-10">
                  {selectedNote.title} - UPSC Nadiya
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No file URL available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
