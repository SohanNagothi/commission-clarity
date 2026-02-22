-- =============================================================================
-- FEEZY ROW LEVEL SECURITY POLICIES
-- Run this AFTER migration.sql in Supabase SQL Editor
-- =============================================================================

-- ========================================
-- Helper function: get current user's role
-- ========================================
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user's owner_id
CREATE OR REPLACE FUNCTION get_my_owner_id()
RETURNS UUID AS $$
  SELECT owner_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ========================================
-- PROFILES
-- ========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Owners can view org teachers" ON profiles;
DROP POLICY IF EXISTS "Allow insert during signup" ON profiles;

-- Everyone can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Owners can view teachers in their org
CREATE POLICY "Owners can view org teachers"
  ON profiles FOR SELECT
  USING (
    get_my_role() = 'owner'
    AND role = 'teacher'
    AND owner_id = auth.uid()
  );

-- Users can update their own profile (but NOT role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow profile creation during signup
CREATE POLICY "Allow insert during signup"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Allow anyone to read a profile by org_invite_code (for registration linking)
DROP POLICY IF EXISTS "Anyone can read profile by invite code" ON profiles;
CREATE POLICY "Anyone can read profile by invite code"
  ON profiles FOR SELECT
  USING (org_invite_code IS NOT NULL);


-- ========================================
-- CLIENTS
-- ========================================

DROP POLICY IF EXISTS "Teachers can manage own clients" ON clients;
DROP POLICY IF EXISTS "Teachers can insert clients" ON clients;
DROP POLICY IF EXISTS "Teachers can update own clients" ON clients;
DROP POLICY IF EXISTS "Teachers can delete own clients" ON clients;
DROP POLICY IF EXISTS "Clients can view own record" ON clients;
DROP POLICY IF EXISTS "Owners can view org clients" ON clients;

-- Teachers: full CRUD on own clients
CREATE POLICY "Teachers can manage own clients"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can insert clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can update own clients"
  ON clients FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can delete own clients"
  ON clients FOR DELETE
  USING (user_id = auth.uid());

-- Clients: can view their own linked record
CREATE POLICY "Clients can view own record"
  ON clients FOR SELECT
  USING (profile_id = auth.uid());

-- Owners: can view all clients of their org's teachers
CREATE POLICY "Owners can view org clients"
  ON clients FOR SELECT
  USING (
    get_my_role() = 'owner'
    AND user_id IN (
      SELECT id FROM profiles WHERE owner_id = auth.uid() AND role = 'teacher'
    )
  );

-- Allow anyone to read a client record by invite_code (for registration linking)
DROP POLICY IF EXISTS "Anyone can read client by invite code" ON clients;
CREATE POLICY "Anyone can read client by invite code"
  ON clients FOR SELECT
  USING (invite_code IS NOT NULL);


-- ========================================
-- PAYMENTS
-- ========================================

DROP POLICY IF EXISTS "Teachers can view own payments" ON payments;
DROP POLICY IF EXISTS "Teachers can insert payments" ON payments;
DROP POLICY IF EXISTS "Teachers can update own payments" ON payments;
DROP POLICY IF EXISTS "Teachers can delete own payments" ON payments;
DROP POLICY IF EXISTS "Clients can view own payments" ON payments;
DROP POLICY IF EXISTS "Owners can view org payments" ON payments;

-- Teachers: full CRUD
CREATE POLICY "Teachers can view own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can insert payments"
  ON payments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can update own payments"
  ON payments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can delete own payments"
  ON payments FOR DELETE
  USING (user_id = auth.uid());

-- Clients: read their own payments (via client_id linked to their profile)
CREATE POLICY "Clients can view own payments"
  ON payments FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );

-- Owners: read all payments of org teachers
CREATE POLICY "Owners can view org payments"
  ON payments FOR SELECT
  USING (
    get_my_role() = 'owner'
    AND user_id IN (
      SELECT id FROM profiles WHERE owner_id = auth.uid() AND role = 'teacher'
    )
  );


-- ========================================
-- SETTLEMENTS
-- ========================================

DROP POLICY IF EXISTS "Teachers can view own settlements" ON settlements;
DROP POLICY IF EXISTS "Owners can manage org settlements" ON settlements;
DROP POLICY IF EXISTS "Owners can insert settlements" ON settlements;
DROP POLICY IF EXISTS "Owners can update org settlements" ON settlements;
DROP POLICY IF EXISTS "Owners can delete org settlements" ON settlements;

-- Teachers: read own settlements
CREATE POLICY "Teachers can view own settlements"
  ON settlements FOR SELECT
  USING (user_id = auth.uid());

-- Owners: full CRUD on settlements for their org's teachers
CREATE POLICY "Owners can manage org settlements"
  ON settlements FOR SELECT
  USING (
    get_my_role() = 'owner'
    AND user_id IN (
      SELECT id FROM profiles WHERE owner_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Owners can insert settlements"
  ON settlements FOR INSERT
  WITH CHECK (
    get_my_role() = 'owner'
    AND user_id IN (
      SELECT id FROM profiles WHERE owner_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Owners can update org settlements"
  ON settlements FOR UPDATE
  USING (
    get_my_role() = 'owner'
    AND user_id IN (
      SELECT id FROM profiles WHERE owner_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Owners can delete org settlements"
  ON settlements FOR DELETE
  USING (
    get_my_role() = 'owner'
    AND user_id IN (
      SELECT id FROM profiles WHERE owner_id = auth.uid() AND role = 'teacher'
    )
  );

-- Teachers can also insert their own settlements (existing behavior)
CREATE POLICY "Teachers can insert own settlements"
  ON settlements FOR INSERT
  WITH CHECK (user_id = auth.uid() AND get_my_role() = 'teacher');

CREATE POLICY "Teachers can update own settlements"
  ON settlements FOR UPDATE
  USING (user_id = auth.uid() AND get_my_role() = 'teacher');

CREATE POLICY "Teachers can delete own settlements"
  ON settlements FOR DELETE
  USING (user_id = auth.uid() AND get_my_role() = 'teacher');


-- ========================================
-- NOTIFICATIONS
-- ========================================

DROP POLICY IF EXISTS "Recipients can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Recipients can mark as read" ON notifications;
DROP POLICY IF EXISTS "Senders can create notifications" ON notifications;

-- Recipients: read own notifications
CREATE POLICY "Recipients can view own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

-- Recipients: update own notifications (mark as read)
CREATE POLICY "Recipients can mark as read"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Anyone can create notifications (teachers for fee reminders, owners for settlement reminders)
CREATE POLICY "Senders can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (sender_id = auth.uid());


-- ========================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ========================================

-- Helper to generate random code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  generated_code TEXT := NULL;
BEGIN
  -- Generate code ONLY for owners and teachers
  IF (new.raw_user_meta_data->>'role' IN ('owner', 'teacher')) THEN
    generated_code := public.generate_invite_code();
  END IF;

  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    role, 
    owner_id, 
    teacher_id,
    org_invite_code
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'teacher'),
    (new.raw_user_meta_data->>'owner_id')::uuid,
    (new.raw_user_meta_data->>'teacher_id')::uuid,
    generated_code
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on insert into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ========================================
-- DONE! All RLS policies and triggers are in place.
-- ========================================
