-- Sync existing admin accounts to public.users table
-- Run this in Supabase SQL Editor

-- First, ensure the users table exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('buyer', 'agent', 'admin')) DEFAULT 'buyer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Insert Richard's account
INSERT INTO public.users (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
  'c14f5887-a991-47c9-be08-13723f3761d2',
  'richardgoodwin@live.com',
  'Richard',
  'Goodwin',
  'admin',
  '2026-02-17 14:11:32.300662+00',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  first_name = 'Richard',
  last_name = 'Goodwin',
  updated_at = now();

-- Insert Cam's account
INSERT INTO public.users (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
  'd7373384-ba33-40c4-be71-ed24081b8c74',
  'cam.dirtymack@gmail.com',
  'Cam',
  'Dirtymack',
  'admin',
  '2026-02-17 14:12:18.641068+00',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  first_name = 'Cam',
  last_name = 'Dirtymack',
  updated_at = now();

-- Add RLS policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own data') THEN
    CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own data') THEN
    CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can view all users') THEN
    CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- Verify the accounts were created
SELECT id, email, first_name, last_name, role, created_at 
FROM public.users 
WHERE role = 'admin'
ORDER BY created_at;
