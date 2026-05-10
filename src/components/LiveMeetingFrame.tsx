import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, AlertTriangle, ExternalLink, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LiveMeetingFrameProps {
  url: string;
  title: string;
}

// Providers that block iframe embedding (X-Frame-Options / CSP)
const BLOCKED_HOSTS = ["meet.google.com", "zoom.us", "zoom.com", "teams.microsoft.com", "teams.live.com", "webex.com"];

function detectBlocked(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const match = BLOCKED_HOSTS.find((h) => host === h || host.endsWith("." + h) || host.includes(h));
    return match || null;
  } catch {
    return null;
  }
}

// Detect YouTube live/video URLs and return an embeddable URL
function toYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const ytParams = "autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1&playsinline=1&cc_load_policy=0";
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?${ytParams}`;
    }
    if (host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}?${ytParams}`;
      const m = u.pathname.match(/\/(?:live|embed|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?${ytParams}`;
      const channelLive = u.pathname.match(/\/channel\/([^/]+)\/live/);
      if (channelLive) return `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelLive[1]}&${ytParams}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function LiveMeetingFrame({ url, title }: LiveMeetingFrameProps) {
  const youtubeEmbed = useMemo(() => toYoutubeEmbed(url), [url]);
  const effectiveUrl = youtubeEmbed || url;
  const blockedHost = useMemo(() => (youtubeEmbed ? null : detectBlocked(url)), [url, youtubeEmbed]);
  const [loading, setLoading] = useState(!blockedHost);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const openedRef = useRef(false);

  // Auto-open known blocked providers in a new tab once
  useEffect(() => {
    if (blockedHost && !openedRef.current) {
      openedRef.current = true;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, [blockedHost, url]);

  useEffect(() => {
    if (blockedHost) return;
    setLoading(true);
    setError(false);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setLoading(false);
      setError(true);
    }, 10000);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [url, attempt, blockedHost]);

  const handleLoad = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setLoading(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Meeting link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  // Show external-only UI for known blocked providers (no useless iframe attempt)
  if (blockedHost) {
    return (
      <div className="w-full h-full bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ExternalLink className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Opened in a new tab</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            <span className="font-medium">{blockedHost}</span> doesn't allow embedding inside other apps.
            We launched the meeting in a new tab — switch to it to join.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button size="sm" onClick={() => window.open(url, "_blank", "noopener,noreferrer")}>
            <ExternalLink className="w-3.5 h-3.5 mr-1" /> Reopen meeting
          </Button>
          <Button size="sm" variant="secondary" onClick={copyLink}>
            {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground/80 max-w-xs">
          Tip: For a true in-app experience, schedule with a Jitsi link like
          <span className="font-mono"> meet.jit.si/your-room</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      {!error && (
        <iframe
          key={attempt}
          src={effectiveUrl}
          className="w-full h-full border-0"
          allow={youtubeEmbed ? "autoplay; encrypted-media; fullscreen; picture-in-picture" : "camera; microphone; fullscreen; display-capture; autoplay"}
          title={title}
          onLoad={handleLoad}
        />
      )}

      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Connecting to live class…</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold">Couldn't load the meeting</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              The provider may block embedding. Retry or open it externally.
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="secondary" onClick={() => setAttempt((a) => a + 1)}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
            </Button>
            <Button size="sm" onClick={() => window.open(url, "_blank", "noopener,noreferrer")}>
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open externally
            </Button>
            <Button size="sm" variant="outline" onClick={copyLink}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
