-- =============================================================================
-- FEEZY MULTI-ROLE MIGRATION (FRESH START)
-- This script will EMPTY ALL TABLES and then apply the new schema.
-- 
-- Run this entire script in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- ========================================
-- 0. EMPTY ALL TABLES
-- ========================================
TRUNCATE TABLE settlements, payments, clients, profiles CASCADE;


-- ========================================
-- 1. Role enum constraint on profiles
-- ========================================
-- Normalize and set default
UPDATE profiles SET role = 'teacher' WHERE role IS NULL OR role = '';

ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'teacher';
ALTER TABLE profiles ALTER COLUMN role SET NOT NULL;

-- Add check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('teacher', 'owner', 'client'));


-- ========================================
-- 2. Owner-teacher linking
-- ========================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles(id);


-- ========================================
-- 3. Org invite code for owners/teachers
-- ========================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS org_invite_code TEXT UNIQUE;


-- ========================================
-- 4. Client-profile linking
-- ========================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id);


-- ========================================
-- 5. Client invite code
-- ========================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;


-- ========================================
-- 6. Payment status (paid/pending)
-- ========================================
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'paid';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_opening_balance BOOLEAN DEFAULT FALSE;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check
  CHECK (status IN ('paid', 'pending'));


-- ========================================
-- 7. Notifications table
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type        TEXT NOT NULL CHECK (type IN ('fee_reminder', 'settlement_reminder')),
  title       TEXT NOT NULL,
  message     TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  reference_id UUID,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON notifications(recipient_id, is_read, created_at DESC);


-- ========================================
-- 8. Enable realtime on notifications
-- ========================================
-- Note: If this fails, run it separately or check if publication exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Realtime might not be set up or current user lacks permission
  NULL;
END $$;


-- ========================================
-- 9. Enable RLS on all tables
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- ========================================
-- DONE!
-- ========================================
