import { useState, type ReactNode } from 'react';
import { useLang } from '@/lib/lang-context';
import { useAuth } from '@/lib/auth-context';
import { t } from '@/lib/i18n';
import { SKILL_ICONS, SKILL_LABELS_EN, SKILL_LABELS_TA, ZONES } from '@/lib/constants';
import type { Lang } from '@/lib/constants';
import { SKILLS } from '@/lib/types';
import type { Job, Profile, Application } from '@/lib/types';
import { computeShortage, formatDistance } from '@/lib/matching';
import { VoiceInput, SpeakButton, ScreenInstruction, Field, inputCls } from '@/components/voice-ui';
import { FileText, Search, Briefcase, Users, Star, ShieldCheck, Ban, Flag, CheckCircle, Clock, AlertTriangle, Check, Loader2 } from 'lucide-react';

// ============ Recruiter Dashboard ============
export function RecruiterDashboard({
  jobs,
  onNavigate,
}: {
  jobs: Job[];
  onNavigate: (k: any) => void;
}) {
  const { lang, voiceHelp } = useLang();
  const { profile } = useAuth();
  const openJobs = jobs.filter((j) => j.status === 'open');
  const totalShortage = jobs.reduce((sum, j) => sum + Math.max(0, j.workers_needed - j.workers_hired), 0);

  const instruction = lang === 'en'
    ? 'Welcome. Tap post a job, search workers, or my postings.'
    : 'வரவேற்கிறோம். வேலை வெளியிட, தொழிலாளர்களைத் தேட, அல்லது எனது வேலைகளைத் தட்டவும்.';

  const cards = [
    { key: 'post_job', icon: FileText, label: t('post_job', lang), color: 'bg-blue-500' },
    { key: 'search_workers', icon: Search, label: t('search_workers', lang), color: 'bg-emerald-500' },
    { key: 'my_postings', icon: Briefcase, label: t('my_postings', lang), color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-5">
      <ScreenInstruction instruction={instruction} />
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {t('hello', lang)}, {profile?.full_name?.split(' ')[0] || ''}!
        </h1>
        <p className="text-slate-500 text-sm mt-1">{t('manage_shortages', lang)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">{t('open_jobs', lang)}</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{openJobs.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-red-500" />
            <span className="text-xs text-slate-500">{t('total_shortage', lang)}</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalShortage}</p>
        </div>
      </div>

      <div className="space-y-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => onNavigate(c.key)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition text-left"
            >
              <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-slate-700">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ Post Job Form ============
export function PostJobForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Omit<Job, 'id' | 'recruiter_id' | 'workers_hired' | 'status' | 'created_at'>) => void;
  onCancel: () => void;
}) {
  const { lang } = useLang();
  const [title, setTitle] = useState('');
  const [skill, setSkill] = useState<'picker' | 'packer' | 'forklift' | 'driver'>('picker');
  const [zone, setZone] = useState('');
  const [exactLocation, setExactLocation] = useState('');
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [salary, setSalary] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const instruction = lang === 'en'
    ? 'Fill the job form. Enter title, skill, zone, shift times, salary, and number of workers.'
    : 'வேலை படிவத்தை நிரப்பவும். தலைப்பு, திறல், மண்டலம், ஷிஃப்ட் நேரம், சம்பளம், மற்றும் தொழிலாளர்கள் எண்ணிக்கை.';

  const shiftTiming = shiftStart && shiftEnd ? `${shiftStart} - ${shiftEnd}` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onSubmit({
      title, skill, zone, exact_location: exactLocation,
      shift_timing: shiftTiming, shift_start: shiftStart, shift_end: shiftEnd, shift_date: shiftDate,
      salary, workers_needed: workersNeeded,
    });
  };

  return (
    <div className="space-y-4">
      <ScreenInstruction instruction={instruction} />
      <h1 className="text-xl font-bold text-slate-800">{t('post_job', lang)}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-5 border border-slate-100">
        <Field label={t('job_title', lang)}>
          <VoiceInput value={title} onChange={setTitle} placeholder={lang === 'en' ? 'e.g. Warehouse Picker needed' : 'உதாரணம்: கிடங்கு பிக்கர் தேவை'} className={inputCls} />
        </Field>

        <Field label={t('skill_required', lang)}>
          <div className="grid grid-cols-2 gap-2">
            {SKILLS.map((s) => (
              <button key={s} type="button" onClick={() => setSkill(s)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition text-sm font-medium ${skill === s ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>
                <span className="text-lg">{SKILL_ICONS[s]}</span>
                {lang === 'en' ? SKILL_LABELS_EN[s] : SKILL_LABELS_TA[s]}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t('zone_location', lang)}>
          <select value={zone} onChange={(e) => setZone(e.target.value)} required className={inputCls}>
            <option value="">{t('select_zone', lang)}</option>
            {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </Field>

        <Field label={t('exact_location', lang)}>
          <VoiceInput value={exactLocation} onChange={setExactLocation} placeholder={lang === 'en' ? 'e.g. Gate 3, Industrial Estate' : 'உதாரணம்: கதவு 3, தொழில்துறை எஸ்டேட்'} className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('shift_start', lang)}>
            <input type="time" value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} required className={inputCls} />
          </Field>
          <Field label={t('shift_end', lang)}>
            <input type="time" value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} required className={inputCls} />
          </Field>
        </div>

        <Field label={t('shift_date', lang)}>
          <input type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} required className={inputCls} />
        </Field>

        <Field label={t('salary', lang)}>
          <VoiceInput value={salary} onChange={setSalary} placeholder={lang === 'en' ? 'e.g. ₹500/day' : 'உதாரணம்: ₹500/நாள்'} className={inputCls} />
        </Field>

        <Field label={t('workers_needed', lang)}>
          <input type="number" min={1} value={workersNeeded} onChange={(e) => setWorkersNeeded(Number(e.target.value))} required className={inputCls} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">
            {t('cancel', lang)}
          </button>
          <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('loading', lang)}</> : t('submit', lang)}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============ Search Workers ============
export function SearchWorkers({
  workers,
  onHireAll,
  onHireOne,
  onBlock,
  onReport,
  blockedIds,
  hiringAll,
}: {
  workers: (Profile & { distance: number | null })[];
  onHireAll: () => void;
  onHireOne: (w: Profile) => void;
  onBlock: (w: Profile) => void;
  onReport: (w: Profile) => void;
  blockedIds: string[];
  hiringAll: boolean;
}) {
  const { lang } = useLang();
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const instruction = lang === 'en'
    ? 'Search workers. Pick a skill and zone. Only free workers show up. Best rated first.'
    : 'தொழிலாளர்களைத் தேடு. திறல் மற்றும் மண்டலம் தேர்வு செய். கடைசியாக இலவச தொழிலாளர்கள் மட்டுமே.';

  const filtered = workers
    .filter((w) => skillFilter === 'all' || w.skill === skillFilter)
    .filter((w) => zoneFilter === 'all' || w.zone === zoneFilter)
    .filter((w) => !blockedIds.includes(w.id))
    .sort((a, b) => {
      const ra = a.avg_rating || 0;
      const rb = b.avg_rating || 0;
      if (rb !== ra) return rb - ra;
      return (a.distance ?? 999) - (b.distance ?? 999);
    });

  return (
    <div className="space-y-4">
      <ScreenInstruction instruction={instruction} />
      <h1 className="text-xl font-bold text-slate-800">{t('search_workers', lang)}</h1>

      <div className="space-y-3 bg-white rounded-2xl p-4 border border-slate-100">
        <Field label={t('filter_by_skill', lang)}>
          <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className={inputCls}>
            <option value="all">{t('all_skills', lang)}</option>
            {SKILLS.map((s) => <option key={s} value={s}>{SKILL_ICONS[s]} {lang === 'en' ? SKILL_LABELS_EN[s] : SKILL_LABELS_TA[s]}</option>)}
          </select>
        </Field>
        <Field label={t('filter_by_zone', lang)}>
          <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className={inputCls}>
            <option value="all">{t('all_zones', lang)}</option>
            {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </Field>
      </div>

      {filtered.length > 0 && (
        <button
          onClick={onHireAll}
          disabled={hiringAll}
          className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 text-lg"
        >
          {hiringAll ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('loading', lang)}</> : <><CheckCircle className="w-5 h-5" /> {t('hire_all', lang)} ({filtered.length})</>}
        </button>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center text-slate-400 py-10">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{t('no_workers_found', lang)}</p>
          </div>
        )}
        {filtered.map((w) => (
          <WorkerCard key={w.id} worker={w} distance={w.distance}
            onHire={() => onHireOne(w)} onBlock={() => onBlock(w)} onReport={() => onReport(w)} />
        ))}
      </div>
    </div>
  );
}

function WorkerCard({
  worker, distance, onHire, onBlock, onReport,
}: {
  worker: Profile; distance: number | null;
  onHire: () => void; onBlock: () => void; onReport: () => void;
}) {
  const { lang } = useLang();
  const [hiring, setHiring] = useState(false);
  const skillLabel = worker.skill ? (lang === 'en' ? SKILL_LABELS_EN[worker.skill] : SKILL_LABELS_TA[worker.skill]) : '';

  const handleHire = async () => {
    setHiring(true);
    await onHire();
    setHiring(false);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500">
            {worker.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-800 text-sm">{worker.full_name}</span>
              {worker.id_verified && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />{t('id_verified', lang)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {worker.skill && <span className="text-sm">{SKILL_ICONS[worker.skill]}</span>}
              <span className="text-xs text-slate-500">{skillLabel}</span>
              {distance != null && <span className="text-xs text-slate-400">· {formatDistance(distance)} {t('distance', lang)}</span>}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-slate-600">{(worker.avg_rating || 0).toFixed(1)}</span>
              <span className="text-xs text-slate-400">({worker.rating_count || 0})</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleHire} disabled={hiring}
          className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-1 disabled:opacity-50">
          {hiring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {t('accept', lang)}
        </button>
        <button onClick={onReport} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition flex items-center gap-1">
          <Flag className="w-4 h-4" /> {t('report', lang)}
        </button>
        <button onClick={onBlock} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition flex items-center gap-1">
          <Ban className="w-4 h-4" /> {t('block', lang)}
        </button>
      </div>
    </div>
  );
}

// ============ My Postings ============
export function MyPostings({
  jobs, applications, onAccept, onRate, ratedIds, acceptingId,
}: {
  jobs: Job[]; applications: Application[];
  onAccept: (appId: string) => Promise<void>;
  onRate: (workerId: string, jobId: string, stars: number) => void;
  ratedIds: string[]; acceptingId: string | null;
}) {
  const { lang } = useLang();
  const instruction = lang === 'en'
    ? 'Your job postings. See hired count and shortage. Tap accept to hire applicants.'
    : 'உங்கள் வேலை வெளியீடுகள். நியமிக்கப்பட்ட எண்ணிக்கை மற்றும் பற்றாக்குறை பார்க்கவும். விண்ணப்பதாரர்களை நியமிக்க ஏற்க தட்டவும்.';

  return (
    <div className="space-y-4">
      <ScreenInstruction instruction={instruction} />
      <h1 className="text-xl font-bold text-slate-800">{t('my_postings', lang)}</h1>
      {jobs.length === 0 && (
        <div className="text-center text-slate-400 py-10">
          <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">{t('no_jobs_posted', lang)}</p>
        </div>
      )}
      {jobs.map((job) => {
        const shortage = computeShortage(job.workers_needed, job.workers_hired);
        const jobApps = applications
          .filter((a) => a.job_id === job.id)
          .sort((a, b) => (b.worker?.avg_rating || 0) - (a.worker?.avg_rating || 0));
        const shiftText = [job.shift_date, job.shift_start, job.shift_end].filter(Boolean).join(' · ');

        return (
          <div key={job.id} className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{job.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{SKILL_ICONS[job.skill]} {lang === 'en' ? SKILL_LABELS_EN[job.skill] : SKILL_LABELS_TA[job.skill]}</span>
                  <span>· {job.zone}</span>
                  {shiftText && <span>· {shiftText}</span>}
                </div>
              </div>
              <ShortageBadge shortage={shortage} lang={lang} />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{t('workers_hired', lang)}: {job.workers_hired}/{job.workers_needed}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${shortage.color === 'green' ? 'bg-green-500' : shortage.color === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, (job.workers_hired / job.workers_needed) * 100)}%` }} />
              </div>
            </div>

            {jobApps.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-600">{t('applicants', lang)} ({jobApps.length})</p>
                {jobApps.map((app) => (
                  <ApplicantRow key={app.id} app={app}
                    onAccept={() => onAccept(app.id)}
                    onRate={(stars) => onRate(app.worker_id, app.job_id, stars)}
                    rated={ratedIds.includes(app.id)}
                    accepting={acceptingId === app.id}
                    lang={lang} />
                ))}
              </div>
            )}
            {jobApps.length === 0 && <p className="text-xs text-slate-400 pt-1">{t('no_applicants', lang)}</p>}
          </div>
        );
      })}
    </div>
  );
}

function ApplicantRow({
  app, onAccept, onRate, rated, accepting, lang,
}: {
  app: Application;
  onAccept: () => Promise<void>;
  onRate: (stars: number) => void;
  rated: boolean; accepting: boolean; lang: Lang;
}) {
  const [showRate, setShowRate] = useState(false);
  const w = app.worker;
  if (!w) return null;

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
          {w.full_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-slate-700">{w.full_name}</span>
            {w.id_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {(w.avg_rating || 0).toFixed(1)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {app.status === 'pending' && (
          <button onClick={onAccept} disabled={accepting}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1">
            {accepting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {accepting ? t('accepting', lang) : t('accept', lang)}
          </button>
        )}
        {(app.status === 'accepted' || app.status === 'checked_in') && !rated && (
          <button onClick={() => setShowRate(!showRate)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition">
            <Star className="w-3.5 h-3.5 inline" /> {t('rate_worker', lang)}
          </button>
        )}
        {app.status === 'accepted' && rated && (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> {t('rated', lang)}
          </span>
        )}
        {app.status === 'pending' && <Clock className="w-3 h-3 text-slate-400" />}
      </div>

      {showRate && !rated && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 z-10 flex gap-1 absolute mt-2 right-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => { onRate(n); setShowRate(false); }} className="p-1 hover:scale-125 transition">
              <Star className="w-6 h-6 text-amber-400 hover:fill-amber-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ShortageBadge({ shortage, lang }: { shortage: ReturnType<typeof computeShortage>; lang: Lang }) {
  const colorMap: Record<string, string> = { green: 'bg-green-100 text-green-700', amber: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-red-700' };
  const iconMap: Record<string, typeof CheckCircle> = { green: CheckCircle, amber: AlertTriangle, red: AlertTriangle };
  const Icon = iconMap[shortage.color];
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${colorMap[shortage.color]}`}>
      <Icon className="w-3.5 h-3.5" /> {t(shortage.labelKey, lang)}
    </span>
  );
}
