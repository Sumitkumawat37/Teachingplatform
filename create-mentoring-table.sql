-- Create mentoring requests table
CREATE TABLE IF NOT EXISTS mentoring_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  attempt INTEGER,
  preparation_stage TEXT,
  optional_subject TEXT,
  preferred_language TEXT,
  mentoring_topic TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS to allow all operations
ALTER TABLE mentoring_requests DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON mentoring_requests TO authenticated;
GRANT ALL ON mentoring_requests TO service_role;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_user_id ON mentoring_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_status ON mentoring_requests(status);
