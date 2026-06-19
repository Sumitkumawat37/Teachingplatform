import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { fetchPlaylistVideosCached, preloadThumbnail, generateEmbedUrl, generateThumbnailUrl, type PlaylistVideo } from "@/lib/youtube/playlist-fetcher";

interface SuccessStoriesCarouselProps {
  playlistId?: string;
  videoIds?: string[];
}

export function SuccessStoriesCarousel({ playlistId, videoIds }: SuccessStoriesCarouselProps) {
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controls = useAnimation();
  
  // Fetch playlist videos
  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // If videoIds are provided, use them directly
        if (videoIds && videoIds.length > 0) {
          const manualVideos: PlaylistVideo[] = videoIds.map(id => ({
            id,
            title: `Video ${id}`,
            thumbnail: generateThumbnailUrl(id, 'hqdefault'),
            embedUrl: generateEmbedUrl(id),
            shortsThumbnail: generateThumbnailUrl(id, 'maxresdefault'),
          }));
          setVideos(manualVideos);
          // Preload first few thumbnails
          manualVideos.slice(0, 3).forEach((video, i) => {
            setTimeout(() => preloadThumbnail(video.thumbnail), i * 200);
          });
        } else {
          // Otherwise fetch from playlist
          const fetchedVideos = await fetchPlaylistVideosCached(playlistId);
          if (fetchedVideos.length > 0) {
            setVideos(fetchedVideos);
            // Preload first few thumbnails
            fetchedVideos.slice(0, 3).forEach((video, i) => {
              setTimeout(() => preloadThumbnail(video.thumbnail), i * 200);
            });
          } else {
            setError("No videos found");
          }
        }
      } catch (err) {
        console.error('Error loading videos:', err);
        setError("Failed to load videos");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVideos();
  }, [playlistId, videoIds]);

  // Preload adjacent videos when index changes
  useEffect(() => {
    if (videos.length === 0) return;
    
    const preloadAdjacent = () => {
      const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
      const nextIndex = (currentIndex + 1) % videos.length;
      
      preloadThumbnail(videos[prevIndex].thumbnail);
      preloadThumbnail(videos[nextIndex].thumbnail);
    };
    
    preloadAdjacent();
  }, [currentIndex, videos]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    controls.start("next");
  }, [videos.length, controls]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    controls.start("prev");
  }, [videos.length, controls]);

  const handleCardClick = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  // Swipe gesture handlers
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      goToPrevious();
    } else if (info.offset.x < -100) {
      goToNext();
    }
  }, [goToPrevious, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, goToPrevious, goToNext]);

  if (isLoading) {
    return (
      <div className="w-full py-12">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return null; // Don't render anything if there's an error or no videos
  }

  return (
    <div className="w-full py-12 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          🔥 Aspirant - loved courses
        </h2>
        <p className="text-slate-600 text-sm">Watch our students share their journey</p>
      </div>

      {/* Carousel */}
      <div className="relative max-w-4xl mx-auto">
        {/* Desktop Navigation Buttons */}
        <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10">
          <button
            onClick={goToPrevious}
            className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-violet-600" />
          </button>
        </div>
        
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10">
          <button
            onClick={goToNext}
            className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-violet-600" />
          </button>
        </div>

        {/* Cards Container */}
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
          <AnimatePresence mode="popLayout">
            {videos.map((video, index) => {
              const isActive = index === currentIndex;
              const isPrev = index === (currentIndex - 1 + videos.length) % videos.length;
              const isNext = index === (currentIndex + 1) % videos.length;
              
              if (!isActive && !isPrev && !isNext) return null;

              return (
                <motion.div
                  key={video.id}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8, x: 100 }}
                  animate={{
                    opacity: isActive ? 1 : isPrev || isNext ? 0.5 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    x: isActive ? 0 : isPrev ? -120 : isNext ? 120 : 0,
                    zIndex: isActive ? 10 : isPrev || isNext ? 5 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8, x: -100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  onClick={() => isActive && handleCardClick(index)}
                >
                  <motion.div
                    className="relative w-[280px] h-[500px] md:w-[320px] md:h-[568px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl"
                    whileHover={{ scale: isActive ? 1.02 : 1 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: isActive 
                        ? "0 25px 50px -12px rgba(139, 92, 246, 0.25)" 
                        : "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {/* Glassmorphism overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                    
                    {/* Thumbnail */}
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <motion.div
                        className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Play className="w-8 h-8 text-violet-600 ml-1" />
                      </motion.div>
                    </div>
                    
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Mobile Navigation Indicators */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-violet-600 w-6' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black/95 backdrop-blur-xl border-0">
          <div className="relative w-full aspect-video">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            
            <iframe
              src={videos[currentIndex].embedUrl + "&autoplay=1"}
              title={videos[currentIndex].title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          <div className="p-6 bg-gradient-to-t from-black/50 to-transparent">
            <h3 className="text-white font-semibold text-xl mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {videos[currentIndex].title}
            </h3>
            <p className="text-white/70 text-sm">
              Video {currentIndex + 1} of {videos.length}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
