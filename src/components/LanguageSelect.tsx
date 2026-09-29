import { useLang } from '@/lib/lang-context';
import { speak, isSpeechSupported } from '@/lib/voice';
import type { Lang } from '@/lib/constants';
import { Package, Volume2, Globe } from 'lucide-react';

export default function LanguageSelect() {
  const { setLang, setLangChosen } = useLang();

  const pick = (l: Lang) => {
    const name = l === 'en' ? 'English' : 'தமிழ்';
    if (isSpeechSupported()) speak(name, l);
    setLang(l);
    setLangChosen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">WorkForce Mesh</h1>
          <div className="flex items-center justify-center gap-2 mt-3 text-blue-200">
            <Globe className="w-5 h-5" />
            <p className="text-lg font-medium">Choose Your Language</p>
          </div>
          <p className="text-blue-300 text-lg font-medium mt-1">உங்கள் மொழியைத் தேர்வு செய்யவும்</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => pick('en')}
            className="w-full flex items-center gap-4 p-6 rounded-2xl bg-white/10 border-2 border-white/20 hover:border-blue-400 hover:bg-blue-500/20 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">EN</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-xl font-bold text-white">English</p>
            </div>
            <Volume2 className="w-6 h-6 text-blue-300 group-hover:scale-125 transition-transform flex-shrink-0" />
          </button>

          <button
            onClick={() => pick('ta')}
            className="w-full flex items-center gap-4 p-6 rounded-2xl bg-white/10 border-2 border-white/20 hover:border-emerald-400 hover:bg-emerald-500/20 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">த</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-xl font-bold text-white">தமிழ்</p>
            </div>
            <Volume2 className="w-6 h-6 text-emerald-300 group-hover:scale-125 transition-transform flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
