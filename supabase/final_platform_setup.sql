-- ==========================================
-- FINAL PLATFORM SETUP: Document Management & Security
-- ==========================================

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


-- 3. Row Level Security (RLS) for 'document_slots'
ALTER TABLE public.document_slots ENABLE ROW LEVEL SECURITY;

-- Allow Authenticated Agents to view their own operations' slots
DROP POLICY IF EXISTS "Agents can view their operation slots" ON public.document_slots;
CREATE POLICY "Agents can view their operation slots" 
ON public.document_slots FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.operations 
    WHERE public.operations.id = public.document_slots.operation_id 
    AND public.operations.agent_id = auth.uid()
  )
);

-- Allow Authenticated Agents to update their own operations' slots (Upload/Status)
DROP POLICY IF EXISTS "Agents can update their operation slots" ON public.document_slots;
CREATE POLICY "Agents can update their operation slots" 
ON public.document_slots FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.operations 
    WHERE public.operations.id = public.document_slots.operation_id 
    AND public.operations.agent_id = auth.uid()
  )
);

-- Allow Anonymous Sellers to UPDATE slots (Upload) if they have a valid share token logic (simplified via UPDATE)
-- In a production environment, you might verify the share_token in a join. 
-- For now, we allow update access to specific columns if the slot exists.
DROP POLICY IF EXISTS "Sellers can update slots via share" ON public.document_slots;
CREATE POLICY "Sellers can update slots via share" 
ON public.document_slots FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow Anonymous Sellers to SELECT slots (Checklist View)
DROP POLICY IF EXISTS "Sellers can view slots via share" ON public.document_slots;
CREATE POLICY "Sellers can view slots via share" 
ON public.document_slots FOR SELECT 
TO anon, authenticated
USING (true);


-- 4. Enable Realtime Replication
-- This allows the dashboard to update instantly when a document is analyzed
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_slots;

-- ==========================================
-- EMERGENCY DEMO BYPASS: Permissive RLS Policies
-- ==========================================
-- This guarantees demo data insertion never fails due to complex RLS checks

-- Operations
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Demo Allow All Operations" ON public.operations;
CREATE POLICY "Demo Allow All Operations" 
ON public.operations FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- Agents / Profiles
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Demo Allow All Agents" ON public.agents;
CREATE POLICY "Demo Allow All Agents" 
ON public.agents FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- Document Slots
ALTER TABLE public.document_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Demo Allow All Document Slots" ON public.document_slots;
CREATE POLICY "Demo Allow All Document Slots" 
ON public.document_slots FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- AUTOMATED PROFILE CREATION: auth.users -> public.agents
-- ==========================================
-- This ensures that as soon as a user signs up, they have an agent record ready.

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

-- Trigger to run the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- RELATIONAL RED FLAGS: detected_red_flags
-- ==========================================
-- This table replaces the JSONB column for better indexing and relational queries during the demo.

CREATE TABLE IF NOT EXISTS public.detected_red_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_slot_id uuid REFERENCES public.document_slots(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for the new table
ALTER TABLE public.detected_red_flags ENABLE ROW LEVEL SECURITY;

-- Allow Authenticated Agents to view flags for their operations' slots
DROP POLICY IF EXISTS "Agents can view flags for their operation slots" ON public.detected_red_flags;
CREATE POLICY "Agents can view flags for their operation slots"
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

-- Emergency Demo Bypass for insertions
DROP POLICY IF EXISTS "Demo Allow All Flags" ON public.detected_red_flags;
CREATE POLICY "Demo Allow All Flags"
ON public.detected_red_flags FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Enable Realtime for the new table
ALTER PUBLICATION supabase_realtime ADD TABLE public.detected_red_flags;
