import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { SKINS, SKIN_KEYS, getSkin } from '@/lib/skins';
import { setActiveSkin } from './actions';
import Link from 'next/link';

export default async function SkinsPage() {
  await requireAdmin();
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  const activeKey = settings?.themeKey ?? 'sun';
  const active = getSkin(activeKey);

  return (
    <div>
      <div className="relative rounded-xl p-6 mb-8 overflow-hidden border border-primary/40 bg-gradient-to-r from-primary/30 via-secondary/40 to-primary/30 shadow-[0_0_60px_rgba(201,162,75,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,162,75,0.4),transparent_50%)] pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-bg/60 border border-primary flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(201,162,75,0.5)]">🎨</div>
          <div>
            <h1 className="font-display text-3xl tracking-tight">Skins du site</h1>
            <p className="text-sm text-textMuted mt-1">
              Skin actif : <span className="text-primary font-medium">{active.emoji} {active.label}</span>
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-textMuted mb-6">
        Choisis le look complet du site public. Le skin actif est rendu sur <code className="text-primary bg-bg/60 px-1.5 py-0.5 rounded text-xs">/fr</code> et propage son accent au back-office.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SKIN_KEYS.map(key => {
          const skin = SKINS[key];
          const isActive = key === activeKey;
          return (
            <div key={key} className={`rounded-xl border-2 overflow-hidden transition ${isActive ? 'border-primary shadow-[0_0_40px_rgba(201,162,75,0.4)]' : 'border-border hover:border-primary/60'}`}>
              {/* Preview band */}
              <div className="h-32 relative overflow-hidden flex items-center justify-center" style={{ background: skin.bg, color: skin.fg }}>
                <div className="absolute inset-0" style={{
                  background: `radial-gradient(circle at 30% 30%, ${skin.accent}55 0%, transparent 60%), radial-gradient(circle at 70% 70%, ${skin.accent}33 0%, transparent 60%)`,
                }} />
                <div className="relative text-center">
                  <p className="text-5xl mb-1">{skin.emoji}</p>
                  <p className="text-xs uppercase tracking-[0.2em] opacity-80">{skin.label.split('—')[1]?.trim() ?? skin.label}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: skin.accent, boxShadow: `0 0 12px ${skin.accent}` }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: skin.fg, opacity: 0.6 }} />
                </div>
              </div>
              <div className="p-5 bg-bgAlt">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-display text-lg">{skin.label}</h3>
                  {isActive && <span className="text-xs px-2 py-0.5 bg-primary text-bg rounded-full font-semibold">ACTIF</span>}
                </div>
                <p className="text-sm text-textMuted mb-4">{skin.vibe}</p>
                <div className="flex gap-2 items-center">
                  {skin.route && (
                    <Link href={`/fr${skin.route}`} target="_blank" className="btn-outline text-xs">
                      👁 Aperçu /fr{skin.route}
                    </Link>
                  )}
                  {!skin.route && (
                    <Link href="/fr" target="_blank" className="btn-outline text-xs">
                      👁 Aperçu /fr
                    </Link>
                  )}
                  {!isActive && (
                    <form action={setActiveSkin}>
                      <input type="hidden" name="themeKey" value={key} />
                      <button className="btn-primary text-xs">{skin.emoji} Activer</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-bgAlt border border-border rounded-lg p-5 text-sm text-textMuted">
        <h3 className="font-display text-base text-text mb-2">ℹ️ Comment ça marche</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Le skin actif détermine le rendu de <code className="text-primary">/fr</code> (la home publique).</li>
          <li>Toutes les autres pages publiques (/agenda, /lieux, /tarifs, etc.) gardent leur design Sun City classique pour l'instant.</li>
          <li>Les routes <code className="text-primary">/fr/v1</code>, <code className="text-primary">/v2</code>, <code className="text-primary">/v3</code>, <code className="text-primary">/v4</code> restent toujours accessibles pour preview indépendant.</li>
          <li>L'accent du skin (couleur dominante) est appliqué à la barre supérieure du back-office.</li>
        </ul>
      </div>
    </div>
  );
}
