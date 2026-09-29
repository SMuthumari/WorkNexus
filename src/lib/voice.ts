import type { Lang } from './constants';

export function getSpeechLang(lang: Lang): string {
  return lang === 'ta' ? 'ta-IN' : 'en-IN';
}

export function speak(text: string, lang: Lang, onEnd?: () => void, onStart?: () => void): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = getSpeechLang(lang);
  utter.rate = 0.85;
  utter.pitch = 1;
  if (onStart) utter.onstart = onStart;
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function startRecognition(
  lang: Lang,
  onResult: (transcript: string) => void,
  onEnd?: () => void,
  onError?: () => void
): (() => void) | null {
  const w = window as any;
  const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!SR) return null;

  const recognition = new SR();
  recognition.lang = getSpeechLang(lang);
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (e: any) => {
    const transcript = e.results[0][0].transcript;
    onResult(transcript);
  };
  if (onEnd) recognition.onend = onEnd;
  if (onError) recognition.onerror = onError;

  try {
    recognition.start();
  } catch {
    // already started
  }

  return () => {
    try {
      recognition.stop();
    } catch {
      // ignore
    }
  };
}

export function speakSlowly(text: string, lang: Lang, onEnd?: () => void): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = getSpeechLang(lang);
  utter.rate = 0.7;
  utter.pitch = 1;
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
}
