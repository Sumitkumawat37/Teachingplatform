-- Create videos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow public read access to videos
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');