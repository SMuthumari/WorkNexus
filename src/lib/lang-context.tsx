import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Lang } from './constants';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  voiceHelp: boolean;
  setVoiceHelp: (v: boolean) => void;
  langChosen: boolean;
  setLangChosen: (v: boolean) => void;
}

const LangContext = createContext<LangContextValue | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('wfm_lang') : null;
    return (saved as Lang) || 'en';
  });
  const [voiceHelp, setVoiceHelpState] = useState<boolean>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('wfm_voice_help') : null;
    return saved !== 'off';
  });
  const [langChosen, setLangChosen] = useState<boolean>(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('wfm_lang') !== null;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof localStorage !== 'undefined') localStorage.setItem('wfm_lang', l);
  };
  const toggle = () => setLang(lang === 'en' ? 'ta' : 'en');
  const setVoiceHelp = (v: boolean) => {
    setVoiceHelpState(v);
    if (typeof localStorage !== 'undefined') localStorage.setItem('wfm_voice_help', v ? 'on' : 'off');
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'ta' ? 'ta' : 'en';
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, toggle, voiceHelp, setVoiceHelp, langChosen, setLangChosen }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
