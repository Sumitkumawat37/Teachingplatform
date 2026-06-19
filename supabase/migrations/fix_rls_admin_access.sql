-- ============================================
-- FIX RLS POLICIES FOR ADMIN/TEACHER ACCESS
-- ============================================
-- This migration fixes overly restrictive RLS policies
-- that are blocking admin and teacher access to data
-- ============================================

-- Drop overly restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view course metadata" ON courses;
DROP POLICY IF EXISTS "Authenticated users can view chapters" ON chapters;
DROP POLICY IF EXISTS "Authenticated users can view lecture metadata" ON lectures;
DROP POLICY IF EXISTS "Teachers can view assigned courses" ON courses;
DROP POLICY IF EXISTS "Teachers can manage course lectures" ON lectures;

-- ============================================
-- COURSES RLS POLICIES (FIXED)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;

-- Everyone can view published courses (for public access)
CREATE POLICY "Everyone can view courses" ON courses
  FOR SELECT USING (true);

-- Only admins can insert/update/delete courses
CREATE POLICY "Admins can manage courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- CHAPTERS RLS POLICIES (FIXED)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view chapters" ON chapters;
DROP POLICY IF EXISTS "Admins can manage chapters" ON chapters;

-- Everyone can view chapters
CREATE POLICY "Everyone can view chapters" ON chapters
  FOR SELECT USING (true);

-- Only admins can manage chapters
CREATE POLICY "Admins can manage chapters" ON chapters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- LECTURES RLS POLICIES (FIXED)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view lectures" ON lectures;
DROP POLICY IF EXISTS "Admins can manage lectures" ON lectures;

-- Everyone can view lectures
CREATE POLICY "Everyone can view lectures" ON lectures
  FOR SELECT USING (true);

-- Only admins can manage lectures
CREATE POLICY "Admins can manage lectures" ON lectures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- PROFILES RLS POLICIES (FIXED)
-- ============================================

-- Drop overly restrictive profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins and teachers can view all profiles" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins and teachers can view all profiles
CREATE POLICY "Admins and teachers can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin', 'teacher')
    )
  );

-- ============================================
-- USER_ROLES RLS POLICIES (FIXED)
-- ============================================

-- Drop overly restrictive user_roles policies
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage user_roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Users can view their own role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage user_roles
CREATE POLICY "Service role can manage user_roles" ON user_roles
  FOR ALL USING (auth.role() = 'service_role');

-- Admins and super admins can view all roles
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify policies are working correctly
DO $$
DECLARE
  table_name TEXT;
  policy_count INTEGER;
BEGIN
  RAISE NOTICE 'Verifying RLS policies...';
  
  FOR table_name IN VALUES ('profiles'), ('user_roles'), ('courses'), ('lectures'), ('chapters')
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    RAISE NOTICE 'Table % has % policies', table_name, policy_count;
  END LOOP;
  
  RAISE NOTICE 'RLS policy fix completed successfully';
END $$;
