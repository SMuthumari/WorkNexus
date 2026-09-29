/*
# Create id-proof storage bucket

Creates a public storage bucket for worker ID proof images.
Workers can upload their ID photo; a public URL is stored on their profile.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('id-proof', 'id-proof', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "workers_upload_id_proof" ON storage.objects;
CREATE POLICY "workers_upload_id_proof" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'id-proof');

DROP POLICY IF EXISTS "workers_update_id_proof" ON storage.objects;
CREATE POLICY "workers_update_id_proof" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'id-proof') WITH CHECK (bucket_id = 'id-proof');

DROP POLICY IF EXISTS "public_read_id_proof" ON storage.objects;
CREATE POLICY "public_read_id_proof" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'id-proof');
