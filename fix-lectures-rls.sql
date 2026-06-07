-- Disable RLS on lectures table to allow admin to create lectures
ALTER TABLE public.lectures DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.lectures TO authenticated;
GRANT ALL ON public.lectures TO service_role;
