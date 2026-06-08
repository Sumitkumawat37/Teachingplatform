-- Add Nadiya Khan and Shivam Saxena as teachers

-- First, create user accounts for the teachers if they don't exist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('nadiya-khan-id', 'nadiya.khan@teachingplatform.com', crypt('password123', gen_salt('bf')), NOW(), '{"name": "Nadiya Khan"}', NOW(), NOW()),
  ('shivam-saxena-id', 'shivam.saxena@teachingplatform.com', crypt('password123', gen_salt('bf')), NOW(), '{"name": "Shivam Saxena"}', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert into public.profiles table
INSERT INTO public.profiles (user_id, name, avatar_url, subject, bio, created_at, updated_at)
VALUES 
  ('nadiya-khan-id', 'Nadiya Khan', NULL, 'Polity & Law', 'NET qualified Faculty and criminal lawyer with expertise in UPSC preparation', NOW(), NOW()),
  ('shivam-saxena-id', 'Shivam Saxena', '/shivam-saxena.png', 'General Studies', '2-times UPSC CSE mains qualified with extensive teaching experience', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  subject = EXCLUDED.subject,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Assign teacher role to these users
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES 
  ('nadiya-khan-id', 'teacher', NOW()),
  ('shivam-saxena-id', 'teacher', NOW())
ON CONFLICT (user_id, role) DO NOTHING;
