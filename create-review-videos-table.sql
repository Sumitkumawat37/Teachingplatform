-- Create review videos table for courses
CREATE TABLE IF NOT EXISTS course_review_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  title TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS to allow all operations
ALTER TABLE course_review_videos DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON course_review_videos TO authenticated;
GRANT ALL ON course_review_videos TO service_role;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_course_review_videos_course_id ON course_review_videos(course_id);
