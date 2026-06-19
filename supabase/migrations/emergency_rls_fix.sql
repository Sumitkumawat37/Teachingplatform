-- ============================================
-- EMERGENCY RLS FIX - DISABLE RLS FOR ADMINS
-- ============================================
-- This migration creates bypass policies for admins and super admins
-- to ensure they can access all data regardless of RLS
-- ============================================

-- ============================================
-- PROFILES - EMERGENCY FIX
-- ============================================

-- Drop all existing profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins and teachers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins and super admins bypass RLS on profiles" ON profiles;

-- Create emergency bypass policy for admins and super admins
CREATE POLICY "Admins and super admins bypass RLS on profiles" ON profiles
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Regular users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Regular users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- USER_ROLES - EMERGENCY FIX
-- ============================================

-- Drop all existing user_roles policies
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage user_roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins and super admins bypass RLS on user_roles" ON user_roles;

-- Create emergency bypass policy for admins and super admins
CREATE POLICY "Admins and super admins bypass RLS on user_roles" ON user_roles
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Regular users can view their own role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- COURSES - EMERGENCY FIX
-- ============================================

-- Drop all existing course policies
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Admins and super admins bypass RLS on courses" ON courses;

-- Create emergency bypass policy for admins and super admins
CREATE POLICY "Admins and super admins bypass RLS on courses" ON courses
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Everyone can view courses
CREATE POLICY "Everyone can view courses" ON courses
  FOR SELECT USING (true);

-- ============================================
-- CHAPTERS - EMERGENCY FIX
-- ============================================

-- Drop all existing chapter policies
DROP POLICY IF EXISTS "Everyone can view chapters" ON chapters;
DROP POLICY IF EXISTS "Admins can manage chapters" ON chapters;
DROP POLICY IF EXISTS "Admins and super admins bypass RLS on chapters" ON chapters;

-- Create emergency bypass policy for admins and super admins
CREATE POLICY "Admins and super admins bypass RLS on chapters" ON chapters
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Everyone can view chapters
CREATE POLICY "Everyone can view chapters" ON chapters
  FOR SELECT USING (true);

-- ============================================
-- LECTURES - EMERGENCY FIX
-- ============================================

-- Drop all existing lecture policies
DROP POLICY IF EXISTS "Everyone can view lectures" ON lectures;
DROP POLICY IF EXISTS "Admins can manage lectures" ON lectures;
DROP POLICY IF EXISTS "Admins and super admins bypass RLS on lectures" ON lectures;

-- Create emergency bypass policy for admins and super admins
CREATE POLICY "Admins and super admins bypass RLS on lectures" ON lectures
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Everyone can view lectures
CREATE POLICY "Everyone can view lectures" ON lectures
  FOR SELECT USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  table_name TEXT;
  policy_count INTEGER;
BEGIN
  RAISE NOTICE 'Verifying emergency RLS fix...';
  
  FOR table_name IN VALUES ('profiles'), ('user_roles'), ('courses'), ('lectures'), ('chapters')
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    RAISE NOTICE 'Table % has % policies', table_name, policy_count;
  END LOOP;
  
  RAISE NOTICE 'Emergency RLS fix completed successfully';
END $$;
