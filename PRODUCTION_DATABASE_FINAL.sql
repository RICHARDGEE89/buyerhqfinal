-- ============================================
-- BUYERHQ.COM.AU - PRODUCTION DATABASE SETUP
-- FINAL VERSION - MATCHES VERCEL SCHEMA
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- 1. SYNC EXISTING ADMIN ACCOUNTS TO PUBLIC.USERS
INSERT INTO public.users (id, email, first_name, last_name, role, created_at, updated_at)
VALUES 
  ('c14f5887-a991-47c9-be08-13723f3761d2', 'richardgoodwin@live.com', 'Richard', 'Goodwin', 'admin', '2026-02-17 14:11:32.300662+00', now()),
  ('d7373384-ba33-40c4-be71-ed24081b8c74', 'cam.dirtymack@gmail.com', 'Cam', 'Dirtymack', 'admin', '2026-02-17 14:12:18.641068+00', now())
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = now();

-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES (if any)
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Public agents are viewable by everyone" ON public.agents;
DROP POLICY IF EXISTS "Agents can manage their profile" ON public.agents;
DROP POLICY IF EXISTS "Admins can manage all agents" ON public.agents;
DROP POLICY IF EXISTS "Agents can view their leads" ON public.enquiries;
DROP POLICY IF EXISTS "Buyers can view their enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Buyers can insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Anyone can insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Buyers can manage their saved agents" ON public.saved_agents;

-- 4. CREATE RLS POLICIES

-- Users policies
CREATE POLICY "Users can view own data" ON public.users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage all users" ON public.users 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Agents policies
CREATE POLICY "Public agents are viewable by everyone" ON public.agents 
  FOR SELECT USING (true);

CREATE POLICY "Agents can manage their profile" ON public.agents 
  FOR ALL USING (
    id IN (SELECT id FROM public.users WHERE id = auth.uid() AND role = 'agent')
  );

CREATE POLICY "Admins can manage all agents" ON public.agents 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Enquiries policies
CREATE POLICY "Agents can view their leads" ON public.enquiries 
  FOR SELECT USING (agent_id IN (SELECT id FROM public.agents WHERE id = auth.uid()));

CREATE POLICY "Buyers can view their enquiries" ON public.enquiries 
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Anyone can insert enquiries" ON public.enquiries 
  FOR INSERT WITH CHECK (true);

-- Saved agents policies
CREATE POLICY "Buyers can manage their saved agents" ON public.saved_agents 
  FOR ALL USING (auth.uid() = buyer_id);

-- 5. CREATE AUTO-SYNC TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. VERIFY SETUP
SELECT 
  '✅ PRODUCTION DATABASE READY!' as status,
  (SELECT COUNT(*) FROM public.users WHERE role = 'admin') as admin_count,
  (SELECT COUNT(*) FROM public.agents) as agent_count,
  (SELECT COUNT(*) FROM public.enquiries) as enquiry_count;

-- 7. SHOW ADMIN ACCOUNTS
SELECT id, email, first_name, last_name, role, created_at
FROM public.users 
WHERE role = 'admin'
ORDER BY created_at;
