import { useState, useRef, useEffect, type FormEvent } from 'react';
import { ASSISTANT_URL } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/lang-context';
import { t } from '@/lib/i18n';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  screenContext: string;
}

export default function Assistant({ screenContext }: Props) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      };
      const resp = await fetch(ASSISTANT_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMsg, context: screenContext, lang }),
      });

      if (!resp.ok) throw new Error('Request failed');
      const data = await resp.json();
      const reply = data.reply || data.error || 'Sorry, I could not understand.';
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: lang === 'en' ? 'Sorry, something went wrong. Please try again.' : 'மன்னிக்கவும், ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all flex items-center justify-center"
          aria-label={t('assistant', lang)}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-96 h-[70vh] sm:h-[500px] sm:bottom-5 sm:right-5 sm:rounded-2xl rounded-t-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">{t('assistant', lang)}</div>
                <div className="text-xs text-blue-100">WorkNexus Helper</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-8">
                <Bot className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>
                  {lang === 'en'
                    ? 'Hi! I am your WorkNexus assistant. Ask me anything about using this app.'
                    : 'வணக்கம்! நான் உங்கள் வொர்க்நெக்ஸஸ் உதவியாளர். எதையும் கேளுங்கள்.'}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-700 shadow-sm rounded-bl-sm border border-slate-100'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-3 py-2 rounded-2xl shadow-sm border border-slate-100">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex gap-2 p-3 border-t border-slate-100 bg-white flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ask_question', lang)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-800"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-40 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
