import type { ReactNode } from 'react';
import { useLang } from '@/lib/lang-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { Package, Truck, LogOut, Globe, Bell, Home, Briefcase, Search, FileText, User, ClipboardList, Volume2 } from 'lucide-react';
import { VoiceHelpToggle } from '@/components/voice-ui';

export type NavKey =
  | 'dashboard'
  | 'post_job'
  | 'search_workers'
  | 'my_postings'
  | 'job_board'
  | 'my_profile'
  | 'notifications'
  | 'my_applications';

interface Props {
  current: NavKey;
  onNavigate: (k: NavKey) => void;
  children: ReactNode;
  notificationCount?: number;
  pageTitle?: string;
}

export default function Shell({ current, onNavigate, children, notificationCount = 0, pageTitle }: Props) {
  const { lang, toggle } = useLang();
  const { profile } = useAuth();
  const isRecruiter = profile?.role === 'recruiter';

  const navItems: { key: NavKey; label: string; icon: typeof Home }[] = isRecruiter
    ? [
        { key: 'dashboard', label: t('dashboard', lang), icon: Home },
        { key: 'post_job', label: t('post_job', lang), icon: FileText },
        { key: 'search_workers', label: t('search_workers', lang), icon: Search },
        { key: 'my_postings', label: t('my_postings', lang), icon: Briefcase },
      ]
    : [
        { key: 'dashboard', label: t('dashboard', lang), icon: Home },
        { key: 'job_board', label: t('job_board', lang), icon: Search },
        { key: 'my_applications', label: t('my_applications', lang), icon: ClipboardList },
        { key: 'my_profile', label: t('my_profile', lang), icon: User },
      ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const speakTitle = () => {
    if (pageTitle && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(pageTitle);
      utter.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      utter.rate = 0.85;
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRecruiter ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              {isRecruiter ? <Package className="w-5 h-5 text-white" /> : <Truck className="w-5 h-5 text-white" />}
            </div>
            <span className="font-bold text-slate-800 text-lg">{t('app_name', lang)}</span>
            {pageTitle && (
              <button onClick={speakTitle} className="p-1 rounded-lg hover:bg-slate-100 transition">
                <Volume2 className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isRecruiter && (
              <button
                onClick={() => onNavigate('notifications')}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {notificationCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            )}
            <VoiceHelpToggle />
            <button
              onClick={toggle}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition"
            >
              <Globe className="w-4 h-4" />
              {lang === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <LogOut className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-5 pb-24 max-w-2xl mx-auto w-full">{children}</main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
        <div className="flex justify-around max-w-2xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2.5 flex-1 transition ${
                  active ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
