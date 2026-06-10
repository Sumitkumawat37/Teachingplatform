import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Mail, Shield, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
  bio?: string;
  avatar_url?: string;
}

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    bio: "",
    password: "password123"
  });
  const [submitting, setSubmitting] = useState(false);
  const qc = useQueryClient();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", (
          await supabase.from("user_roles").select("user_id").eq("role", "teacher")
        ).data?.map((r: any) => r.user_id) || []);
      
      if (error) throw error;
      setTeachers(data || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error("Name and email are required");
    }

    setSubmitting(true);
    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Insert into profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          name: formData.name,
          subject: formData.subject,
          bio: formData.bio,
          avatar_url: null
        });

      if (profileError) throw profileError;

      // Assign teacher role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "teacher"
        });

      if (roleError) throw roleError;

      toast.success("Teacher profile created successfully!");
      setFormData({ name: "", email: "", subject: "", bio: "", password: "password123" });
      fetchTeachers();
    } catch (err: any) {
      console.error("Error creating teacher:", err);
      toast.error(err.message || "Failed to create teacher profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this teacher?")) return;

    try {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "teacher");
      toast.success("Teacher role removed");
      fetchTeachers();
    } catch (err) {
      console.error("Error deleting teacher:", err);
      toast.error("Failed to remove teacher");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-xl font-bold text-slate-800">Manage Teachers</h2>

      <Card className="p-4 bg-card border border-border shadow-sm space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" />
          Add New Teacher
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Full Name *</Label>
            <Input
              placeholder="Teacher name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-slate-800"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email Address *</Label>
            <Input
              type="email"
              placeholder="teacher@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="text-slate-800"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Subject Specialization</Label>
            <Input
              placeholder="e.g., Polity, History, Geography"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="text-slate-800"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bio</Label>
            <Input
              placeholder="Brief description about the teacher"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="text-slate-800"
            />
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={submitting}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {submitting ? "Creating..." : "Create Teacher Profile"}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-slate-700">Existing Teachers</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No teachers found</p>
        ) : (
          teachers.map((teacher) => (
            <Card key={teacher.id} className="p-4 bg-card border border-border shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm truncate">{teacher.name}</h4>
                    <Badge className="bg-primary/15 text-primary border-0 text-[10px]">Teacher</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" /> {teacher.email}
                  </p>
                  {teacher.subject && (
                    <p className="text-xs text-slate-500 mt-1">{teacher.subject}</p>
                  )}
                  {teacher.bio && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{teacher.bio}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive shrink-0"
                  onClick={() => handleDelete(teacher.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTeachers;
