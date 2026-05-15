'use client';
import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function AskSunCityWidget() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Bonjour ! Posez-moi vos questions sur Sun City : horaires, tarifs, soirées, espaces…' },
  ]);

  function ask() {
    if (!msg.trim()) return;
    const userMsg = msg.trim();
    setHistory(h => [...h, { role: 'user', text: userMsg }, { role: 'bot', text: 'Cette fonctionnalité arrive bientôt. En attendant : tarifs sur /tarifs, agenda sur /agenda, ou contactez-nous via /contact.' }]);
    setMsg('');
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
              aria-label="Demandez à Sun City"
              className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary text-bg shadow-2xl flex items-center justify-center hover:scale-110 transition">
        <MessageCircle className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm flex items-end md:items-center justify-end md:justify-end p-0 md:p-6">
          <div className="bg-bgAlt border border-border rounded-t-2xl md:rounded-2xl w-full md:w-96 h-[80vh] md:h-[600px] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <p className="font-display text-lg text-primary">Demandez à Sun City</p>
                <p className="text-xs text-textMuted">IA · disponible 24/7</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="text-textMuted hover:text-primary"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.map((m, i) => (
                <div key={i} className={`text-sm ${m.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-[80%] px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-primary text-bg' : 'bg-bg border border-border'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); ask(); }} className="p-3 border-t border-border flex gap-2">
              <input value={msg} onChange={e => setMsg(e.target.value)}
                     placeholder="Tarifs, horaires, soirées…"
                     className="flex-1 bg-bg border border-border rounded px-3 py-2 text-sm focus:border-primary outline-none" />
              <button type="submit" className="bg-primary text-bg rounded px-3 hover:bg-accent transition" aria-label="Envoyer"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
