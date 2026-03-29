-- ==========================================
-- FINAL PLATFORM SETUP: Schema & Security
-- ==========================================

-- 0. Core Tables
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  agencia text,
  es_ampi boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.operations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  share_token text UNIQUE NOT NULL,
  seller_name text NOT NULL,
  seller_type text CHECK (seller_type IN ('fisica', 'moral')),
  seller_phone text,
  seller_email text,
  property_type text CHECK (property_type IN ('casa', 'departamento', 'terreno')),
  property_use text CHECK (property_use IN ('habitacional', 'comercial')),
  property_street text,
  property_number text,
  property_colony text,
  property_municipality text,
  property_zip text,
  property_state text,
  is_condominium boolean DEFAULT false,
  has_construction_extension boolean DEFAULT false,
  succession_type text CHECK (succession_type IN ('ninguna', 'testamentaria', 'intestamentaria')),
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_slots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_id uuid REFERENCES public.operations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  is_required boolean DEFAULT true,
  condition_trigger text,
  person_type_trigger text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'validated', 'rejected', 'flagged', 'analyzed')),
  file_name text,
  storage_path text,
  analysis_status text DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'analyzed', 'error')),
  uploaded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 1. Create the 'documentos' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for 'documentos' bucket
-- Allow Authenticated Agents to upload files
DROP POLICY IF EXISTS "Agents can upload documents" ON storage.objects;
CREATE POLICY "Agents can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- Allow Authenticated Agents to view/download files
DROP POLICY IF EXISTS "Agents can view documents" ON storage.objects;
CREATE POLICY "Agents can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos');

-- Allow Anonymous Sellers to upload files (Required for Seller Portal)
DROP POLICY IF EXISTS "Sellers can upload documents anonymously" ON storage.objects;
CREATE POLICY "Sellers can upload documents anonymously"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'documentos');

-- 3. Row Level Security (RLS)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_slots ENABLE ROW LEVEL SECURITY;

-- Agents can manage their own profile
DROP POLICY IF EXISTS "Agents can manage own profile" ON public.agents;
CREATE POLICY "Agents can manage own profile"
ON public.agents FOR ALL
TO authenticated
USING (auth.uid() = id);

-- Operations Security
DROP POLICY IF EXISTS "Agents can manage own operations" ON public.operations;
CREATE POLICY "Agents can manage own operations"
ON public.operations FOR ALL
TO authenticated
USING (agent_id = auth.uid());

-- Document Slots Security
DROP POLICY IF EXISTS "Agents can manage own slots" ON public.document_slots;
CREATE POLICY "Agents can manage own slots"
ON public.document_slots FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.operations 
    WHERE public.operations.id = public.document_slots.operation_id 
    AND public.operations.agent_id = auth.uid()
  )
);

-- Seller Access via Share Token (Simplified for demo)
DROP POLICY IF EXISTS "Sellers can view slots via share" ON public.document_slots;
CREATE POLICY "Sellers can view slots via share" 
ON public.document_slots FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Sellers can update slots via share" ON public.document_slots;
CREATE POLICY "Sellers can update slots via share" 
ON public.document_slots FOR UPDATE 
TO anon, authenticated
USING (true);

-- 4. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.operations;

-- ==========================================
-- AUTOMATED PROFILE CREATION
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.agents (id, email, nombre)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- RELATIONAL RED FLAGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.detected_red_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_slot_id uuid REFERENCES public.document_slots(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.detected_red_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agents can view flags" ON public.detected_red_flags;
CREATE POLICY "Agents can view flags"
ON public.detected_red_flags FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.document_slots 
    JOIN public.operations ON public.operations.id = public.document_slots.operation_id
    WHERE public.document_slots.id = public.detected_red_flags.document_slot_id
    AND public.operations.agent_id = auth.uid()
  )
);

-- Demo Bypass
DROP POLICY IF EXISTS "Demo Allow All Flags" ON public.detected_red_flags;
CREATE POLICY "Demo Allow All Flags"
ON public.detected_red_flags FOR ALL
TO authenticated, anon
USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.detected_red_flags;
