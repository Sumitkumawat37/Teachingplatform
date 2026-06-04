import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Mail, RefreshCw, UserCheck, Download, Upload, Trash2, CheckSquare, Square, X, Lock as LockIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const AdminStudents = () => {
  const { user, role } = useAuth();
  const [studentProfiles, setStudentProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");

  const fetchStudentProfiles = async () => {
    setLoading(true);
    try {
      // Get all user roles that are admin or super_admin
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      const nonStudentUserIds = userRoles
        ?.filter((r: any) => r.role === "admin" || r.role === "super_admin" || r.role === "teacher")
        .map((r: any) => r.user_id) || [];
      
      // Get all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("name", { ascending: true });

      // Filter profiles to exclude non-students
      let students = (profiles || []).filter((p: any) => !nonStudentUserIds.includes(p.user_id));
      
      // If teacher, filter to only students enrolled in their courses
      if (role === "teacher" && user?.id) {
        // Get courses taught by this teacher
        const { data: teacherCourses } = await supabase
          .from("courses")
          .select("id")
          .eq("teacher_id", user.id);
        
        const teacherCourseIds = teacherCourses?.map((c: any) => c.id) || [];
        
        if (teacherCourseIds.length > 0) {
          // Get enrollments for these courses
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select("user_id")
            .in("course_id", teacherCourseIds);
          
          const enrolledStudentIds = enrollments?.map((e: any) => e.user_id) || [];
          students = students.filter((s: any) => enrolledStudentIds.includes(s.user_id));
        } else {
          // Teacher has no courses, show no students
          students = [];
        }
      }
      
      setStudentProfiles(students);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfiles();
  }, []);

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "User ID", "Created At"];
    const rows = studentProfiles.map(s => [
      s.name || "",
      s.email || "",
      s.user_id || "",
      s.created_at || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Students exported successfully!");
  };

  const handleBulkImport = async () => {
    if (!importText.trim()) return toast.error("Please enter data to import");
    
    const lines = importText.trim().split("\n");
    const imported = [];
    
    for (const line of lines) {
      const [name, email] = line.split(",").map(s => s.trim());
      if (name && email) {
        imported.push({ name, email });
      }
    }

    if (imported.length === 0) return toast.error("No valid data found. Format: Name, Email (one per line)");

    try {
      for (const student of imported) {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: student.email,
          password: "tempPassword123", // Should be changed on first login
          options: {
            data: { name: student.name }
          }
        });

        if (authError) {
          console.error("Failed to create user:", authError);
          continue;
        }

        // Profile is created automatically by trigger
      }
      toast.success(`Imported ${imported.length} students successfully!`);
      setImportText("");
      setShowImportModal(false);
      fetchStudentProfiles();
    } catch (error) {
      toast.error("Import failed. Please check the format.");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedStudents.length === 0) return toast.error("No students selected");
    
    try {
      for (const userId of selectedStudents) {
        await supabase.from("profiles").delete().eq("user_id", userId);
      }
      toast.success(`Deleted ${selectedStudents.length} students`);
      setSelectedStudents([]);
      fetchStudentProfiles();
    } catch {
      toast.error("Failed to delete students");
    }
  };

  const toggleSelectStudent = (userId: string) => {
    setSelectedStudents(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === studentProfiles.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(studentProfiles.map(s => s.user_id));
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Student Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {studentProfiles.length} registered {studentProfiles.length === 1 ? "student" : "students"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedStudents.length > 0 && (
            <Button onClick={handleBatchDelete} variant="destructive" size="sm" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedStudents.length})
            </Button>
          )}
          <Button onClick={() => setShowImportModal(true)} variant="secondary" size="sm" className="flex items-center gap-2">
            <Upload className="w-4 h-4" /> Bulk Import
          </Button>
          <Button onClick={handleExportCSV} variant="secondary" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <button 
            onClick={fetchStudentProfiles} 
            className="p-2 rounded-xl bg-white/5 border border-purple-500/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="p-6 bg-card border border-border w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Bulk Import Students</h3>
              <button onClick={() => setShowImportModal(false)} className="p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter student data in CSV format: Name, Email (one per line)
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="John Doe, john@example.com&#10;Jane Smith, jane@example.com"
              rows={6}
              className="w-full bg-white/5 border border-purple-500/10 rounded-xl p-3 text-sm text-white resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={handleBulkImport} className="flex-1 bg-primary">Import Students</Button>
              <Button onClick={() => setShowImportModal(false)} variant="secondary">Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {studentProfiles.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
              <button onClick={toggleSelectAll} className="p-1 rounded hover:bg-white/10">
                {selectedStudents.length === studentProfiles.length ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <span className="text-xs text-muted-foreground">Select All</span>
            </div>
          )}
          {studentProfiles.map((s) => (
            <Card key={s.id} className={`p-4 bg-card border border-border shadow-sm transition-all ${
              selectedStudents.includes(s.user_id) ? "border-primary bg-primary/5" : "hover:border-purple-500/20"
            }`}>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleSelectStudent(s.user_id)} className="p-1 rounded hover:bg-white/10">
                  {selectedStudents.includes(s.user_id) ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {s.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground">{s.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-purple-400" /> {s.email}
                  </p>
                </div>
              </div>
            </Card>
          ))}
          {studentProfiles.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-sm">No registered students found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
