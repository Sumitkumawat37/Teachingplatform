
-- Add thumbnail_url column to lectures for video thumbnails
ALTER TABLE public.lectures ADD COLUMN IF NOT EXISTS thumbnail_url text;
