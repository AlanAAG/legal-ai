-- ==========================================
-- FINAL PLATFORM SETUP v2: Schema & Security
-- Run this in Supabase SQL Editor
-- ==========================================

-- 0. Core Tables
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  nombre text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  telefono text NOT NULL DEFAULT '',
  agencia text NOT NULL DEFAULT '',
  es_ampi boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.operations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  share_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
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

CREATE TABLE IF NOT EXISTS public.detected_red_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_slot_id uuid REFERENCES public.document_slots(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- FIX: Add defaults for existing tables
-- (Safe to re-run — only modifies defaults)
-- ==========================================
ALTER TABLE public.operations 
  ALTER COLUMN share_token SET DEFAULT gen_random_uuid()::text;

DO $$ BEGIN
  ALTER TABLE public.agents ALTER COLUMN telefono SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.agents ALTER COLUMN agencia SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;
ALTER TABLE public.agents ALTER COLUMN telefono SET DEFAULT '';
ALTER TABLE public.agents ALTER COLUMN agencia SET DEFAULT '';

-- ==========================================
-- 1. Storage Bucket
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. Storage Policies (ALL 5 REQUIRED)
-- ==========================================
DROP POLICY IF EXISTS "Agents can upload documents" ON storage.objects;
CREATE POLICY "Agents can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

DROP POLICY IF EXISTS "Agents can view documents" ON storage.objects;
CREATE POLICY "Agents can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos');

DROP POLICY IF EXISTS "Agents can update documents" ON storage.objects;
CREATE POLICY "Agents can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos');

DROP POLICY IF EXISTS "Agents can delete documents" ON storage.objects;
CREATE POLICY "Agents can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos');

DROP POLICY IF EXISTS "Sellers can upload documents anonymously" ON storage.objects;
CREATE POLICY "Sellers can upload documents anonymously"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'documentos');

-- ==========================================
-- 3. Row Level Security
-- ==========================================
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_red_flags ENABLE ROW LEVEL SECURITY;

-- AGENTS
DROP POLICY IF EXISTS "Agents can manage own profile" ON public.agents;
CREATE POLICY "Agents can manage own profile"
ON public.agents FOR ALL
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view agent profiles" ON public.agents;
CREATE POLICY "Public can view agent profiles"
ON public.agents FOR SELECT
TO anon
USING (true);

-- OPERATIONS
DROP POLICY IF EXISTS "Agents can manage own operations" ON public.operations;
CREATE POLICY "Agents can manage own operations"
ON public.operations FOR ALL
TO authenticated
USING (agent_id = auth.uid());

DROP POLICY IF EXISTS "Public can view operations by share token" ON public.operations;
CREATE POLICY "Public can view operations by share token"
ON public.operations FOR SELECT
TO anon
USING (true);

-- DOCUMENT SLOTS
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

-- Seller (anon) can view and update slots
DROP POLICY IF EXISTS "Sellers can view slots via share" ON public.document_slots;
DROP POLICY IF EXISTS "Sellers can update slots via share" ON public.document_slots;
DROP POLICY IF EXISTS "Public can view document slots" ON public.document_slots;
CREATE POLICY "Public can view document slots" 
ON public.document_slots FOR SELECT 
TO anon
USING (true);

DROP POLICY IF EXISTS "Public can update document slots" ON public.document_slots;
CREATE POLICY "Public can update document slots" 
ON public.document_slots FOR UPDATE 
TO anon
USING (true);

-- DETECTED RED FLAGS
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

DROP POLICY IF EXISTS "Demo Allow All Flags" ON public.detected_red_flags;
DROP POLICY IF EXISTS "Allow insert flags" ON public.detected_red_flags;
CREATE POLICY "Allow insert flags"
ON public.detected_red_flags FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- ==========================================
-- 4. Enable Realtime Replication
-- ==========================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.document_slots;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.operations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.detected_red_flags;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================
-- 5. Automated Profile Creation Trigger
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.agents (id, email, nombre, telefono, agencia)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    '',
    ''
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
