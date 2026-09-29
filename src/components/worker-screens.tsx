import { useState, useRef, type ReactNode } from 'react';
import { useLang } from '@/lib/lang-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { SKILL_ICONS, SKILL_LABELS_EN, SKILL_LABELS_TA, ZONES } from '@/lib/constants';
import type { Lang } from '@/lib/constants';
import { SKILLS } from '@/lib/types';
import type { Job, Application, Notification, Profile, Skill } from '@/lib/types';
import { computeShortage } from '@/lib/matching';
import { VoiceInput, SpeakButton, ScreenInstruction, Field, inputCls } from '@/components/voice-ui';
import { speak, stopSpeaking, isSpeechSupported } from '@/lib/voice';
import { Search, ClipboardList, User, Star, ShieldCheck, Bell, MapPin, Clock, IndianRupee, Users, CheckCircle, BadgeCheck, Upload, Volume2, Loader2 } from 'lucide-react';

// ============ Worker Dashboard ============
export function WorkerDashboard({
  onNavigate, applications, notifications,
}: {
  onNavigate: (k: any) => void; applications: Application[]; notifications: Notification[];
}) {
  const { lang } = useLang();
  const { profile } = useAuth();
  const pending = applications.filter((a) => a.status === 'pending').length;
  const hired = applications.filter((a) => a.status === 'accepted' || a.status === 'checked_in').length;
  const unread = notifications.filter((n) => !n.read).length;

  const instruction = lang === 'en'
    ? 'Welcome. Tap the green button to see jobs. Or tap my applications to check your status.'
    : 'வரவேற்கிறோம். வேலைகளைப் பார்க்க பச்சை பொத்தானை தட்டவும். அல்லது உங்கள் நிலை பார்க்க எனது விண்ணப்பங்களை தட்டவும்.';

  const cards = [
    { key: 'job_board', icon: Search, label: t('job_board', lang), color: 'bg-emerald-500' },
    { key: 'my_applications', icon: ClipboardList, label: t('my_applications', lang), color: 'bg-blue-500' },
    { key: 'my_profile', icon: User, label: t('my_profile', lang), color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-5">
      <ScreenInstruction instruction={instruction} />
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('hello', lang)}, {profile?.full_name?.split(' ')[0] || ''}!</h1>
        <p className="text-slate-500 text-sm mt-1">{t('find_work', lang)}</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 text-sm">{t('free_to_work', lang)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{t('turn_on_to_show', lang)}</p>
          </div>
          <AvailabilityToggle />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">{t('pending', lang)}</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{pending}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-500">{t('hired', lang)}</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{hired}</p>
        </div>
      </div>

      {unread > 0 && (
        <button onClick={() => onNavigate('notifications')}
          className="w-full flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
          <Bell className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{unread} {t('new_notifications', lang)}</span>
        </button>
      )}

      <div className="space-y-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.key} onClick={() => onNavigate(c.key)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition text-left">
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

function AvailabilityToggle() {
  const { profile, refreshProfile } = useAuth();
  const [toggling, setToggling] = useState(false);

  const toggle = async () => {
    setToggling(true);
    await supabase.from('profiles').update({ available_now: !profile?.available_now }).eq('id', profile?.id);
    await refreshProfile();
    setToggling(false);
  };

  return (
    <button onClick={toggle} disabled={toggling}
      className={`relative w-14 h-8 rounded-full transition-colors ${profile?.available_now ? 'bg-emerald-500' : 'bg-slate-300'} disabled:opacity-50`}>
      <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${profile?.available_now ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );
}

// ============ Worker Profile ============
export function WorkerProfile({ onSaved }: { onSaved: () => void }) {
  const { lang } = useLang();
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [qualification, setQualification] = useState(profile?.qualification || '');
  const [skill, setSkill] = useState<Skill>(profile?.skill || 'picker');
  const [zone, setZone] = useState(profile?.zone || '');
  const [exactLocation, setExactLocation] = useState(profile?.exact_location || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [idProofUrl, setIdProofUrl] = useState(profile?.id_proof_url || '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const instruction = lang === 'en'
    ? 'Fill your profile. Tap the mic icon to speak. Enter your name, age, qualification, skill, zone, and phone.'
    : 'உங்கள் சுயவிவரம் நிரப்பவும். பேச மைக் ஐகானை தட்டவும். பெயர், வயது, தகுதி, திறல், மண்டலம், மற்றும் தொலைபேசி.';

  const save = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
      full_name: fullName, age: age ? Number(age) : null, qualification, skill, zone,
      exact_location: exactLocation, phone, id_proof_url: idProofUrl, id_verified: !!idProofUrl,
    }).eq('id', profile?.id);
    await refreshProfile();
    setSaving(false);
    onSaved();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const ext = file.name.split('.').pop();
    const path = `id-proof/${profile.id}.${ext}`;
    const { error } = await supabase.storage.from('id-proof').upload(path, file, { upsert: true });
    if (error) { alert(t('upload_failed', lang)); return; }
    const { data: urlData } = supabase.storage.from('id-proof').getPublicUrl(path);
    setIdProofUrl(urlData.publicUrl);
  };

  return (
    <div className="space-y-4">
      <ScreenInstruction instruction={instruction} />
      <h1 className="text-xl font-bold text-slate-800">{t('my_profile', lang)}</h1>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
        <Field label={t('full_name', lang)}>
          <VoiceInput value={fullName} onChange={setFullName} placeholder={t('full_name', lang)} className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('age', lang)}>
            <VoiceInput value={age} onChange={setAge} placeholder={t('age', lang)} type="text" className={inputCls} />
          </Field>
          <Field label={t('qualification', lang)}>
            <VoiceInput value={qualification} onChange={setQualification} placeholder={t('qualification', lang)} className={inputCls} />
          </Field>
        </div>

        <Field label={t('phone', lang)}>
          <VoiceInput value={phone} onChange={setPhone} placeholder={t('phone', lang)} type="tel" className={inputCls} />
        </Field>

        <Field label={t('skill', lang)}>
          <div className="grid grid-cols-2 gap-2">
            {SKILLS.map((s) => (
              <button key={s} type="button" onClick={() => setSkill(s)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition text-sm font-medium ${skill === s ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}>
                <span className="text-lg">{SKILL_ICONS[s]}</span>
                {lang === 'en' ? SKILL_LABELS_EN[s] : SKILL_LABELS_TA[s]}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t('zone', lang)}>
          <select value={zone} onChange={(e) => setZone(e.target.value)} className={inputCls}>
            <option value="">{t('select_zone', lang)}</option>
            {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </Field>

        <Field label={t('exact_location', lang)}>
          <VoiceInput value={exactLocation} onChange={setExactLocation} placeholder={t('exact_location', lang)} className={inputCls} />
        </Field>

        <Field label={t('upload_id', lang)}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm hover:border-emerald-400 hover:text-emerald-600 transition flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            {idProofUrl ? `${t('id_uploaded', lang)} ✓` : t('tap_upload', lang)}
          </button>
          {idProofUrl && (
            <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> {t('id_verified', lang)} — {t('badge_visible', lang)}
            </div>
          )}
        </Field>

        <button onClick={save} disabled={saving}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('saving', lang)}</> : t('save', lang)}
        </button>
      </div>

      {profile && (profile.rating_count || 0) > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className={`w-5 h-5 ${n <= Math.round(profile.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
          <span className="text-sm text-slate-600">
            {(profile.avg_rating || 0).toFixed(1)} ({profile.rating_count} {t('ratings', lang)})
          </span>
        </div>
      )}
    </div>
  );
}

// ============ Job Board ============
export function JobBoard({
  jobs, appliedJobIds, onApply,
}: {
  jobs: Job[]; appliedJobIds: string[]; onApply: (job: Job) => void;
}) {
  const { lang } = useLang();
  const [selected, setSelected] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);

  const instruction = lang === 'en'
    ? 'Browse available jobs. Tap a job to see details. Then tap apply.'
    : 'கிடைக்கும் வேலைகளை உலாவவும். விவரங்கள் பார்க்க வேலையை தட்டவும். பிறகு விண்ணப்பிக்கு தட்டவும்.';

  if (selected) {
    return <JobDetail job={selected} onBack={() => setSelected(null)}
      onApply={async () => { setApplying(true); await onApply(selected); setApplying(false); setSelected(null); }}
      applied={appliedJobIds.includes(selected.id)} applying={applying} lang={lang} />;
  }

  return (
    <div className="space-y-4">
      <ScreenInstruction instruction={instruction} />
      <h1 className="text-xl font-bold text-slate-800">{t('job_board', lang)}</h1>
      {jobs.length === 0 && (
        <div className="text-center text-slate-400 py-10">
          <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">{t('no_open_jobs', lang)}</p>
        </div>
      )}
      {jobs.map((job) => {
        const shortage = computeShortage(job.workers_needed, job.workers_hired);
        const shiftText = [job.shift_date, job.shift_start, job.shift_end].filter(Boolean).join(' · ');
        return (
          <div key={job.id} className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2">
            <button onClick={() => setSelected(job)} className="w-full text-left">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>{SKILL_ICONS[job.skill]} {lang === 'en' ? SKILL_LABELS_EN[job.skill] : SKILL_LABELS_TA[job.skill]}</span>
                  </div>
                </div>
                {appliedJobIds.includes(job.id) && (
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{t('applied_already', lang)}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.zone}</span>
                {shiftText && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {shiftText}</span>}
                <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> {job.salary}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {job.workers_hired}/{job.workers_needed}</span>
              </div>
              {shortage.shortage > 0 && (
                <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-2 ${shortage.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {shortage.shortage} {t('workers_needed_short', lang)}
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function JobDetail({ job, onBack, onApply, applied, applying, lang }: {
  job: Job; onBack: () => void; onApply: () => void; applied: boolean; applying: boolean; lang: Lang;
}) {
  const shiftText = [job.shift_date, job.shift_start, job.shift_end].filter(Boolean).join(' · ');
  const detailText = lang === 'en'
    ? `${job.title}. Skill: ${SKILL_LABELS_EN[job.skill]}. Location: ${job.zone}, ${job.exact_location}. Shift: ${shiftText}. Salary: ${job.salary}. Workers needed: ${job.workers_needed}.`
    : `${job.title}. திறல்: ${SKILL_LABELS_TA[job.skill]}. இடம்: ${job.zone}, ${job.exact_location}. ஷிஃப்ட்: ${shiftText}. சம்பளம்: ${job.salary}. தொழிலாளர்கள் தேவை: ${job.workers_needed}.`;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-slate-500 flex items-center gap-1 hover:text-slate-700">← {t('back', lang)}</button>
      <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{job.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <span className="text-lg">{SKILL_ICONS[job.skill]}</span>
            {lang === 'en' ? SKILL_LABELS_EN[job.skill] : SKILL_LABELS_TA[job.skill]}
          </div>
        </div>

        <SpeakButton text={detailText} className="w-full justify-center py-2.5" />

        <div className="space-y-2 text-sm">
          <DetailRow icon={MapPin} label={t('zone_location', lang)} value={job.zone} />
          <DetailRow icon={MapPin} label={t('exact_location', lang)} value={job.exact_location} />
          <DetailRow icon={Clock} label={t('shift_timing', lang)} value={shiftText || job.shift_timing} />
          <DetailRow icon={IndianRupee} label={t('salary', lang)} value={job.salary} />
          <DetailRow icon={Users} label={t('workers_needed', lang)} value={`${job.workers_hired} / ${job.workers_needed}`} />
        </div>

        {applied ? (
          <div className="w-full py-3 rounded-xl bg-blue-50 text-blue-700 font-semibold text-center text-sm">{t('applied', lang)}</div>
        ) : (
          <button onClick={onApply} disabled={applying}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {applying ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('applying', lang)}</> : t('apply', lang)}
          </button>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-slate-400 text-xs">{label}: </span>
        <span className="text-slate-700">{value}</span>
      </div>
    </div>
  );
}

// ============ My Applications ============
export function MyApplications({ applications, onCheckIn }: { applications: Application[]; onCheckIn: (appId: string) => void }) {
  const { lang } = useLang();
  const instruction = lang === 'en'
    ? 'Your applications. Waiting means the manager has not accepted yet. Hired means you got the job.'
    : 'உங்கள் விண்ணப்பங்கள். காத்திருக்கிறது என்றால் மேலாளர் இன்னும் ஏற்கவில்லை. நியமிக்கப்பட்டது என்றால் வேலை கிடைத்தது.';

  return (
    <div className="space-y-4">
      <ScreenInstruction instruction={instruction} />
      <h1 className="text-xl font-bold text-slate-800">{t('my_applications', lang)}</h1>
      {applications.length === 0 && (
        <div className="text-center text-slate-400 py-10">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">{t('no_applications', lang)}</p>
        </div>
      )}
      {applications.map((app) => {
        const job = app.job;
        if (!job) return null;
        const shiftText = [job.shift_date, job.shift_start, job.shift_end].filter(Boolean).join(' · ');
        return (
          <div key={app.id} className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">{job.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{SKILL_ICONS[job.skill]}</span>
                  <span>{job.zone}</span>
                  {shiftText && <span>· {shiftText}</span>}
                </div>
              </div>
              <StatusBadge status={app.status} lang={lang} />
            </div>

            {app.status === 'pending' && (
              <div className="bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700">{t('applied', lang)}</div>
            )}

            {app.status === 'accepted' && app.working_id && (
              <div className="bg-emerald-50 rounded-xl px-3 py-3 space-y-1">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">{t('hired', lang)}!</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
                  <span className="text-xs text-slate-500">{t('working_id', lang)}:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{app.working_id}</span>
                </div>
                <button onClick={() => onCheckIn(app.id)}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> {t('arrived', lang)}
                </button>
              </div>
            )}

            {app.status === 'checked_in' && app.working_id && (
              <div className="bg-blue-50 rounded-xl px-3 py-2 space-y-1">
                <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
                  <CheckCircle className="w-4 h-4" /> {t('checked_in', lang)}
                </div>
                <div className="text-xs text-slate-500">{t('working_id', lang)}: <span className="font-mono font-bold text-emerald-700">{app.working_id}</span></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status, lang }: { status: string; lang: Lang }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: t('applied_already', lang), cls: 'bg-amber-100 text-amber-700' },
    accepted: { label: t('hired', lang), cls: 'bg-emerald-100 text-emerald-700' },
    checked_in: { label: t('checked_in', lang), cls: 'bg-blue-100 text-blue-700' },
    rejected: { label: t('rejected', lang), cls: 'bg-red-100 text-red-700' },
    expired: { label: t('expired', lang), cls: 'bg-slate-100 text-slate-500' },
    completed: { label: t('completed', lang), cls: 'bg-slate-100 text-slate-600' },
  };
  const m = map[status] || map.pending;
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.cls}`}>{m.label}</span>;
}

// ============ Notifications ============
export function NotificationsScreen({
  notifications, onMarkRead,
}: {
  notifications: Notification[]; onMarkRead: (id: string) => void;
}) {
  const { lang } = useLang();
  const instruction = lang === 'en'
    ? 'Your notifications. Tap listen to hear them. Tap mark as read when done.'
    : 'உங்கள் அறிவிப்புகள். கேட்க கேள் தட்டவும். முடிந்ததும் படித்ததாக குறி தட்டவும்.';

  return (
    <div className="space-y-4">
      <ScreenInstruction instruction={instruction} />
      <h1 className="text-xl font-bold text-slate-800">{t('notifications', lang)}</h1>
      {notifications.length === 0 && (
        <div className="text-center text-slate-400 py-10">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">{t('no_notifications', lang)}</p>
        </div>
      )}
      {notifications.map((n) => (
        <div key={n.id} className={`rounded-2xl p-4 border space-y-2 ${n.read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100'}`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">{n.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{n.body}</p>
            </div>
            {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
          </div>
          {n.working_id && (
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-100">
              <span className="text-xs text-slate-500">{t('working_id', lang)}:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">{n.working_id}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <SpeakButton text={n.body} />
            {!n.read && <button onClick={() => onMarkRead(n.id)} className="text-xs text-blue-600 hover:underline">{t('mark_read', lang)}</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
