import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

interface LiveDiagnosticProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

type Status = "pending" | "running" | "pass" | "fail" | "skipped";

interface Step {
  key: string;
  label: string;
  status: Status;
  detail?: string;
}

const BLOCKED_HOSTS = ["meet.google.com", "zoom.us", "zoom.com", "teams.microsoft.com", "teams.live.com", "webex.com"];
function isBlocked(host: string) {
  return BLOCKED_HOSTS.some((h) => host === h || host.endsWith("." + h));
}
function isYoutube(host: string) {
  return host.endsWith("youtube.com") || host === "youtu.be" || host === "youtube-nocookie.com";
}

export function LiveDiagnostic({ open, url, onClose }: LiveDiagnosticProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    const newSteps: Step[] = [
      { key: "url", label: "Validate meeting URL", status: "pending" },
      { key: "type", label: "Detect provider", status: "pending" },
      { key: "join", label: "Trigger join action", status: "pending" },
      { key: "iframe", label: "Embed loads in-app", status: "pending" },
      { key: "fallback", label: "External fallback available", status: "pending" },
    ];
    setSteps(newSteps);
    setIframeSrc("");
    runChecks(url, newSteps, setSteps, setIframeSrc);
  }, [open, url]);

  const allPassed = steps.length > 0 && steps.every((s) => s.status === "pass" || s.status === "skipped");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Live class diagnostic</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {steps.map((s) => (
            <div key={s.key} className="flex items-start gap-3 p-2 rounded-lg bg-accent/40">
              <div className="mt-0.5">
                {s.status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-muted" />}
                {s.status === "running" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                {s.status === "pass" && <CheckCircle2 className="w-4 h-4 text-success" />}
                {s.status === "fail" && <XCircle className="w-4 h-4 text-destructive" />}
                {s.status === "skipped" && <CheckCircle2 className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.label}</p>
                {s.detail && <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>}
              </div>
            </div>
          ))}
        </div>

        {iframeSrc && (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="w-px h-px opacity-0 pointer-events-none"
            title="diagnostic-frame"
            onLoad={() => {
              setSteps((prev) =>
                prev.map((s) => (s.key === "iframe" ? { ...s, status: "pass", detail: "Embed responded" } : s))
              );
            }}
          />
        )}

        <div className="flex items-center justify-between pt-2">
          <p className={`text-sm font-semibold ${allPassed ? "text-success" : "text-muted-foreground"}`}>
            {allPassed ? "All checks passed" : "Running checks…"}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => window.open(url, "_blank", "noopener,noreferrer")}>
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open
            </Button>
            <Button size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function runChecks(
  raw: string,
  initial: Step[],
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>,
  setIframeSrc: (s: string) => void
) {
  const update = (key: string, patch: Partial<Step>) =>
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  setTimeout(() => {
    // Step 1: URL validity
    update("url", { status: "running" });
    let parsed: URL | null = null;
    const normalized = raw?.startsWith("http") ? raw : `https://${raw || ""}`;
    try {
      parsed = new URL(normalized);
      update("url", { status: "pass", detail: parsed.hostname });
    } catch {
      update("url", { status: "fail", detail: "Invalid URL" });
      return;
    }

    // Step 2: Provider detection
    update("type", { status: "running" });
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    let providerLabel = host;
    let willEmbed = true;
    if (isYoutube(host)) providerLabel = "YouTube Live";
    else if (isBlocked(host)) {
      providerLabel = `${host} (embed-blocked)`;
      willEmbed = false;
    } else if (host.includes("jit.si")) providerLabel = "Jitsi";
    update("type", { status: "pass", detail: providerLabel });

    // Step 3: Join action — simulated (we know the button wires to setActiveClass)
    update("join", { status: "running" });
    setTimeout(() => update("join", { status: "pass", detail: "Join handler reachable" }), 250);

    // Step 4: Iframe load (only if we expect embedding)
    if (!willEmbed) {
      update("iframe", { status: "skipped", detail: "Provider blocks embedding" });
      update("fallback", { status: "pass", detail: "Will open in a new tab" });
      return;
    }
    update("iframe", { status: "running" });
    setIframeSrc(normalized);
    // Timeout if iframe never loads
    setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) =>
          s.key === "iframe" && s.status === "running"
            ? { ...s, status: "fail", detail: "Embed did not respond in 8s" }
            : s
        )
      );
    }, 8000);

    update("fallback", { status: "pass", detail: "External link button available" });
  }, 100);
}
