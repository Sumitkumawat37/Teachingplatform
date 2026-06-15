import { useState, useEffect } from "react";
import { Play, Star, Clock, Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ReviewVideoGallery } from "@/components/ReviewVideoGallery";

const ReviewVideosPage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from("review_videos" as any)
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setVideos(data || []);
      } catch (err) {
        console.error("Error fetching review videos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleWatchVideo = (index: number) => {
    setStartIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-5 border border-violet-100/40" style={{ background: 'linear-gradient(135deg, #F3EEFF 0%, #FFEAF4 100%)' }}>
        <div className="relative z-10">
          <h1 className="text-lg font-semibold text-slate-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Student Demos & Testimonials
          </h1>
          <p className="text-slate-500 text-xs">Watch demo videos from our UPSC aspirants</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 shadow-sm border border-violet-100/40 text-center" style={{ background: '#F3EEFF' }}>
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center mx-auto mb-2">
            <Star className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-lg font-bold text-slate-800">4.9</p>
          <p className="text-[10px] text-slate-500 font-medium">Rating</p>
        </div>
        <div className="rounded-2xl p-4 shadow-sm border border-pink-100/40 text-center" style={{ background: '#FFEAF4' }}>
          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4 text-pink-600" />
          </div>
          <p className="text-lg font-bold text-slate-800">500+</p>
          <p className="text-[10px] text-slate-500 font-medium">Reviews</p>
        </div>
        <div className="rounded-2xl p-4 shadow-sm border border-emerald-100/40 text-center" style={{ background: '#ECFFF3' }}>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-slate-800">50+</p>
          <p className="text-[10px] text-slate-500 font-medium">Videos</p>
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-2xl p-8 text-center shadow-sm border border-slate-100/60" style={{ background: '#F7F7FA' }}>
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
            <Play className="w-6 h-6 text-violet-600" />
          </div>
          <p className="text-slate-500 text-sm font-medium">No review videos yet</p>
          <p className="text-slate-400 text-xs mt-1">Check back later for student testimonials</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 cursor-pointer"
              onClick={() => handleWatchVideo(index)}
            >
              <div className="relative aspect-[9/16] bg-slate-900">
                <img
                  src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-violet-600 ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-slate-800 mb-1 line-clamp-2">{video.title}</h3>
                {video.description && (
                  <p className="text-slate-400 text-xs line-clamp-2">{video.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Gallery Dialog */}
      <ReviewVideoGallery
        videos={videos}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        startIndex={startIndex}
      />
    </div>
  );
};

export default ReviewVideosPage;
