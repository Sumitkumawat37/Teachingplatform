-- In-app chat messages for live classes
CREATE TABLE public.live_chat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  live_class_id UUID NOT NULL,
  user_id UUID NOT NULL,
  sender_name TEXT NOT NULL DEFAULT '',
  is_teacher BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_live_chat_class ON public.live_chat(live_class_id, created_at);

ALTER TABLE public.live_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view live chat"
ON public.live_chat FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can post own chat messages"
ON public.live_chat FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete chat messages"
ON public.live_chat FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat;
ALTER TABLE public.live_chat REPLICA IDENTITY FULL;