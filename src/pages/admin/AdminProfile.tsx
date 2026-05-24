import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useProfiles } from "@/lib/supabase-data";
import { useUpdateProfile } from "@/lib/supabase-mutations";
import { Mail, Phone, MapPin, Award, Edit, Save, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const AdminProfile = () => {
  const { user } = useAuth();
  const { data: profiles = [] } = useProfiles();
  const updateProfile = useUpdateProfile();

  // Find current user's profile
  const myProfile = profiles.find((p: any) => p.user_id === user?.id);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+91 98765 43210",
    location: "New Delhi, India",
    bio: "UPSC Expert & Course Instructor with over 10 years of experience in guiding students towards success in the Civil Services Examination.",
    specialization: "Polity, GS-2, Current Affairs",
  });
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (myProfile) {
      setFormData((prev) => ({
        ...prev,
        name: myProfile.name || prev.name,
        email: myProfile.email || prev.email,
      }));
      setAvatarUrl(myProfile.avatar_url || "");
    }
  }, [myProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("Not authenticated");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          avatar_url: avatarUrl.trim() || null,
        },
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (myProfile) {
      setFormData({
        name: myProfile.name || "",
        email: myProfile.email || "",
        phone: "+91 98765 43210",
        location: "New Delhi, India",
        bio: "UPSC Expert & Course Instructor with over 10 years of experience in guiding students towards success in the Civil Services Examination.",
        specialization: "Polity, GS-2, Current Affairs",
      });
      setAvatarUrl(myProfile.avatar_url || "");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-muted-foreground">Manage your faculty profile</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      <Card className="p-6 bg-card border border-border shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-border shadow-sm">
                <img
                  src={avatarUrl || "/shivam-sir.jpg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/shivam-sir.jpg"; }}
                />
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input name="location" value={formData.location} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input name="specialization" value={formData.specialization} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea name="bio" rows={4} value={formData.bio} onChange={handleInputChange} />
                </div>

                {/* Avatar URL Input with Preview */}
                <div className="space-y-2">
                  <Label>Profile Photo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/photo.jpg"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="flex-1"
                    />
                    {avatarUrl && (
                      <button
                        onClick={() => setAvatarUrl("")}
                        className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    )}
                  </div>
                  {avatarUrl && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-violet-200 shadow-sm shrink-0">
                        <img
                          src={avatarUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-400/40 pointer-events-none" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-medium">Circular crop preview</p>
                        <p className="text-[10px] text-slate-300 truncate">{avatarUrl}</p>
                      </div>
                    </div>
                  )}
                  {!avatarUrl && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                      <ImageIcon className="w-4 h-4 text-slate-300" />
                      <p className="text-[10px] text-slate-400">Paste an image URL to see preview</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                  <Button variant="secondary" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{formData.name || "Teacher"}</h2>
                  <p className="text-primary font-medium">{formData.specialization}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-primary icon-glow-purple" />
                    <span>{formData.email || user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-primary icon-glow-purple" />
                    <span>{formData.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-primary icon-glow-purple" />
                    <span>{formData.location}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-slate-800">
                    <Award className="w-4 h-4 text-primary" /> About
                  </h3>
                  <p className="text-sm text-muted-foreground">{formData.bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminProfile;
