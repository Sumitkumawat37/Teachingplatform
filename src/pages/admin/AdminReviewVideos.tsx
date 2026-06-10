import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video, Trash2, Plus, Youtube } from "lucide-react";
import { toast } from "sonner";

interface ReviewVideo {
  id: string;
  title: string;
  youtube_id: string;
  description?: string;
  created_at: string;
}

const AdminReviewVideos = () => {
  const [videos, setVideos] = useState<ReviewVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    youtubeUrl: "",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const qc = useQueryClient();

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("review_videos" as any)
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setVideos((data as any) || []);
    } catch (err) {
      console.error("Error fetching review videos:", err);
      toast.error("Failed to load review videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const extractYoutubeId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.youtubeUrl) {
      return toast.error("Title and YouTube URL are required");
    }

    setSubmitting(true);
    try {
      const youtube_id = extractYoutubeId(formData.youtubeUrl);
      
      const { error } = await supabase
        .from("review_videos" as any)
        .insert({
          title: formData.title,
          youtube_id,
          description: formData.description
        });

      if (error) throw error;

      toast.success("Review video added successfully!");
      setFormData({ title: "", youtubeUrl: "", description: "" });
      fetchVideos();
    } catch (err: any) {
      console.error("Error adding review video:", err);
      toast.error(err.message || "Failed to add review video");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await supabase.from("review_videos" as any).delete().eq("id", id);
      toast.success("Video deleted successfully");
      fetchVideos();
    } catch (err) {
      console.error("Error deleting video:", err);
      toast.error("Failed to delete video");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-xl font-bold text-slate-800">Review Videos</h2>

      <Card className="p-4 bg-card border border-border shadow-sm space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Add New Review Video
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Video Title *</Label>
            <Input
              placeholder="Enter video title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="text-slate-800"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">YouTube URL *</Label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              className="text-slate-800"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="Brief description of the video"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="text-slate-800"
            />
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={submitting}
          >
            <Youtube className="w-4 h-4 mr-2" />
            {submitting ? "Adding..." : "Add Video"}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-slate-700">Existing Videos</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No review videos found</p>
        ) : (
          videos.map((video) => (
            <Card key={video.id} className="p-4 bg-card border border-border shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <Youtube className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{video.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">ID: {video.youtube_id}</p>
                  {video.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{video.description}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive shrink-0"
                  onClick={() => handleDelete(video.id)}
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

export default AdminReviewVideos;
