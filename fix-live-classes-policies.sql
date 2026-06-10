-- Drop existing policies on live_classes table
DROP POLICY IF EXISTS "Anyone can view live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admins can manage live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admins can update live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admins can delete live classes" ON public.live_classes;

-- Drop existing policies on attendance table
DROP POLICY IF EXISTS "Users can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can mark attendance" ON public.attendance;

-- Drop existing policies on live_chat table
DROP POLICY IF EXISTS "Users can view chat for class" ON public.live_chat;
DROP POLICY IF EXISTS "Users can send chat messages" ON public.live_chat;
DROP POLICY IF EXISTS "Admins can delete chat messages" ON public.live_chat;

-- Recreate policies for live_classes with correct syntax
CREATE POLICY "Anyone can view live classes" ON public.live_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage live classes" ON public.live_classes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update live classes" ON public.live_classes FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete live classes" ON public.live_classes FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Recreate policies for attendance with correct syntax
CREATE POLICY "Users can view own attendance" ON public.attendance FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all attendance" ON public.attendance FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can mark attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Recreate policies for live_chat with correct syntax
CREATE POLICY "Users can view chat for class" ON public.live_chat FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can send chat messages" ON public.live_chat FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can delete chat messages" ON public.live_chat FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
