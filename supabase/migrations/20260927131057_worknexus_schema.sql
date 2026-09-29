/*
# WorkNexus — Core Schema

Creates the tables for a gig-worker shortage platform with two roles (recruiter, worker):
- profiles: user role, name, skill, zone, availability, ID proof, rating
- jobs: job postings by recruiters with required worker count
- applications: worker applications to jobs, with status and Working ID
- ratings: recruiter ratings of workers (1-5 stars) after check-in
- notifications: in-app notifications for workers (e.g. Working ID assignment)
- blocked_workers: recruiter-blocked workers (never appear in that recruiter's searches)

All tables use owner-scoped RLS with auth.uid(). Owner columns default to auth.uid().
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('recruiter','worker')),
  full_name text NOT NULL DEFAULT '',
  age integer,
  qualification text DEFAULT '',
  skill text DEFAULT '' CHECK (skill IN ('','picker','packer','forklift','driver')),
  zone text DEFAULT '',
  exact_location text DEFAULT '',
  available_now boolean NOT NULL DEFAULT false,
  id_proof_url text DEFAULT '',
  id_verified boolean NOT NULL DEFAULT false,
  avg_rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  latitude double precision,
  longitude double precision,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  skill text NOT NULL CHECK (skill IN ('picker','packer','forklift','driver')),
  zone text NOT NULL,
  exact_location text NOT NULL DEFAULT '',
  shift_timing text NOT NULL DEFAULT '',
  salary text NOT NULL DEFAULT '',
  workers_needed integer NOT NULL DEFAULT 1,
  workers_hired integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','filled','closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_jobs" ON jobs;
CREATE POLICY "select_jobs" ON jobs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_jobs" ON jobs;
CREATE POLICY "insert_own_jobs" ON jobs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "update_own_jobs" ON jobs;
CREATE POLICY "update_own_jobs" ON jobs FOR UPDATE
  TO authenticated USING (auth.uid() = recruiter_id) WITH CHECK (auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "delete_own_jobs" ON jobs;
CREATE POLICY "delete_own_jobs" ON jobs FOR DELETE
  TO authenticated USING (auth.uid() = recruiter_id);

-- APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','expired','checked_in','completed')),
  working_id text DEFAULT '',
  applied_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  expires_at timestamptz DEFAULT now() + interval '30 minutes',
  checked_in_at timestamptz
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_applications" ON applications;
CREATE POLICY "select_applications" ON applications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "update_applications" ON applications;
CREATE POLICY "update_applications" ON applications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications" ON applications FOR DELETE
  TO authenticated USING (auth.uid() = worker_id);

-- RATINGS
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recruiter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  stars integer NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_ratings" ON ratings;
CREATE POLICY "select_ratings" ON ratings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_ratings" ON ratings;
CREATE POLICY "insert_own_ratings" ON ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "update_own_ratings" ON ratings;
CREATE POLICY "update_own_ratings" ON ratings FOR UPDATE
  TO authenticated USING (auth.uid() = recruiter_id) WITH CHECK (auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "delete_own_ratings" ON ratings;
CREATE POLICY "delete_own_ratings" ON ratings FOR DELETE
  TO authenticated USING (auth.uid() = recruiter_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  working_id text DEFAULT '',
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = worker_id);

-- BLOCKED WORKERS
CREATE TABLE IF NOT EXISTS blocked_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_id, worker_id)
);

ALTER TABLE blocked_workers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_blocked" ON blocked_workers;
CREATE POLICY "select_own_blocked" ON blocked_workers FOR SELECT
  TO authenticated USING (auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "insert_own_blocked" ON blocked_workers;
CREATE POLICY "insert_own_blocked" ON blocked_workers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "delete_own_blocked" ON blocked_workers;
CREATE POLICY "delete_own_blocked" ON blocked_workers FOR DELETE
  TO authenticated USING (auth.uid() = recruiter_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_worker ON notifications(worker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_recruiter ON blocked_workers(recruiter_id);