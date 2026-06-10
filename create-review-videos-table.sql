-- Create review videos table
CREATE TABLE IF NOT EXISTS review_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS to allow all operations
ALTER TABLE review_videos DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON review_videos TO authenticated;
GRANT ALL ON review_videos TO service_role;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_review_videos_created_at ON review_videos(created_at DESC);
