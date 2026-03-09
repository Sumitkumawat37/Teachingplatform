
-- Create storage bucket for course thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

-- Allow anyone to view thumbnails
CREATE POLICY "Anyone can view thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');

-- Allow admins to upload thumbnails
CREATE POLICY "Admins can upload thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'thumbnails' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete thumbnails
CREATE POLICY "Admins can delete thumbnails" ON storage.objects FOR DELETE USING (bucket_id = 'thumbnails' AND public.has_role(auth.uid(), 'admin'));

-- Also add unique constraint on lecture_progress for upsert
CREATE UNIQUE INDEX IF NOT EXISTS lecture_progress_user_lecture_unique ON public.lecture_progress (user_id, lecture_id);
