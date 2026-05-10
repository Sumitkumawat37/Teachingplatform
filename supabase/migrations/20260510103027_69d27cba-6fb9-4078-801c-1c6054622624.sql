ALTER PUBLICATION supabase_realtime ADD TABLE public.doubts;
ALTER TABLE public.doubts REPLICA IDENTITY FULL;