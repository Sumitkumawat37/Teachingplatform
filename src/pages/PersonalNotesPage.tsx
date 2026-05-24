import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText, Plus, Trash2, Edit, Save, Clock, Search, Download,
  BookOpen
} from "lucide-react";

interface Note {
  id: string;
  lecture_id: string;
  lecture_title?: string;
  content: string;
  timestamp_seconds: number;
  created_at: string;
  updated_at: string;
}

const PersonalNotesPage = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [timestamp, setTimestamp] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: lecData } = await supabase.from("lectures").select("id, title").order("title");
      setLectures(lecData || []);

      if (user) {
        const { data: noteData } = await supabase
          .from("notes")
          .select("*, lectures(title)")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });
        
        setNotes((noteData || []).map((n: any) => ({
          ...n,
          lecture_title: n.lectures?.title || "Unknown Lecture"
        })));
      }
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateNote = async () => {
    if (!user || !selectedLectureId) return toast.error("Please select a lecture");
    if (!newNoteContent.trim()) return toast.error("Note content cannot be empty");

    try {
      const res = await fetch("http://localhost:5000/api/v1/upsc/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          lectureId: selectedLectureId,
          content: newNoteContent,
          timestampSeconds: timestamp,
          action: "create"
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Note created successfully!");
        setNewNoteContent("");
        setSelectedLectureId("");
        setTimestamp(0);
        loadData();
      } else {
        toast.error(data.error || "Failed to create note");
      }
    } catch {
      toast.error("Could not reach backend");
    }
  };

  const handleEditNote = async () => {
    if (!activeNote || !editContent.trim()) return toast.error("Content cannot be empty");

    try {
      const res = await fetch("http://localhost:5000/api/v1/upsc/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeNote.id,
          userId: user?.id,
          lectureId: activeNote.lecture_id,
          content: editContent,
          timestampSeconds: activeNote.timestamp_seconds,
          action: "update"
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Note updated!");
        setIsEditing(false);
        setActiveNote(null);
        loadData();
      } else {
        toast.error(data.error || "Failed to update note");
      }
    } catch {
      toast.error("Could not reach backend");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/upsc/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: noteId,
          userId: user?.id,
          lectureId: "",
          content: "",
          timestampSeconds: 0,
          action: "delete"
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Note deleted");
        loadData();
      } else {
        toast.error(data.error || "Failed to delete note");
      }
    } catch {
      toast.error("Could not reach backend");
    }
  };

  const exportNotesAsPDF = () => {
    const filtered = notes.filter(n => 
      n.content.toLowerCase().includes(search.toLowerCase()) || 
      n.lecture_title?.toLowerCase().includes(search.toLowerCase())
    );

    if (filtered.length === 0) return toast.error("No notes to export");

    const textContent = filtered.map(n => 
      `Lecture: ${n.lecture_title}\nTimestamp: ${n.timestamp_seconds}s\nNote:\n${n.content}\n\n---\n\n`
    ).join("");

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upsc-notes-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Notes exported as text file");
  };

  const filteredNotes = notes.filter(n => 
    n.content.toLowerCase().includes(search.toLowerCase()) || 
    n.lecture_title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Personal Notes & Bookmarks</h1>
            <p className="text-muted-foreground text-sm">Create timestamped notes, bookmark lectures, and export your study material</p>
          </div>
        </div>
        <Button onClick={exportNotesAsPDF} variant="secondary" size="sm" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Notes
        </Button>
      </div>

      {activeNote ? (
        <Card className="p-6 bg-card border border-border space-y-4 animate-slide-up">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-bold text-foreground">{activeNote.lecture_title}</h3>
              {activeNote.timestamp_seconds > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Timestamp: {formatTimestamp(activeNote.timestamp_seconds)}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setActiveNote(null); setIsEditing(false); }}>Close</Button>
          </div>
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                className="w-full bg-white/5 border border-purple-500/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/30 resize-none font-mono"
              />
              <div className="flex gap-2">
                <Button onClick={handleEditNote} className="bg-gradient-to-r from-amber-600 to-orange-600">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed font-mono whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">{activeNote.content}</p>
              <div className="flex gap-2">
                <Button onClick={() => { setEditContent(activeNote.content); setIsEditing(true); }} size="sm" variant="ghost">
                  <Edit className="w-4 h-4 mr-2" /> Edit Note
                </Button>
                <Button onClick={() => handleDeleteNote(activeNote.id)} size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5 bg-card border border-border space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Plus className="w-4 h-4 text-amber-400" /> Create New Note</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Lecture</label>
                <select
                  value={selectedLectureId}
                  onChange={(e) => setSelectedLectureId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/10"
                >
                  <option value="" className="bg-white">Choose a lecture...</option>
                  {lectures.map((lec) => (
                    <option key={lec.id} value={lec.id} className="bg-white">{lec.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Video Timestamp (seconds)</label>
                <input
                  type="number"
                  value={timestamp}
                  onChange={(e) => setTimestamp(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white/5 border border-purple-500/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Note Content</label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={6}
                  placeholder="Write your note here... Key points, formulas, important dates, etc."
                  className="w-full bg-white/5 border border-purple-500/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/30 resize-none"
                />
              </div>

              <Button onClick={handleCreateNote} className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
                <Plus className="w-4 h-4 mr-2" /> Save Note
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full bg-white/5 border border-purple-500/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/30"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Clock className="w-8 h-8 text-primary animate-spin" /></div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground bg-card border border-border rounded-2xl">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-400" />
                <p className="text-sm">No notes found. Create your first note!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="p-4 bg-card border border-border hover:border-amber-500/20 transition-all cursor-pointer" onClick={() => setActiveNote(note)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          <p className="text-sm font-semibold text-foreground">{note.lecture_title}</p>
                        </div>
                        {note.timestamp_seconds > 0 && (
                          <p className="text-[10px] text-purple-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimestamp(note.timestamp_seconds)}</p>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                        <p className="text-[10px] text-gray-500">Last updated: {new Date(note.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalNotesPage;
