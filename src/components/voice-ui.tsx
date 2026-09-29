import { useRef, useEffect, type ReactNode } from 'react';
import { useLang } from '@/lib/lang-context';
import { t } from '@/lib/i18n';
import { speak, stopSpeaking, isSpeechSupported, startRecognition, isRecognitionSupported, speakSlowly } from '@/lib/voice';
import type { Lang } from '@/lib/constants';
import { Mic, Volume2 } from 'lucide-react';

// ============ Voice Input Field ============
export function VoiceInput({
  value,
  onChange,
  placeholder,
  className,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) {
  const { lang, voiceHelp } = useLang();
  const [listening, setListening] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  const start = () => {
    if (!isRecognitionSupported()) {
      alert(t('voice_not_supported', lang));
      return;
    }
    setListening(true);
    stopRef.current = startRecognition(
      lang,
      (transcript) => onChange(transcript),
      () => setListening(false),
      () => setListening(false)
    );
  };

  const stop = () => {
    if (stopRef.current) stopRef.current();
    setListening(false);
  };

  return (
    <div className="flex gap-2">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className || inputCls}
      />
      <button
        type="button"
        onClick={listening ? stop : start}
        className={`px-3 rounded-xl border-2 transition flex items-center justify-center flex-shrink-0 ${
          listening ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'
        }`}
      >
        <Mic className="w-5 h-5" />
      </button>
    </div>
  );
}

// ============ Speak Button ============
export function SpeakButton({ text, className }: { text: string; className?: string }) {
  const { lang } = useLang();
  const [speaking, setSpeaking] = useState(false);

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      speak(text, lang, () => setSpeaking(false), () => setSpeaking(true));
    }
  };

  if (!isSpeechSupported()) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition font-semibold text-sm ${
        speaking
          ? 'bg-blue-100 text-blue-700'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      } ${className || ''}`}
    >
      <Volume2 className="w-4 h-4" />
      {speaking ? t('stop', lang) : t('listen', lang)}
    </button>
  );
}

// ============ Screen Instruction (speaks once on mount if voiceHelp is on) ============
export function ScreenInstruction({ instruction }: { instruction: string }) {
  const { lang, voiceHelp } = useLang();
  const spokenRef = useRef(false);

  useEffect(() => {
    if (voiceHelp && !spokenRef.current && isSpeechSupported()) {
      spokenRef.current = true;
      const timer = setTimeout(() => speak(instruction, lang), 500);
      return () => clearTimeout(timer);
    }
  }, [instruction, lang, voiceHelp]);

  return null;
}

// ============ Voice Help Toggle ============
export function VoiceHelpToggle() {
  const { lang, voiceHelp, setVoiceHelp } = useLang();
  return (
    <button
      onClick={() => setVoiceHelp(!voiceHelp)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
        voiceHelp ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
      }`}
    >
      <Volume2 className="w-4 h-4" />
      {t('voice_help_btn', lang)}
    </button>
  );
}

// ============ Voice Yes/No buttons ============
export function VoiceYesNo({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  const { lang } = useLang();
  const [listening, setListening] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  const startListen = () => {
    if (!isRecognitionSupported()) return;
    setListening(true);
    stopRef.current = startRecognition(
      lang,
      (transcript) => {
        const lower = transcript.toLowerCase();
        if (lang === 'ta') {
          if (lower.includes('ஆம்') || lower.includes('ஆம')) onYes();
          else if (lower.includes('இல்லை') || lower.includes('இல்ல')) onNo();
        } else {
          if (lower.includes('yes') || lower.includes('yeah') || lower.includes('ok')) onYes();
          else if (lower.includes('no') || lower.includes('nope')) onNo();
        }
      },
      () => setListening(false),
      () => setListening(false)
    );
  };

  const stop = () => {
    if (stopRef.current) stopRef.current();
    setListening(false);
  };

  return (
    <div className="flex gap-3 items-center justify-center">
      <button
        onClick={onYes}
        className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white text-lg font-bold hover:bg-emerald-700 transition active:scale-95"
      >
        {t('yes', lang)}
      </button>
      <button
        onClick={onNo}
        className="flex-1 py-4 rounded-2xl bg-slate-200 text-slate-600 text-lg font-bold hover:bg-slate-300 transition active:scale-95"
      >
        {t('no', lang)}
      </button>
      <button
        onClick={listening ? stop : startListen}
        className={`px-4 py-4 rounded-2xl border-2 transition flex items-center justify-center ${
          listening ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-slate-300 text-slate-400'
        }`}
      >
        <Mic className="w-6 h-6" />
      </button>
    </div>
  );
}

// ============ Shared ============
export const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

import { useState } from 'react';
