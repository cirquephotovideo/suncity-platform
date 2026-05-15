import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export default async function ThemesPage() {
  await requireAdmin();
  const themes = await prisma.theme.findMany({ orderBy: { createdAt: 'asc' } });
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Thèmes</h1>
      <p className="text-sm text-textMuted mb-6">Le thème actif se règle dans <a href="/admin/settings" className="text-primary">Paramètres → Thème actif</a>. L'édition du JSON palette est manuelle pour l'instant.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map(t => {
          const palette = t.paletteJson as Record<string, string>;
          return (
            <div key={t.key} className="bg-bgAlt border border-border rounded-lg p-5">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-display text-xl">{t.label}</h3>
                {t.isDefault && <span className="text-xs text-primary">défaut</span>}
              </div>
              <p className="text-xs font-mono text-textMuted mb-3">{t.key}</p>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {Object.entries(palette).slice(0, 10).map(([k, v]) => (
                  <div key={k} title={`${k}: ${v}`} className="aspect-square rounded" style={{ background: String(v) }} />
                ))}
              </div>
              <p className="text-xs text-textMuted">Display : {t.fontDisplay ?? 'default'} · Body : {t.fontBody ?? 'default'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
