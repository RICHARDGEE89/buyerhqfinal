-- BuyerHQ Production Schema
-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users Table (Extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('buyer', 'agent', 'admin')) DEFAULT 'buyer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agents Table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  abn TEXT,
  licence_number TEXT,
  licence_verified BOOLEAN DEFAULT false,
  bio TEXT,
  headshot_url TEXT,
  video_intro_url TEXT,
  years_experience INTEGER DEFAULT 0,
  primary_suburb TEXT,
  primary_state TEXT,
  location_point GEOGRAPHY(POINT),
  specialisations TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  subscription_status TEXT CHECK (subscription_status IN ('inactive', 'active', 'past_due')) DEFAULT 'inactive',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agent Case Studies
CREATE TABLE public.agent_case_studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  suburb TEXT NOT NULL,
  property_type TEXT,
  saving_amount TEXT,
  days_to_purchase INTEGER,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enquiries
CREATE TABLE public.enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('new', 'read', 'replied', 'archived')) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Saved Agents (Shortlist)
CREATE TABLE public.saved_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(buyer_id, agent_id)
);

-- Match Quiz Results
CREATE TABLE public.match_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL,
  top_matches UUID[] NOT NULL, -- Array of agent IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_agents ENABLE ROW LEVEL SECURITY;

-- Public read access for agents
CREATE POLICY "Public agents are viewable by everyone" ON public.agents FOR SELECT USING (true);

-- Users can only view/edit their own data
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Enquiries: Agent can see leads for them, Buyer can see enquiries they sent
CREATE POLICY "Agents can view their leads" ON public.enquiries FOR SELECT USING (auth.uid() = agent_id);
CREATE POLICY "Buyers can view their enquiries" ON public.enquiries FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can insert enquiries" ON public.enquiries FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Saved Agents
CREATE POLICY "Buyers can manage their saved agents" ON public.saved_agents 
FOR ALL USING (auth.uid() = buyer_id);

-- Admin Override (Conceptual, usually handled via role check or service role)
-- CREATE POLICY "Admins can do everything" ON public.agents FOR ALL USING (
--   EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
-- );
