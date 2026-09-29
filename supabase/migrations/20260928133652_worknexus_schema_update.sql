/*
# WorkNexus — Schema updates for company fields, shift details, RLS fixes

1. Add company_name, company_address, contact_number, phone to profiles
2. Add shift_start, shift_end, shift_date to jobs
3. Fix applications INSERT policy: allow recruiters to insert applications for their own jobs
4. Fix notifications INSERT policy: allow recruiters to insert notifications for workers they hire
5. Update hire_worker RPC to build rich notifications with company info
6. Change Working ID format to WF-XXXX
*/

-- Add company fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_address text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_number text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text DEFAULT '';

-- Add shift fields to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS shift_start text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS shift_end text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS shift_date text DEFAULT '';

-- Fix applications INSERT policy: allow recruiters to insert for their jobs OR workers to insert for themselves
DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = worker_id
    OR EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
    )
  );

-- Fix notifications INSERT policy: allow workers to insert for themselves OR recruiters to insert for workers on their jobs
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = worker_id
    OR EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = notifications.job_id AND jobs.recruiter_id = auth.uid()
    )
  );

-- Update generate_working_id to WF-XXXX format (4 digits)
CREATE OR REPLACE FUNCTION generate_working_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_id text;
BEGIN
  new_id := 'WF-' || lpad(floor(random() * 10000)::text, 4, '0');
  RETURN new_id;
END;
$$;

-- Update hire_worker RPC to build rich notifications with company info
CREATE OR REPLACE FUNCTION hire_worker(p_application_id uuid, p_recruiter_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id uuid;
  v_worker_id uuid;
  v_wid text;
  v_title text;
  v_company_name text;
  v_company_address text;
  v_contact_number text;
  v_shift_start text;
  v_shift_end text;
  v_shift_date text;
  v_notif_body text;
BEGIN
  SELECT job_id, worker_id INTO v_job_id, v_worker_id
  FROM applications WHERE id = p_application_id AND status = 'pending';

  IF v_worker_id IS NULL THEN
    RAISE EXCEPTION 'Application not found or not pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = v_job_id AND recruiter_id = p_recruiter_id) THEN
    RAISE EXCEPTION 'Not authorized to hire for this job';
  END IF;

  v_wid := generate_working_id();

  UPDATE applications
  SET status = 'accepted', working_id = v_wid, accepted_at = now()
  WHERE id = p_application_id;

  UPDATE jobs SET workers_hired = workers_hired + 1 WHERE id = v_job_id;

  -- Get job and recruiter details for notification
  SELECT j.title, j.shift_start, j.shift_end, j.shift_date,
         p.company_name, p.company_address, p.contact_number
  INTO v_title, v_shift_start, v_shift_end, v_shift_date,
       v_company_name, v_company_address, v_contact_number
  FROM jobs j
  JOIN profiles p ON p.id = j.recruiter_id
  WHERE j.id = v_job_id;

  v_notif_body := 'You have been selected by ' || COALESCE(v_company_name, 'Company') ||
    ' for ' || COALESCE(v_title, 'Job') ||
    ', from ' || COALESCE(v_shift_start, 'N/A') || ' to ' || COALESCE(v_shift_end, 'N/A') ||
    ' on ' || COALESCE(v_shift_date, 'N/A') ||
    '. Address: ' || COALESCE(v_company_address, 'N/A') ||
    '. Your Working ID is ' || v_wid ||
    '. For any questions call ' || COALESCE(v_contact_number, 'N/A') || '.';

  INSERT INTO notifications (worker_id, title, body, working_id, job_id)
  VALUES (v_worker_id, 'You are hired!', v_notif_body, v_wid, v_job_id);

  RETURN v_wid;
END;
$$;

-- New RPC: hire_worker_direct — hire a worker without an existing application (for Hire All / search)
CREATE OR REPLACE FUNCTION hire_worker_direct(p_worker_id uuid, p_job_id uuid, p_recruiter_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wid text;
  v_title text;
  v_company_name text;
  v_company_address text;
  v_contact_number text;
  v_shift_start text;
  v_shift_end text;
  v_shift_date text;
  v_notif_body text;
  v_app_id uuid;
BEGIN
  -- Verify the job belongs to this recruiter
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = p_job_id AND recruiter_id = p_recruiter_id) THEN
    RAISE EXCEPTION 'Not authorized to hire for this job';
  END IF;

  -- Check if application already exists
  SELECT id INTO v_app_id FROM applications
  WHERE job_id = p_job_id AND worker_id = p_worker_id AND status = 'pending';

  IF v_app_id IS NULL THEN
    -- Create application
    INSERT INTO applications (job_id, worker_id, status)
    VALUES (p_job_id, p_worker_id, 'pending')
    RETURNING id INTO v_app_id;
  END IF;

  v_wid := generate_working_id();

  UPDATE applications
  SET status = 'accepted', working_id = v_wid, accepted_at = now()
  WHERE id = v_app_id;

  UPDATE jobs SET workers_hired = workers_hired + 1 WHERE id = p_job_id;

  -- Get job and recruiter details for notification
  SELECT j.title, j.shift_start, j.shift_end, j.shift_date,
         p.company_name, p.company_address, p.contact_number
  INTO v_title, v_shift_start, v_shift_end, v_shift_date,
       v_company_name, v_company_address, v_contact_number
  FROM jobs j
  JOIN profiles p ON p.id = j.recruiter_id
  WHERE j.id = p_job_id;

  v_notif_body := 'You have been selected by ' || COALESCE(v_company_name, 'Company') ||
    ' for ' || COALESCE(v_title, 'Job') ||
    ', from ' || COALESCE(v_shift_start, 'N/A') || ' to ' || COALESCE(v_shift_end, 'N/A') ||
    ' on ' || COALESCE(v_shift_date, 'N/A') ||
    '. Address: ' || COALESCE(v_company_address, 'N/A') ||
    '. Your Working ID is ' || v_wid ||
    '. For any questions call ' || COALESCE(v_contact_number, 'N/A') || '.';

  INSERT INTO notifications (worker_id, title, body, working_id, job_id)
  VALUES (p_worker_id, 'You are hired!', v_notif_body, v_wid, p_job_id);

  RETURN v_wid;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_working_id() TO authenticated;
GRANT EXECUTE ON FUNCTION update_worker_rating(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION hire_worker(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION hire_worker_direct(uuid, uuid, uuid) TO authenticated;
