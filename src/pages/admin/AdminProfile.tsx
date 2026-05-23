import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Mail, Phone, MapPin, Award, Edit, Save, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Shivam Sir",
    email: "shivam@upscbynadia.com",
    phone: "+91 98765 43210",
    location: "New Delhi, India",
    bio: "UPSC Expert & Course Instructor with over 10 years of experience in guiding students towards success in the Civil Services Examination.",
    specialization: "Polity, GS-2, Current Affairs",
  });
  const [imagePreview, setImagePreview] = useState("/shivam-sir.jpg");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    // In a real implementation, you would save the profile data to Supabase
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: "Shivam Sir",
      email: "shivam@upscbynadia.com",
      phone: "+91 98765 43210",
      location: "New Delhi, India",
      bio: "UPSC Expert & Course Instructor with over 10 years of experience in guiding students towards success in the Civil Services Examination.",
      specialization: "Polity, GS-2, Current Affairs",
    });
    setImagePreview("/shivam-sir.jpg");
    setImageFile(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
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
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
              </div>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Upload className="w-5 h-5" />
                  </label>
                </div>
              )}
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
                  <h2 className="text-2xl font-bold text-foreground">{formData.name}</h2>
                  <p className="text-primary font-medium">{formData.specialization}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-primary icon-glow-purple" />
                    <span>{formData.email}</span>
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
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
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
