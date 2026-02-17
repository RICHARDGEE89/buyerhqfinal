-- BuyerHQ Admin Seeding Script
-- Instructions: Run this in the Supabase SQL Editor to create the requested admin accounts.

-- 1. Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Insert into auth.users (Supabase Auth System)
-- Note: 'Snitzle2026!' ishashed using bcrypt (salt 10)
DO $$
DECLARE
  richard_id UUID := uuid_generate_v4();
  cam_id UUID := uuid_generate_v4();
BEGIN
  -- Insert Richard
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES (
    richard_id,
    'RichardGoodwin@live.com',
    crypt('Snitzle2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Richard","last_name":"Goodwin"}',
    now(),
    now(),
    'authenticated',
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING;

  -- Insert Cam
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES (
    cam_id,
    'Cam.Dirtymack@gmail.com',
    crypt('Snitzle2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Cam","last_name":"Dirtymack"}',
    now(),
    now(),
    'authenticated',
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING;

  -- 3. Sync to public.users table with 'admin' role
  -- Richard
  INSERT INTO public.users (id, role, first_name, last_name, email)
  SELECT id, 'admin', 'Richard', 'Goodwin', email
  FROM auth.users
  WHERE email = 'RichardGoodwin@live.com'
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  -- Cam
  INSERT INTO public.users (id, role, first_name, last_name, email)
  SELECT id, 'admin', 'Cam', 'Dirtymack', email
  FROM auth.users
  WHERE email = 'Cam.Dirtymack@gmail.com'
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

END $$;
