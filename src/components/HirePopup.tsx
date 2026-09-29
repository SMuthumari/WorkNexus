import { useState, useEffect, useRef } from 'react';
import { useLang } from '@/lib/lang-context';
import { t } from '@/lib/i18n';
import { speak, stopSpeaking, isSpeechSupported, speakSlowly } from '@/lib/voice';
import { Volume2, X, BadgeCheck } from 'lucide-react';
import { VoiceYesNo } from './voice-ui';
import type { Notification } from '@/lib/types';

interface Props {
  notification: Notification;
  onClose: () => void;
}

export default function HirePopup({ notification, onClose }: Props) {
  const { lang } = useLang();
  const [hasSpoken, setHasSpoken] = useState(false);
  const [showRepeatPrompt, setShowRepeatPrompt] = useState(false);
  const spokenRef = useRef(false);

  // Build the speech text from the notification body
  const speechText = notification.body;

  const doSpeak = (slow: boolean = false) => {
    if (!isSpeechSupported()) return;
    if (slow) {
      speakSlowly(speechText, lang, () => setShowRepeatPrompt(true));
    } else {
      speak(speechText, lang, () => setShowRepeatPrompt(true));
    }
  };

  // Auto-speak on first user interaction (tap anywhere)
  useEffect(() => {
    const handleFirstTap = () => {
      if (!spokenRef.current) {
        spokenRef.current = true;
        setHasSpoken(true);
        doSpeak(true);
      }
    };
    document.addEventListener('click', handleFirstTap, { once: true });
    document.addEventListener('touchstart', handleFirstTap, { once: true });
    return () => {
      document.removeEventListener('click', handleFirstTap);
      document.removeEventListener('touchstart', handleFirstTap);
      stopSpeaking();
    };
  }, []);

  const handleListen = () => {
    stopSpeaking();
    doSpeak(false);
  };

  const handleYes = () => {
    setShowRepeatPrompt(false);
    stopSpeaking();
    doSpeak(true);
  };

  const handleNo = () => {
    stopSpeaking();
    setShowRepeatPrompt(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <BadgeCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('you_are_hired', lang)}</h2>
              <p className="text-emerald-100 text-sm">{notification.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Working ID prominent */}
          {notification.working_id && (
            <div className="bg-emerald-50 rounded-2xl px-5 py-4 text-center border-2 border-emerald-200">
              <p className="text-xs text-slate-500 mb-1">{t('working_id', lang)}</p>
              <p className="text-3xl font-mono font-bold text-emerald-700">{notification.working_id}</p>
            </div>
          )}

          {/* Notification body */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3">
            <p className="text-sm text-slate-700 leading-relaxed">{notification.body}</p>
          </div>

          {/* Big Listen button */}
          <button
            onClick={handleListen}
            className="w-full py-5 rounded-2xl bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Volume2 className="w-7 h-7" />
            {t('listen_to_details', lang)}
          </button>

          {/* Tap hint before first speech */}
          {!hasSpoken && (
            <p className="text-center text-xs text-slate-400 animate-pulse">{t('tap_anywhere', lang)}</p>
          )}

          {/* Repeat prompt */}
          {showRepeatPrompt && (
            <div className="space-y-3 pt-2">
              <p className="text-center text-base font-semibold text-slate-700">{t('do_you_want_repeat', lang)}</p>
              <VoiceYesNo onYes={handleYes} onNo={handleNo} />
            </div>
          )}

          {/* Close */}
          {!showRepeatPrompt && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-500 font-semibold hover:bg-slate-50 transition"
            >
              {t('close', lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
