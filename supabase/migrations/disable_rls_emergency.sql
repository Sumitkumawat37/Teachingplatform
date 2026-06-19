-- ============================================
-- EMERGENCY: DISABLE RLS ON PROBLEMATIC TABLES
-- ============================================
-- This migration disables RLS entirely on profiles and user_roles
-- to restore basic functionality while we debug the policy issues
-- ============================================

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_roles table  
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
DO $$
DECLARE
  table_name TEXT;
  rls_enabled BOOLEAN;
BEGIN
  RAISE NOTICE 'Checking RLS status...';
  
  FOR table_name IN VALUES ('profiles'), ('user_roles')
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_name;
    
    RAISE NOTICE 'Table % RLS enabled: %', table_name, rls_enabled;
  END LOOP;
  
  RAISE NOTICE 'Emergency RLS disable completed';
END $$;
