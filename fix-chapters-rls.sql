-- Disable RLS on chapters table to allow admin to create chapters
ALTER TABLE public.chapters DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.chapters TO authenticated;
GRANT ALL ON public.chapters TO service_role;
