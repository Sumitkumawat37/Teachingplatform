-- Complete fix for live classes RLS policies
-- This script fixes the "operator does not exist: text = app_role" error

-- Step 1: Add 'teacher' to app_role enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'teacher' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'teacher';
  END IF;
END $$;

-- Step 2: Drop existing policies on live_classes table
DROP POLICY IF EXISTS "Anyone can view live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admins can manage live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admins can update live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admins can delete live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admins and teachers can manage live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admins and teachers can update live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admins and teachers can delete live classes" ON public.live_classes;

-- Step 3: Drop existing policies on attendance table
DROP POLICY IF EXISTS "Users can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can mark attendance" ON public.attendance;

-- Step 4: Drop existing policies on live_chat table
DROP POLICY IF EXISTS "Users can view chat for class" ON public.live_chat;
DROP POLICY IF EXISTS "Users can send chat messages" ON public.live_chat;
DROP POLICY IF EXISTS "Admins can delete chat messages" ON public.live_chat;

-- Step 5: Recreate policies for live_classes with correct syntax (allow admins and teachers)
CREATE POLICY "Anyone can view live classes" ON public.live_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and teachers can manage live classes" ON public.live_classes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'teacher'))
);
CREATE POLICY "Admins and teachers can update live classes" ON public.live_classes FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'teacher'))
);
CREATE POLICY "Admins and teachers can delete live classes" ON public.live_classes FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'teacher'))
);

-- Step 6: Recreate policies for attendance with correct syntax
CREATE POLICY "Users can view own attendance" ON public.attendance FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all attendance" ON public.attendance FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin')
);
CREATE POLICY "Users can mark attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Step 7: Recreate policies for live_chat with correct syntax
CREATE POLICY "Users can view chat for class" ON public.live_chat FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can send chat messages" ON public.live_chat FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can delete chat messages" ON public.live_chat FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin')
);

-- Step 8: Ensure live_classes table exists with proper structure
CREATE TABLE IF NOT EXISTS public.live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  meeting_link TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration TEXT DEFAULT '60 min',
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 9: Enable RLS on live_classes if not already enabled
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- Step 10: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_live_classes_course ON public.live_classes(course_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON public.live_classes(status);
CREATE INDEX IF NOT EXISTS idx_live_classes_scheduled ON public.live_classes(scheduled_at);
