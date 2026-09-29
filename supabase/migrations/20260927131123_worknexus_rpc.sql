/*
# WorkNexus — RPC functions

1. generate_working_id()
   Returns a unique Working ID string like WN-XXXXXX (6 random alphanumeric chars).
2. update_worker_rating(p_worker_id uuid)
   Recalculates and stores avg_rating + rating_count on the profile from the ratings table.
3. hire_worker(p_application_id uuid, p_recruiter_id uuid)
   Atomically: accepts an application, generates a working_id, creates a notification,
   and increments jobs.workers_hired. Returns the new working_id.
*/

CREATE OR REPLACE FUNCTION generate_working_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_id text;
BEGIN
  new_id := 'WN-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 6));
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_worker_rating(p_worker_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET avg_rating = (
    SELECT COALESCE(AVG(stars), 0) FROM ratings WHERE worker_id = p_worker_id
  ),
  rating_count = (
    SELECT COUNT(*) FROM ratings WHERE worker_id = p_worker_id
  )
  WHERE id = p_worker_id;
END;
$$;

CREATE OR REPLACE FUNCTION hire_worker(p_application_id uuid, p_recruiter_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id uuid;
  v_worker_id uuid;
  v_wid text;
  v_title text;
BEGIN
  SELECT job_id, worker_id INTO v_job_id, v_worker_id
  FROM applications WHERE id = p_application_id AND status = 'pending';

  IF v_worker_id IS NULL THEN
    RAISE EXCEPTION 'Application not found or not pending';
  END IF;

  -- Verify the job belongs to this recruiter
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = v_job_id AND recruiter_id = p_recruiter_id) THEN
    RAISE EXCEPTION 'Not authorized to hire for this job';
  END IF;

  v_wid := generate_working_id();

  UPDATE applications
  SET status = 'accepted', working_id = v_wid, accepted_at = now()
  WHERE id = p_application_id;

  UPDATE jobs SET workers_hired = workers_hired + 1 WHERE id = v_job_id;

  SELECT title INTO v_title FROM jobs WHERE id = v_job_id;

  INSERT INTO notifications (worker_id, title, body, working_id, job_id)
  VALUES (v_worker_id, 'You are hired!', 'You got the job: ' || v_title || '. Your Working ID is ' || v_wid, v_wid, v_job_id);

  RETURN v_wid;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_working_id() TO authenticated;
GRANT EXECUTE ON FUNCTION update_worker_rating(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION hire_worker(uuid, uuid) TO authenticated;