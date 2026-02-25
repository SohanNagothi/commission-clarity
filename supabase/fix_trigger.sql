-- =============================================================================
-- FIX: Robust handle_new_user trigger function
-- Run this in Supabase SQL Editor to fix the syntax error and enable student auto-linking
-- =============================================================================

-- Function to handle new user creation
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
  -- 1. Generate code for owners/teachers
  IF (user_role IN ('owner', 'teacher')) THEN
    generated_code := public.generate_invite_code();
  END IF;

  -- 2. Create profile
  INSERT INTO public.profiles (
    id, full_name, email, role, organization_name, teacher_type, owner_id, teacher_id, org_invite_code
  )
  VALUES (
    new.id, full_name, new.email, user_role, org_name, t_type, o_id, t_id, generated_code
  );

  -- 3. If role is client, auto-create a client record so teacher can see them
  IF (user_role = 'client') THEN
    INSERT INTO public.clients (user_id, name, email, commission_rate, profile_id)
    VALUES (t_id, full_name, new.email, 10, new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
