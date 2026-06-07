import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewVideoGalleryProps {
  videos: Array<{ id: string; youtube_id: string; title: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startIndex?: number;
}

export function ReviewVideoGallery({ videos, open, onOpenChange, startIndex = 0 }: ReviewVideoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    if (open) {
      setCurrentIndex(startIndex);
    }
  }, [open, startIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const currentVideo = videos[currentIndex];

  if (!currentVideo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden h-[60vh]">
        <div className="relative h-full flex flex-col">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Video player - Vertical/Reel mode */}
          <div className="flex-1 bg-black relative">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?autoplay=1&rel=0&modestbranding=1&showinfo=0&playsinline=1&controls=1&iv_load_policy=3&disablekb=0&fs=0&cc_load_policy=0&hl=en&widget_referrer=${encodeURIComponent(window.location.href)}&nologo=1&origin=${encodeURIComponent(window.location.origin)}`}
              title={currentVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="object-cover"
            />
            {/* Custom overlay to hide YouTube logo */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/95 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            {/* Hide YouTube button in bottom right */}
            <div className="absolute bottom-0 right-0 w-32 h-16 bg-black pointer-events-none" />
            {/* Hide caption at top header */}
            <div className="absolute top-12 left-0 right-0 h-8 bg-black pointer-events-none" />
          </div>

          {/* Navigation buttons */}
          {videos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handleNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Video info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
            <p className="text-white font-semibold text-xs">{currentVideo.title}</p>
            <p className="text-white/70 text-[10px]">
              {currentIndex + 1} / {videos.length}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
