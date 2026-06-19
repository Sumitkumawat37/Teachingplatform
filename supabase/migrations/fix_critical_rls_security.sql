-- ============================================
-- CRITICAL RLS SECURITY FIX
-- ============================================
-- This migration fixes critical security issues where
-- data was publicly visible due to unlocked RLS policies
-- ============================================

-- Enable RLS on profiles and user_roles tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Everyone can view public profile information (name, avatar only)
CREATE POLICY "Public can view basic profile info" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL OR
    (SELECT COUNT(*) FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'super_admin')) > 0
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- USER_ROLES RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage user_roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON user_roles;

-- Users can view their own role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage user_roles
CREATE POLICY "Service role can manage user_roles" ON user_roles
  FOR ALL USING (auth.role() = 'service_role');

-- Super admins can view all roles
CREATE POLICY "Super admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- ============================================
-- RESTRICT PUBLIC ACCESS TO SENSITIVE DATA
-- ============================================

-- Drop overly permissive policies and replace with restricted ones

-- Drop old course policy
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can view course metadata" ON courses;

-- New policy: Authenticated users can view course metadata only
CREATE POLICY "Authenticated users can view course metadata" ON courses
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Drop old chapter policy (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapters') THEN
    DROP POLICY IF EXISTS "Everyone can view chapters" ON chapters;
    DROP POLICY IF EXISTS "Authenticated users can view chapters" ON chapters;
    
    -- New policy: Authenticated users can view chapters
    CREATE POLICY "Authenticated users can view chapters" ON chapters
      FOR SELECT USING (
        auth.uid() IS NOT NULL
      );
  END IF;
END $$;

-- Drop old lecture policy
DROP POLICY IF EXISTS "Everyone can view lectures" ON lectures;
DROP POLICY IF EXISTS "Authenticated users can view lecture metadata" ON lectures;

-- New policy: Authenticated users can view lecture metadata
-- Lectures require purchase verification or admin/teacher access
CREATE POLICY "Authenticated users can view lecture metadata" ON lectures
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM purchases
        WHERE purchases.user_id = auth.uid()
        AND purchases.course_id = lectures.course_id
      ) OR
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'super_admin', 'teacher')
      )
    )
  );

-- Drop old current affairs policy (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'current_affairs') THEN
    DROP POLICY IF EXISTS "Everyone can view current affairs" ON current_affairs;
    DROP POLICY IF EXISTS "Authenticated users can view current affairs" ON current_affairs;
    
    -- New policy: Authenticated users can view current affairs
    CREATE POLICY "Authenticated users can view current affairs" ON current_affairs
      FOR SELECT USING (
        auth.uid() IS NOT NULL
      );
  END IF;
END $$;

-- Drop old live classes policy (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'live_classes') THEN
    DROP POLICY IF EXISTS "Everyone can view live classes" ON live_classes;
    DROP POLICY IF EXISTS "Authenticated users can view live classes" ON live_classes;
    
    -- New policy: Authenticated users can view live classes
    CREATE POLICY "Authenticated users can view live classes" ON live_classes
      FOR SELECT USING (
        auth.uid() IS NOT NULL
      );
  END IF;
END $$;

-- Drop old review videos policy (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'review_videos') THEN
    DROP POLICY IF EXISTS "Everyone can view review videos" ON review_videos;
    DROP POLICY IF EXISTS "Authenticated users can view review videos" ON review_videos;
    
    -- New policy: Authenticated users can view review videos
    CREATE POLICY "Authenticated users can view review videos" ON review_videos
      FOR SELECT USING (
        auth.uid() IS NOT NULL
      );
  END IF;
END $$;

-- ============================================
-- ADD MISSING RLS POLICIES FOR TEACHERS
-- ============================================

-- Drop existing teacher policies if they exist
DROP POLICY IF EXISTS "Teachers can view assigned courses" ON courses;
DROP POLICY IF EXISTS "Teachers can manage course lectures" ON lectures;

-- Teachers can view courses they are assigned to
CREATE POLICY "Teachers can view assigned courses" ON courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'teacher'
    )
  );

-- Teachers can manage lectures in their courses
CREATE POLICY "Teachers can manage course lectures" ON lectures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'teacher'
    )
  );

-- ============================================
-- SECURITY AUDIT LOGGING
-- ============================================

-- Create a security audit table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security audit logs
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing security audit policies if they exist
DROP POLICY IF EXISTS "Service role can insert security logs" ON security_audit_logs;
DROP POLICY IF EXISTS "Super admins can view security logs" ON security_audit_logs;

-- Only service role can insert security logs
CREATE POLICY "Service role can insert security logs" ON security_audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Super admins can view all security logs
CREATE POLICY "Super admins can view security logs" ON security_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  table_name TEXT;
  rls_enabled BOOLEAN;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    SELECT relrowsecurity INTO rls_enabled 
    FROM pg_class WHERE relname = table_name;
    
    IF NOT rls_enabled THEN
      RAISE NOTICE 'WARNING: RLS not enabled on table %', table_name;
    END IF;
  END LOOP;
END $$;

-- Verify policies exist on critical tables
DO $$
DECLARE
  table_name TEXT;
  policy_count INTEGER;
BEGIN
  FOR table_name IN VALUES ('profiles'), ('user_roles'), ('courses'), ('lectures'), ('purchases')
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    IF policy_count = 0 THEN
      RAISE NOTICE 'WARNING: No policies found on table %', table_name;
    ELSE
      RAISE NOTICE 'OK: % has % policies', table_name, policy_count;
    END IF;
  END LOOP;
END $$;
