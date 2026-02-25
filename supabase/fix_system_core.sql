-- =============================================================================
-- SYSTEM CORE FIX: Relationships, Data Inheritance & Robust Triggers
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- =============================================================================

-- 1. Ensure foreign key naming is explicit for PostgREST relationship detection
DO $$ 
BEGIN
    -- profiles(owner_id)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_owner_id_fkey') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id);
    END IF;

    -- profiles(teacher_id)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_teacher_id_fkey') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES profiles(id);
    END IF;

    -- payments(user_id)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_user_id_fkey') THEN
        ALTER TABLE payments ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);
    END IF;

    -- settlements(user_id)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'settlements_user_id_fkey') THEN
        ALTER TABLE settlements ADD CONSTRAINT settlements_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);
    END IF;

    -- payout_requests(user_id)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payout_requests_user_id_fkey') THEN
        ALTER TABLE payout_requests ADD CONSTRAINT payout_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);
    END IF;
END $$;


-- 2. Update handle_new_user to inherit organization_name for Teachers
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
BEGIN
  -- A. Inherit Org Name if Teacher is joining an Owner
  IF (user_role = 'teacher' AND o_id IS NOT NULL AND org_name IS NULL) THEN
    SELECT organization_name INTO org_name FROM public.profiles WHERE id = o_id;
  END IF;

  -- B. Generate code for owners/teachers
  IF (user_role IN ('owner', 'teacher')) THEN
    -- Fallback for invite code generator if it doesn't exist
    BEGIN
      generated_code := public.generate_invite_code();
    EXCEPTION WHEN OTHERS THEN
      generated_code := substr(md5(random()::text), 1, 8);
    END;
  END IF;

  -- C. Create profile
  INSERT INTO public.profiles (
    id, full_name, email, role, organization_name, teacher_type, owner_id, teacher_id, org_invite_code
  )
  VALUES (
    new.id, full_name, new.email, user_role, org_name, t_type, o_id, t_id, generated_code
  );

  -- D. If role is client, auto-create a client record so teacher can see them
  IF (user_role = 'client') THEN
    INSERT INTO public.clients (user_id, name, email, commission_rate, profile_id)
    VALUES (t_id, full_name, new.email, 10, new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Retroactively fix missing Organization Names for existing Teachers
UPDATE public.profiles p
SET organization_name = o.organization_name
FROM public.profiles o
WHERE p.role = 'teacher' 
  AND p.owner_id = o.id 
  AND (p.organization_name IS NULL OR p.organization_name = '');

-- 4. Final verification of realtime for notifications (just in case)
ALTER TABLE notifications REPLICA IDENTITY FULL;
