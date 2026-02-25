-- =============================================================================
-- SYSTEM GRAND REPAIR V6
-- This script solidifies all foreign keys to enable PostgREST joins.
-- =============================================================================

DO $$ 
BEGIN
    -- 1. CLEAN UP AMBIGUOUS / CONFLICTING CONSTRAINTS
    ALTER TABLE IF EXISTS public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
    ALTER TABLE IF EXISTS public.payments DROP CONSTRAINT IF EXISTS payments_client_id_fkey;
    ALTER TABLE IF EXISTS public.settlements DROP CONSTRAINT IF EXISTS settlements_user_id_fkey;
    ALTER TABLE IF EXISTS public.payout_requests DROP CONSTRAINT IF EXISTS payout_requests_user_id_fkey;
    ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_owner_id_fkey;
    ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_teacher_id_fkey;
    ALTER TABLE IF EXISTS public.clients DROP CONSTRAINT IF EXISTS clients_user_id_fkey;
    ALTER TABLE IF EXISTS public.clients DROP CONSTRAINT IF EXISTS clients_profile_id_fkey;

    -- 2. ENSURE COLUMNS & BASIC CONSTRAINTS EXIST
    ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id);
    ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id);
    ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
    
    -- Ensure unique student per teacher roster
    ALTER TABLE IF EXISTS public.clients DROP CONSTRAINT IF EXISTS clients_email_user_id_key;
    ALTER TABLE public.clients ADD CONSTRAINT clients_email_user_id_key UNIQUE (email, user_id);

    -- 3. CREATE EXPLICIT NAMED FOREIGN KEYS (HINTS FOR POSTGREST)
    
    -- profiles(owner_id) -> profiles(id)
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);

    -- profiles(teacher_id) -> profiles(id)
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id);

    -- clients(user_id) -> profiles(id) [Teacher Roster Link]
    ALTER TABLE public.clients 
    ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

    -- clients(profile_id) -> profiles(id) [Student Account Link]
    ALTER TABLE public.clients 
    ADD CONSTRAINT clients_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id);

    -- payments(user_id) -> profiles(id) [Teacher Payment View]
    ALTER TABLE public.payments 
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

    -- payments(client_id) -> clients(id) [Student Payment Link]
    ALTER TABLE public.payments
    ADD CONSTRAINT payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);

    -- settlements(user_id) -> profiles(id)
    ALTER TABLE public.settlements 
    ADD CONSTRAINT settlements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

    -- payout_requests(user_id) -> profiles(id)
    ALTER TABLE public.payout_requests 
    ADD CONSTRAINT payout_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

END $$;

-- 4. RECREATE TRIGGER FUNCTION WITH ROBUST INHERITANCE & LINKING
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  generated_code TEXT := NULL;
  user_role TEXT := COALESCE(new.raw_user_meta_data->>'role', 'teacher');
  full_name TEXT := new.raw_user_meta_data->>'full_name';
  org_name  TEXT := new.raw_user_meta_data->>'organization_name';
  t_type    TEXT := new.raw_user_meta_data->>'teacher_type';
  o_id      UUID := (new.raw_user_meta_data->>'owner_id')::uuid;
  t_id      UUID := (new.raw_user_meta_data->>'teacher_id')::uuid;
  c_id_link UUID := (new.raw_user_meta_data->>'client_id')::uuid;
BEGIN
  -- A. Inherit Org Name
  IF (user_role = 'teacher' AND o_id IS NOT NULL AND org_name IS NULL) THEN
    SELECT organization_name INTO org_name FROM public.profiles WHERE id = o_id;
  ELSIF (user_role = 'client' AND t_id IS NOT NULL AND org_name IS NULL) THEN
    SELECT organization_name INTO org_name FROM public.profiles WHERE id = t_id;
  END IF;

  -- B. Generate Invite Code (Uppercase)
  IF (user_role IN ('owner', 'teacher')) THEN
    generated_code := UPPER(substr(md5(random()::text), 1, 8));
  END IF;

  -- C. Create profile
  INSERT INTO public.profiles (
    id, full_name, email, role, organization_name, teacher_type, owner_id, teacher_id, org_invite_code
  )
  VALUES (
    new.id, full_name, new.email, user_role, org_name, t_type, o_id, t_id, generated_code
  );

  -- D. Robust Student Linking
  IF (user_role = 'client') THEN
    IF (c_id_link IS NOT NULL) THEN
      UPDATE public.clients SET profile_id = new.id, name = full_name WHERE id = c_id_link;
    ELSIF (t_id IS NOT NULL) THEN
      IF EXISTS (SELECT 1 FROM public.clients WHERE email = new.email AND user_id = t_id) THEN
        UPDATE public.clients SET profile_id = new.id, name = full_name WHERE email = new.email AND user_id = t_id;
      ELSE
        INSERT INTO public.clients (user_id, name, email, commission_rate, profile_id, status, default_fee)
        VALUES (t_id, full_name, new.email, 10, new.id, 'active', 0);
      END IF;
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ENSURE TRIGGER IS ACTIVE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Database schema consolidated. Relationships are now explicit.' as status;
