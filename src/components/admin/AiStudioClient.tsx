'use client';
import { useState } from 'react';

type Tab = 'generate' | 'translate';

export default function AiStudioClient() {
  const [tab, setTab] = useState<Tab>('generate');

  // Generate state
  const [genPrompt, setGenPrompt] = useState('');
  const [genKind, setGenKind] = useState<'text' | 'image'>('text');
  const [genResult, setGenResult] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');

  // Translate state
  const [trText, setTrText] = useState('');
  const [trFrom, setTrFrom] = useState('fr');
  const [trTo, setTrTo] = useState('en');
  const [trResult, setTrResult] = useState('');
  const [trLoading, setTrLoading] = useState(false);
  const [trError, setTrError] = useState('');

  async function handleGenerate() {
    setGenLoading(true);
    setGenError('');
    setGenResult('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: genPrompt, kind: genKind }),
      });
      const json = await res.json();
      if (!res.ok) setGenError(json.error ?? 'Erreur serveur');
      else setGenResult(json.text ?? '');
    } catch {
      setGenError('Erreur réseau');
    } finally {
      setGenLoading(false);
    }
  }

  async function handleTranslate() {
    setTrLoading(true);
    setTrError('');
    setTrResult('');
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trText, from: trFrom, to: trTo }),
      });
      const json = await res.json();
      if (!res.ok) setTrError(json.error ?? 'Erreur serveur');
      else setTrResult(json.text ?? '');
    } catch {
      setTrError('Erreur réseau');
    } finally {
      setTrLoading(false);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {(['generate', 'translate'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-textMuted hover:text-text'
            }`}
          >
            {t === 'generate' ? 'Générer texte / image' : 'Traduire'}
          </button>
        ))}
      </div>

      {/* Generate tab */}
      {tab === 'generate' && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm mb-1 font-medium">Type de génération</label>
            <select
              value={genKind}
              onChange={(e) => setGenKind(e.target.value as 'text' | 'image')}
              className="bg-bgAlt border border-border rounded px-3 py-2 text-sm"
            >
              <option value="text">Texte</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">Prompt</label>
            <textarea
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              rows={5}
              placeholder="Décrivez ce que vous souhaitez générer…"
              className="w-full bg-bgAlt border border-border rounded px-3 py-2 text-sm resize-y"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={genLoading || !genPrompt.trim()}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {genLoading ? 'Génération…' : 'Générer'}
          </button>
          {genError && <p className="text-danger text-sm">{genError}</p>}
          {genResult && (
            <div className="bg-bgAlt border border-border rounded-lg p-4 text-sm whitespace-pre-wrap">
              {genResult}
            </div>
          )}
        </div>
      )}

      {/* Translate tab */}
      {tab === 'translate' && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm mb-1 font-medium">Texte à traduire</label>
            <textarea
              value={trText}
              onChange={(e) => setTrText(e.target.value)}
              rows={6}
              placeholder="Collez le texte à traduire…"
              className="w-full bg-bgAlt border border-border rounded px-3 py-2 text-sm resize-y"
            />
          </div>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs mb-1 text-textMuted">De</label>
              <select
                value={trFrom}
                onChange={(e) => setTrFrom(e.target.value)}
                className="bg-bgAlt border border-border rounded px-3 py-2 text-sm"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1 text-textMuted">Vers</label>
              <select
                value={trTo}
                onChange={(e) => setTrTo(e.target.value)}
                className="bg-bgAlt border border-border rounded px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <button
              onClick={handleTranslate}
              disabled={trLoading || !trText.trim()}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {trLoading ? 'Traduction…' : 'Traduire'}
            </button>
          </div>
          {trError && <p className="text-danger text-sm">{trError}</p>}
          {trResult && (
            <div className="bg-bgAlt border border-border rounded-lg p-4 text-sm whitespace-pre-wrap">
              {trResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
