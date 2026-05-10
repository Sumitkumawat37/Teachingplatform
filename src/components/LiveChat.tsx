import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface LiveChatMessage {
  id: string;
  live_class_id: string;
  user_id: string;
  sender_name: string;
  is_teacher: boolean;
  message: string;
  created_at: string;
}

interface LiveChatProps {
  liveClassId: string;
  isTeacher?: boolean;
}

export function LiveChat({ liveClassId, isTeacher = false }: LiveChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load + realtime subscription
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const load = async () => {
      const { data } = await supabase
        .from("live_chat")
        .select("*")
        .eq("live_class_id", liveClassId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as LiveChatMessage[]);
    };
    load();

    channel = supabase
      .channel(`live_chat_${liveClassId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat", filter: `live_class_id=eq.${liveClassId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as LiveChatMessage]),
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "live_chat", filter: `live_class_id=eq.${liveClassId}` },
        (payload) => setMessages((prev) => prev.filter((m) => m.id !== (payload.old as any).id)),
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [liveClassId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !user || sending) return;
    setSending(true);
    const { error } = await supabase.from("live_chat").insert({
      live_class_id: liveClassId,
      user_id: user.id,
      sender_name: user.name,
      is_teacher: isTeacher,
      message: text.trim(),
    });
    setSending(false);
    if (error) {
      toast.error("Couldn't send message");
      return;
    }
    setText("");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("live_chat").delete().eq("id", id);
    if (error) toast.error("Couldn't delete");
  };

  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-3 py-2 border-b flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Live Chat</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{messages.length} messages</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs text-center text-muted-foreground py-6">
            No messages yet. {isTeacher ? "Students' questions will appear here." : "Be the first to ask!"}
          </p>
        ) : (
          messages.map((m) => {
            const mine = user?.id === m.user_id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`group max-w-[85%] rounded-2xl px-3 py-1.5 text-sm ${
                    m.is_teacher
                      ? "bg-primary text-primary-foreground"
                      : mine
                        ? "bg-accent"
                        : "bg-muted"
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-semibold opacity-80">
                      {m.sender_name}{m.is_teacher && " · Teacher"}
                    </span>
                    <span className="text-[9px] opacity-60">{formatTime(m.created_at)}</span>
                    {isTeacher && (
                      <button
                        onClick={() => remove(m.id)}
                        className="ml-1 opacity-0 group-hover:opacity-70 hover:opacity-100 transition"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="leading-snug break-words">{m.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-2 border-t flex gap-2">
        <Input
          placeholder={isTeacher ? "Reply to students…" : "Ask a question…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          disabled={!user}
        />
        <Button size="sm" onClick={send} disabled={!text.trim() || sending || !user}>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
