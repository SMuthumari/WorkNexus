import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { LangProvider, useLang } from '@/lib/lang-context';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import type { Job, Application, Notification, Profile, Role, BlockedWorker, Rating } from '@/lib/types';
import { SKILL_ICONS, SKILL_LABELS_EN, SKILL_LABELS_TA } from '@/lib/constants';

import LanguageSelect from '@/components/LanguageSelect';
import Login from '@/components/Login';
import Assistant from '@/components/Assistant';
import Shell, { type NavKey } from '@/components/Shell';
import HirePopup from '@/components/HirePopup';
import { RecruiterDashboard, PostJobForm, SearchWorkers, MyPostings } from '@/components/recruiter-screens';
import { WorkerDashboard, WorkerProfile, JobBoard, MyApplications, NotificationsScreen } from '@/components/worker-screens';

function AppInner() {
  const { session, profile, loading, role, refreshProfile } = useAuth();
  const { lang } = useLang();
  const [loginRole, setLoginRole] = useState<Role>('worker');
  const [nav, setNav] = useState<NavKey>('dashboard');

  // Data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [workers, setWorkers] = useState<Profile[]>([]);
  const [blocked, setBlocked] = useState<BlockedWorker[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  // UI state
  const [hiringAll, setHiringAll] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [hirePopup, setHirePopup] = useState<Notification | null>(null);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const isRecruiter = role === 'recruiter';
  const isWorker = role === 'worker';

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const screenContext = (() => {
    if (!session) return 'login';
    if (nav === 'dashboard') return isRecruiter ? 'recruiter dashboard' : 'worker dashboard';
    if (nav === 'post_job') return 'post job form';
    if (nav === 'search_workers') return 'search workers';
    if (nav === 'my_postings') return 'my postings';
    if (nav === 'job_board') return 'job board';
    if (nav === 'my_profile') return 'worker profile';
    if (nav === 'my_applications') return 'my applications';
    if (nav === 'notifications') return 'notifications';
    return 'unknown';
  })();

  const pageTitle = (() => {
    if (!session) return '';
    if (nav === 'dashboard') return isRecruiter ? t('dashboard', lang) : t('dashboard', lang);
    return t(nav, lang);
  })();

  // Load jobs
  const loadJobs = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (data) setJobs(data as Job[]);
  }, [session]);

  // Load applications
  const loadApplications = useCallback(async () => {
    if (!session || !profile) return;
    if (isRecruiter) {
      const { data: myJobs } = await supabase.from('jobs').select('id').eq('recruiter_id', profile.id);
      const jobIds = (myJobs || []).map((j) => j.id);
      if (jobIds.length === 0) { setApplications([]); return; }
      const { data } = await supabase
        .from('applications').select('*, worker:profiles!applications_worker_id_fkey(*), job:jobs(*)')
        .in('job_id', jobIds).order('applied_at', { ascending: false });
      if (data) setApplications(data as unknown as Application[]);
    } else {
      const { data } = await supabase
        .from('applications').select('*, worker:profiles!applications_worker_id_fkey(*), job:jobs(*)')
        .eq('worker_id', profile.id).order('applied_at', { ascending: false });
      if (data) setApplications(data as unknown as Application[]);
    }
  }, [session, profile, isRecruiter]);

  // Load notifications (worker)
  const loadNotifications = useCallback(async () => {
    if (!session || !profile || !isWorker) return;
    const { data } = await supabase
      .from('notifications').select('*').eq('worker_id', profile.id).order('created_at', { ascending: false });
    if (data) setNotifications(data as Notification[]);
  }, [session, profile, isWorker]);

  // Load workers (recruiter)
  const loadWorkers = useCallback(async () => {
    if (!session || !isRecruiter || !profile) return;
    const { data: blockedData } = await supabase.from('blocked_workers').select('worker_id').eq('recruiter_id', profile.id);
    const blockedIds = (blockedData || []).map((b) => b.worker_id);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'worker').eq('available_now', true);
    if (data) setWorkers((data as Profile[]).filter((w) => !blockedIds.includes(w.id)));
  }, [session, isRecruiter, profile]);

  // Load blocked
  const loadBlocked = useCallback(async () => {
    if (!session || !isRecruiter || !profile) return;
    const { data } = await supabase.from('blocked_workers').select('*').eq('recruiter_id', profile.id);
    if (data) setBlocked(data as BlockedWorker[]);
  }, [session, isRecruiter, profile]);

  // Load ratings
  const loadRatings = useCallback(async () => {
    if (!session || !isRecruiter || !profile) return;
    const { data: myJobs } = await supabase.from('jobs').select('id').eq('recruiter_id', profile.id);
    const jobIds = (myJobs || []).map((j) => j.id);
    if (jobIds.length === 0) { setRatings([]); return; }
    const { data } = await supabase.from('ratings').select('*').in('job_id', jobIds);
    if (data) setRatings(data as Rating[]);
  }, [session, isRecruiter, profile]);

  // Auto-expire pending applications
  useEffect(() => {
    if (!isRecruiter || applications.length === 0) return;
    const interval = setInterval(async () => {
      const expired = applications.filter((a) => a.status === 'pending' && new Date(a.expires_at) < new Date());
      if (expired.length > 0) {
        for (const app of expired) await supabase.from('applications').update({ status: 'expired' }).eq('id', app.id);
        loadApplications();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isRecruiter, applications, loadApplications]);

  // Realtime
  useEffect(() => {
    if (!session || !profile) return;
    const channel = supabase.channel('app_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => loadApplications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => loadNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => loadJobs())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { if (isRecruiter) loadWorkers(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, profile, isRecruiter, loadApplications, loadNotifications, loadJobs, loadWorkers]);

  // Initial data load + check for unread hire notification popup
  useEffect(() => {
    if (session && profile) {
      setNav('dashboard');
      loadJobs(); loadApplications(); loadNotifications(); loadWorkers(); loadBlocked(); loadRatings();
    }
  }, [session, profile?.id, role]);

  // Show hire popup for unread hire notifications
  useEffect(() => {
    if (isWorker && notifications.length > 0) {
      const unreadHire = notifications.find((n) => !n.read && n.working_id);
      if (unreadHire) setHirePopup(unreadHire);
    }
  }, [notifications, isWorker]);

  // ============ Actions ============

  const postJob = async (data: Omit<Job, 'id' | 'recruiter_id' | 'workers_hired' | 'status' | 'created_at'>) => {
    if (!profile) return;
    const { error } = await supabase.from('jobs').insert({ ...data, recruiter_id: profile.id });
    if (error) { showToast(error.message, 'error'); return; }
    await loadJobs();
    showToast(t('job_posted', lang), 'success');
    setNav('my_postings');
  };

  const hireWorker = async (applicationId: string) => {
    if (!profile) return;
    setAcceptingId(applicationId);
    const { error } = await supabase.rpc('hire_worker', {
      p_application_id: applicationId, p_recruiter_id: profile.id,
    });
    if (error) { showToast(error.message, 'error'); setAcceptingId(null); return; }
    await loadApplications();
    await loadJobs();
    setAcceptingId(null);
    showToast(t('hiring_success', lang), 'success');
  };

  const hireAll = async (jobId: string) => {
    if (!profile) return;
    setShowJobPicker(false);
    setHiringAll(true);
    let count = 0;
    for (const worker of workers) {
      const { error } = await supabase.rpc('hire_worker_direct', {
        p_worker_id: worker.id, p_job_id: jobId, p_recruiter_id: profile.id,
      });
      if (!error) count++;
    }
    await loadJobs(); await loadApplications(); await loadWorkers();
    setHiringAll(false);
    showToast(`${count} ${t('hiring_all_success', lang)}`, 'success');
    setNav('my_postings');
  };

  const hireOneFromSearch = async (worker: Profile, job: Job) => {
    if (!profile) return;
    const { error } = await supabase.rpc('hire_worker_direct', {
      p_worker_id: worker.id, p_job_id: job.id, p_recruiter_id: profile.id,
    });
    if (error) { showToast(error.message, 'error'); return; }
    await loadJobs(); await loadApplications(); await loadWorkers();
    showToast(t('hiring_success', lang), 'success');
  };

  const handleHireAllClick = () => {
    const openJobs = jobs.filter((j) => j.status === 'open' && j.workers_hired < j.workers_needed);
    if (openJobs.length === 0) { showToast(t('post_job_first', lang), 'error'); return; }
    if (workers.length === 0) { showToast(t('no_workers_found', lang), 'error'); return; }
    if (openJobs.length === 1) {
      hireAll(openJobs[0].id);
    } else {
      setShowJobPicker(true);
    }
  };

  const handleHireOne = (w: Profile) => {
    const openJobs = jobs.filter((j) => j.status === 'open' && j.workers_hired < j.workers_needed);
    const matchingJob = openJobs.find((j) => j.skill === w.skill);
    if (!matchingJob) {
      // No skill match — try any open job
      const anyJob = openJobs[0];
      if (!anyJob) { showToast(t('no_matching_job', lang), 'error'); return; }
      hireOneFromSearch(w, anyJob);
    } else {
      hireOneFromSearch(w, matchingJob);
    }
  };

  const blockWorker = async (worker: Profile) => {
    if (!profile) return;
    await supabase.from('blocked_workers').insert({ recruiter_id: profile.id, worker_id: worker.id, reason: 'Blocked from search' });
    await loadBlocked(); await loadWorkers();
  };

  const reportWorker = async (worker: Profile) => {
    if (!profile) return;
    await supabase.from('blocked_workers').insert({ recruiter_id: profile.id, worker_id: worker.id, reason: 'Reported by recruiter' });
    await loadBlocked(); await loadWorkers();
    showToast(t('worker_reported', lang), 'success');
  };

  const rateWorker = async (workerId: string, jobId: string, stars: number) => {
    if (!profile) return;
    const { error } = await supabase.from('ratings').insert({ job_id: jobId, worker_id: workerId, recruiter_id: profile.id, stars });
    if (error) { showToast(error.message, 'error'); return; }
    await supabase.rpc('update_worker_rating', { p_worker_id: workerId });
    await loadRatings(); await loadApplications();
  };

  const applyToJob = async (job: Job) => {
    if (!profile) return;
    const { error } = await supabase.from('applications').insert({
      job_id: job.id, worker_id: profile.id, status: 'pending',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
    if (error) { showToast(error.message, 'error'); return; }
    await loadApplications();
    showToast(t('applied_success', lang), 'success');
    setNav('my_applications');
  };

  const checkIn = async (appId: string) => {
    await supabase.from('applications').update({ status: 'checked_in', checked_in_at: new Date().toISOString() }).eq('id', appId);
    await loadApplications();
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    await loadNotifications();
  };

  const closeHirePopup = async () => {
    if (hirePopup) {
      await supabase.from('notifications').update({ read: true }).eq('id', hirePopup.id);
      await loadNotifications();
    }
    setHirePopup(null);
  };

  // ============ Render ============

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">{t('loading', lang)}</p>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <>
        <Login initialRole={loginRole} onRoleChange={setLoginRole} />
        <Assistant screenContext={screenContext} />
      </>
    );
  }

  if (isWorker && !profile.full_name && nav !== 'my_profile') {
    return (
      <>
        <Shell current="my_profile" onNavigate={setNav} notificationCount={notifications.filter((n) => !n.read).length} pageTitle={t('my_profile', lang)}>
          <WorkerProfile onSaved={() => { refreshProfile(); setNav('dashboard'); }} />
        </Shell>
        <Assistant screenContext={screenContext} />
        {hirePopup && <HirePopup notification={hirePopup} onClose={closeHirePopup} />}
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </>
    );
  }

  const blockedIds = blocked.map((b) => b.worker_id);
  const ratedAppIds = applications
    .filter((a) => ratings.some((r) => r.job_id === a.job_id && r.worker_id === a.worker_id))
    .map((a) => a.id);
  const appliedJobIds = applications.map((a) => a.job_id);
  const openJobs = jobs.filter((j) => j.status === 'open');

  const workersWithDistance = workers.map((w) => ({
    ...w, distance: w.zone === profile?.zone ? 2.5 : 8.3,
  }));

  const renderScreen = () => {
    if (isRecruiter) {
      switch (nav) {
        case 'dashboard': return <RecruiterDashboard jobs={jobs} onNavigate={setNav} />;
        case 'post_job': return <PostJobForm onSubmit={postJob} onCancel={() => setNav('dashboard')} />;
        case 'search_workers':
          return <SearchWorkers workers={workersWithDistance} onHireAll={handleHireAllClick} onHireOne={handleHireOne}
            onBlock={blockWorker} onReport={reportWorker} blockedIds={blockedIds} hiringAll={hiringAll} />;
        case 'my_postings':
          return <MyPostings jobs={jobs} applications={applications} onAccept={hireWorker} onRate={rateWorker}
            ratedIds={ratedAppIds} acceptingId={acceptingId} />;
        default: return <RecruiterDashboard jobs={jobs} onNavigate={setNav} />;
      }
    } else {
      switch (nav) {
        case 'dashboard': return <WorkerDashboard onNavigate={setNav} applications={applications} notifications={notifications} />;
        case 'job_board': return <JobBoard jobs={openJobs} appliedJobIds={appliedJobIds} onApply={applyToJob} />;
        case 'my_applications': return <MyApplications applications={applications} onCheckIn={checkIn} />;
        case 'my_profile': return <WorkerProfile onSaved={() => { refreshProfile(); setNav('dashboard'); }} />;
        case 'notifications': return <NotificationsScreen notifications={notifications} onMarkRead={markNotificationRead} />;
        default: return <WorkerDashboard onNavigate={setNav} applications={applications} notifications={notifications} />;
      }
    }
  };

  return (
    <>
      <Shell current={nav} onNavigate={setNav} notificationCount={notifications.filter((n) => !n.read).length} pageTitle={pageTitle}>
        {renderScreen()}
      </Shell>
      <Assistant screenContext={screenContext} />
      {hirePopup && <HirePopup notification={hirePopup} onClose={closeHirePopup} />}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {showJobPicker && <JobPicker jobs={openJobs.filter((j) => j.workers_hired < j.workers_needed)} onPick={hireAll} onCancel={() => setShowJobPicker(false)} />}
    </>
  );
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white animate-fade-in"
      style={{ backgroundColor: type === 'success' ? '#059669' : '#dc2626' }}>
      {msg}
    </div>
  );
}

function JobPicker({ jobs, onPick, onCancel }: {
  jobs: Job[]; onPick: (jobId: string) => void; onCancel: () => void;
}) {
  const { lang } = useLang();
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{t('select_job_for_hire', lang)}</h2>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {jobs.map((job) => (
            <button key={job.id} onClick={() => onPick(job.id)}
              className="w-full px-5 py-4 text-left border-b border-slate-50 hover:bg-blue-50 transition">
              <div className="flex items-center gap-2">
                <span className="text-lg">{SKILL_ICONS[job.skill]}</span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{job.title}</p>
                  <p className="text-xs text-slate-500">{job.zone} · {job.shift_date} {job.shift_start}-{job.shift_end}</p>
                  <p className="text-xs text-slate-400">{t('workers_hired', lang)}: {job.workers_hired}/{job.workers_needed}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="px-5 py-3">
          <button onClick={onCancel} className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 font-semibold hover:bg-slate-50 transition">
            {t('cancel', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </LangProvider>
  );
}
