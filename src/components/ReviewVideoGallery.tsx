import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomVideoPlayer } from "./CustomVideoPlayer";

interface ReviewVideoGalleryProps {
  videos: Array<{ id: string; youtube_id: string; title: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startIndex?: number;
}

export function ReviewVideoGallery({ videos, open, onOpenChange, startIndex = 0 }: ReviewVideoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [autoNextEnabled, setAutoNextEnabled] = useState(true);

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

  const handleVideoEnded = () => {
    if (autoNextEnabled && videos.length > 1) {
      handleNext();
    }
  };

  const currentVideo = videos[currentIndex];

  if (!currentVideo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden h-[90vh]">
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

          {/* Video player */}
          <div className="flex-1 bg-black relative">
            <CustomVideoPlayer
              youtubeId={currentVideo.youtube_id}
              title={currentVideo.title}
              autoplay={true}
              onEnded={handleVideoEnded}
            />
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
