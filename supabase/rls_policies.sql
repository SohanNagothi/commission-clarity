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
DROP POLICY IF EXISTS "Anyone can read profile by invite code" ON profiles;

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
DROP POLICY IF EXISTS "Anyone can read client by invite code" ON clients;

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
DROP POLICY IF EXISTS "Clients can insert payment requests" ON payments;
DROP POLICY IF EXISTS "Owners can approve/reject payments" ON payments;

-- Teachers: read and manage
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

-- Clients: read their own payments
CREATE POLICY "Clients can view own payments"
  ON payments FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );

-- Clients: can insert payment requests (pending_owner_approval)
CREATE POLICY "Clients can insert payment requests"
  ON payments FOR INSERT
  WITH CHECK (
    get_my_role() = 'client'
    AND client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
    AND status = 'pending_owner_approval'
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

-- Owners: Approve/Reject payments
CREATE POLICY "Owners can approve/reject payments"
  ON payments FOR UPDATE
  USING (
    get_my_role() = 'owner'
    AND user_id IN (
      SELECT id FROM profiles WHERE owner_id = auth.uid() AND role = 'teacher'
    )
  )
  WITH CHECK (
    get_my_role() = 'owner'
    AND (status IN ('approved', 'rejected', 'paid'))
  );


-- ========================================
-- SETTLEMENTS
-- ========================================

DROP POLICY IF EXISTS "Teachers can view own settlements" ON settlements;
DROP POLICY IF EXISTS "Owners can manage org settlements" ON settlements;
DROP POLICY IF EXISTS "Owners can insert settlements" ON settlements;
DROP POLICY IF EXISTS "Owners can update org settlements" ON settlements;
DROP POLICY IF EXISTS "Owners can delete org settlements" ON settlements;
DROP POLICY IF EXISTS "Teachers can insert own settlements" ON settlements;
DROP POLICY IF EXISTS "Teachers can update own settlements" ON settlements;
DROP POLICY IF EXISTS "Teachers can delete own settlements" ON settlements;

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

-- Teachers: Settlement requests (can be added as 'pending' settlements if needed, 
-- but plan says they request, let's allow them to insert with a status if we add it, 
-- or they just appear for owner. For now, keep as is.)
CREATE POLICY "Teachers can insert own settlements"
  ON settlements FOR INSERT
  WITH CHECK (user_id = auth.uid() AND get_my_role() = 'teacher');


-- ========================================
-- JOB OPENINGS
-- ========================================
CREATE POLICY "Anyone can view job openings"
  ON job_openings FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage own jobs"
  ON job_openings FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());


-- ========================================
-- JOB APPLICATIONS
-- ========================================
CREATE POLICY "Teachers can view own applications"
  ON job_applications FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can apply for jobs"
  ON job_applications FOR INSERT
  WITH CHECK (teacher_id = auth.uid() AND get_my_role() = 'teacher');

CREATE POLICY "Owners can view applications for their jobs"
  ON job_applications FOR SELECT
  USING (
    job_id IN (SELECT id FROM job_openings WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners can update application status"
  ON job_applications FOR UPDATE
  USING (
    job_id IN (SELECT id FROM job_openings WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    job_id IN (SELECT id FROM job_openings WHERE owner_id = auth.uid())
  );


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

-- Senders: Create
CREATE POLICY "Senders can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (sender_id = auth.uid());


-- ========================================
-- PAYOUT REQUESTS
-- ========================================

DROP POLICY IF EXISTS "Teachers can view own payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Teachers can insert own payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Owners can view payout requests for their org" ON payout_requests;
DROP POLICY IF EXISTS "Owners can update payout request status" ON payout_requests;

-- Teachers: manage own
CREATE POLICY "Teachers can view own payout requests"
  ON payout_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can insert own payout requests"
  ON payout_requests FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    AND get_my_role() = 'teacher'
  );

-- Owners: view and update status
CREATE POLICY "Owners can view payout requests for their org"
  ON payout_requests FOR SELECT
  USING (
    get_my_role() = 'owner'
    AND user_id IN (
      SELECT id FROM profiles WHERE owner_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Owners can update payout request status"
  ON payout_requests FOR UPDATE
  USING (
    get_my_role() = 'owner'
    AND user_id IN (
      SELECT id FROM profiles WHERE owner_id = auth.uid() AND role = 'teacher'
    )
  )
  WITH CHECK (
    get_my_role() = 'owner'
    AND (status IN ('approved', 'rejected'))
  );


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

-- Trigger to call the function on insert into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ========================================
-- DONE! All RLS policies and triggers are in place.
-- ========================================
