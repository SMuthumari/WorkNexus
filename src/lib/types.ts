export type Role = 'recruiter' | 'worker';
export type Skill = 'picker' | 'packer' | 'forklift' | 'driver';
export type JobStatus = 'open' | 'filled' | 'closed';
export type ApplicationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'checked_in'
  | 'completed';

export interface Profile {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  age: number | null;
  qualification: string;
  skill: Skill | '';
  zone: string;
  exact_location: string;
  available_now: boolean;
  id_proof_url: string;
  id_verified: boolean;
  avg_rating: number;
  rating_count: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  company_name: string;
  company_address: string;
  contact_number: string;
  phone: string;
}

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  skill: Skill;
  zone: string;
  exact_location: string;
  shift_timing: string;
  shift_start: string;
  shift_end: string;
  shift_date: string;
  salary: string;
  workers_needed: number;
  workers_hired: number;
  status: JobStatus;
  created_at: string;
  recruiter?: Profile;
}

export interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  status: ApplicationStatus;
  working_id: string;
  applied_at: string;
  accepted_at: string | null;
  expires_at: string;
  checked_in_at: string | null;
  worker?: Profile;
  job?: Job;
}

export interface Rating {
  id: string;
  job_id: string;
  worker_id: string;
  recruiter_id: string;
  stars: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  worker_id: string;
  title: string;
  body: string;
  working_id: string;
  job_id: string | null;
  read: boolean;
  created_at: string;
}

export interface BlockedWorker {
  id: string;
  recruiter_id: string;
  worker_id: string;
  reason: string;
  created_at: string;
}

export const SKILLS: Skill[] = ['picker', 'packer', 'forklift', 'driver'];
