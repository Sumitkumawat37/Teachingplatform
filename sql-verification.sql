-- ============================================
-- SUPABASE AUTHENTICATION VERIFICATION SCRIPTS
-- Run these in Supabase SQL Editor to verify your setup
-- ============================================

-- 1. CHECK AUTH.USERS TABLE
-- Verify Google OAuth users are being created
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data,
  raw_app_meta_data,
  email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. CHECK IDENTITIES (OAuth providers)
-- Verify Google identity is linked to users
SELECT 
  user_id,
  provider,
  provider_id,
  identity_data,
  created_at
FROM auth.identities 
WHERE provider = 'google'
ORDER BY created_at DESC;

-- 3. CHECK PROFILES TABLE
-- Verify profiles are being created for OAuth users
SELECT 
  user_id,
  name,
  email,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. CHECK USER_ROLES TABLE
-- Verify roles are being assigned
SELECT 
  user_id,
  role,
  created_at
FROM public.user_roles 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. CHECK FOR ORPHANED RECORDS
-- Find users without profiles
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 6. CHECK FOR ORPHANED ROLES
-- Find roles without corresponding users
SELECT 
  r.user_id,
  r.role,
  r.created_at
FROM public.user_roles r
LEFT JOIN auth.users u ON r.user_id = u.id
WHERE u.id IS NULL;

-- 7. VERIFY TRIGGERS
-- Check if handle_new_user trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'handle_new_user'
  OR trigger_name LIKE '%auth%';

-- 8. CHECK RLS POLICIES
-- Verify RLS policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 9. CHECK RLS POLICIES ON USER_ROLES
-- Verify RLS policies on user_roles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_roles';

-- 10. VERIFY FOREIGN KEY CONSTRAINTS
-- Check foreign key constraints on profiles
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('profiles', 'user_roles')
  AND tc.constraint_type = 'FOREIGN KEY';

-- 11. CHECK TABLE SCHEMAS
-- Verify profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 12. CHECK USER_ROLES TABLE STRUCTURE
-- Verify user_roles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_roles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 13. TEST PROFILE UPSERT (replace with actual user_id)
-- Test if upsert works for profiles
-- INSERT INTO public.profiles (user_id, name, email, avatar_url)
-- VALUES ('test-user-id', 'Test User', 'test@example.com', null)
-- ON CONFLICT (user_id) DO UPDATE SET
--   name = EXCLUDED.name,
--   email = EXCLUDED.email,
--   avatar_url = EXCLUDED.avatar_url;

-- 14. TEST ROLE UPSERT (replace with actual user_id)
-- Test if upsert works for user_roles
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('test-user-id', 'student')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- 15. CHECK RECENT AUTH EVENTS
-- View recent authentication attempts
-- This requires enabling auth logs in Supabase
-- Check Dashboard > Logs > Auth logs
