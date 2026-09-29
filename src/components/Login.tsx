import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/lang-context';
import { t } from '@/lib/i18n';
import type { Role } from '@/lib/types';
import { Package, Truck, ArrowRight, Globe, Volume2 } from 'lucide-react';
import { VoiceInput, SpeakButton, ScreenInstruction, Field } from '@/components/voice-ui';

interface Props {
  initialRole: Role;
  onRoleChange: (r: Role) => void;
}

export default function Login({ initialRole, onRoleChange }: Props) {
  const { lang, toggle } = useLang();
  const [role, setRole] = useState<Role>(initialRole);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const instruction = lang === 'en'
    ? 'Welcome. Select if you are a recruiter or a worker. Then enter your email and password.'
    : 'வரவேற்கிறோம். நீங்கள் நிறுவனத்தாரா அல்லது தொழிலாளரா என்பதைத் தேர்வு செய்யவும். பிறகு உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && role === 'recruiter') {
      if (!companyName || !companyAddress || !contactNumber) {
        setError(t('fill_company_details', lang));
        return;
      }
    }

    setLoading(true);

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        const profileData: Record<string, unknown> = {
          id: data.user.id,
          email,
          role,
          full_name: fullName || email.split('@')[0],
        };
        if (role === 'recruiter') {
          profileData.company_name = companyName;
          profileData.company_address = companyAddress;
          profileData.contact_number = contactNumber;
        } else {
          profileData.phone = phone;
        }
        const { error: profileError } = await supabase.from('profiles').insert(profileData);
        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
    }
    setLoading(false);
  };

  const pickRole = (r: Role) => {
    setRole(r);
    onRoleChange(r);
  };

  const formText = lang === 'en'
    ? `Sign ${mode === 'signin' ? 'in' : 'up'} as ${role === 'recruiter' ? 'recruiter' : 'worker'}. Enter your details.`
    : `${role === 'recruiter' ? 'நிறுவனத்தாராக' : 'தொழிலாளராக'} ${mode === 'signin' ? 'உள்நுழைய' : 'பதிவு செய்ய'}. உங்கள் விவரங்களை உள்ளிடவும்.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col">
      <ScreenInstruction instruction={instruction} />
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">{t('app_name', lang)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const text = lang === 'en' ? 'WorkForce Mesh. Connect businesses with flexible workers.' : 'வொர்க்ஃபோர்ஸ் மெஷ். வணிகங்களை தொழிலாளர்களுடன் இணைக்க.';
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition"
          >
            <Volume2 className="w-4 h-4" />
            {t('listen', lang)}
          </button>
          <button
            onClick={toggle}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition"
          >
            <Globe className="w-4 h-4" />
            {lang === 'en' ? 'தமிழ்' : 'English'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-5 pb-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">{t('app_name', lang)}</h1>
            <p className="text-blue-200 text-sm">{t('app_tagline', lang)}</p>
          </div>

          {/* Role Selection */}
          <div className="mb-4">
            <p className="text-blue-200 text-sm font-medium mb-2 text-center">{t('select_role', lang)}</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => pickRole('recruiter')}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                  role === 'recruiter'
                    ? 'border-blue-400 bg-blue-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-blue-200 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-sm text-center">{t('im_recruiter', lang)}</span>
              </button>
              <button
                onClick={() => pickRole('worker')}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                  role === 'worker'
                    ? 'border-emerald-400 bg-emerald-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-blue-200 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/30 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-sm text-center">{t('im_worker', lang)}</span>
              </button>
            </div>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 text-center">
                {mode === 'signin' ? t('sign_in', lang) : t('sign_up', lang)}
              </h2>
              <SpeakButton text={formText} />
            </div>

            {mode === 'signup' && (
              <Field label={t('full_name', lang)}>
                <VoiceInput value={fullName} onChange={setFullName} placeholder={t('full_name', lang)} className={inputCls} />
              </Field>
            )}

            {mode === 'signup' && role === 'recruiter' && (
              <>
                <Field label={t('company_name', lang)}>
                  <VoiceInput value={companyName} onChange={setCompanyName} placeholder={t('company_name', lang)} className={inputCls} />
                </Field>
                <Field label={t('company_address', lang)}>
                  <VoiceInput value={companyAddress} onChange={setCompanyAddress} placeholder={t('company_address', lang)} className={inputCls} />
                </Field>
                <Field label={t('contact_number', lang)}>
                  <VoiceInput value={contactNumber} onChange={setContactNumber} placeholder={t('contact_number', lang)} className={inputCls} />
                </Field>
              </>
            )}

            {mode === 'signup' && role === 'worker' && (
              <Field label={t('phone', lang)}>
                <VoiceInput value={phone} onChange={setPhone} placeholder={t('phone', lang)} className={inputCls} />
              </Field>
            )}

            <Field label={t('email', lang)}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="you@email.com"
              />
            </Field>

            <Field label={t('password', lang)}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? t('loading', lang) : mode === 'signin' ? t('sign_in', lang) : t('sign_up', lang)}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="w-full text-sm text-blue-600 hover:underline text-center"
            >
              {mode === 'signin' ? t('no_account', lang) : t('have_account', lang)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm';
