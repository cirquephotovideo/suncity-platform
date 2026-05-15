import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { translatePage, translateLocation, translateEvent } from './actions';

export default async function TranslationsPage() {
  await requireAdmin();

  // Pages without EN translation
  const allPages = await prisma.page.findMany({ orderBy: { slug: 'asc' } });
  const pagesWithEn = new Set(allPages.filter((p) => p.locale === 'en').map((p) => p.slug));
  const missingPageEn = allPages.filter((p) => p.locale === 'fr' && !pagesWithEn.has(p.slug));

  // Locations without EN translation
  const allLocations = await prisma.location.findMany({
    include: { translations: { select: { locale: true } } },
    orderBy: { slug: 'asc' },
  });
  const missingLocationEn = allLocations.filter(
    (l) => !l.translations.some((t) => t.locale === 'en'),
  );

  // Events without EN translation (upcoming only)
  const allEvents = await prisma.event.findMany({
    where: { startsAt: { gte: new Date() } },
    include: { translations: { select: { locale: true } } },
    orderBy: { startsAt: 'asc' },
    take: 50,
  });
  const missingEventEn = allEvents.filter(
    (e) => !e.translations.some((t) => t.locale === 'en'),
  );

  const total = missingPageEn.length + missingLocationEn.length + missingEventEn.length;

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Traductions manquantes (EN)</h1>
      <p className="text-textMuted text-sm mb-6">
        {total === 0
          ? 'Toutes les traductions EN sont à jour.'
          : `${total} élément(s) sans version anglaise.`}
      </p>

      {/* Pages */}
      {missingPageEn.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl mb-3">Pages ({missingPageEn.length})</h2>
          <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg text-textMuted text-left">
                <tr>
                  <th className="px-4 py-2.5">Slug</th>
                  <th className="px-4 py-2.5">Titre FR</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {missingPageEn.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-2.5 font-mono text-xs">{p.slug}</td>
                    <td className="px-4 py-2.5">{p.title}</td>
                    <td className="px-4 py-2.5 text-right">
                      <form action={translatePage.bind(null, p.id)}>
                        <button type="submit" className="btn-outline text-xs py-1 px-3">
                          Traduire avec IA
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Locations */}
      {missingLocationEn.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl mb-3">Lieux ({missingLocationEn.length})</h2>
          <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg text-textMuted text-left">
                <tr>
                  <th className="px-4 py-2.5">Slug</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {missingLocationEn.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-4 py-2.5 font-mono text-xs">{l.slug}</td>
                    <td className="px-4 py-2.5 text-right">
                      <form action={translateLocation.bind(null, l.id)}>
                        <button type="submit" className="btn-outline text-xs py-1 px-3">
                          Traduire avec IA
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Events */}
      {missingEventEn.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl mb-3">Événements à venir ({missingEventEn.length})</h2>
          <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg text-textMuted text-left">
                <tr>
                  <th className="px-4 py-2.5">Slug</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {missingEventEn.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-2.5 font-mono text-xs">{e.slug}</td>
                    <td className="px-4 py-2.5 text-xs text-textMuted">
                      {e.startsAt.toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <form action={translateEvent.bind(null, e.id)}>
                        <button type="submit" className="btn-outline text-xs py-1 px-3">
                          Traduire avec IA
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {total === 0 && (
        <div className="bg-bgAlt border border-border rounded-lg p-10 text-center text-textMuted">
          Aucune traduction manquante.
        </div>
      )}
    </div>
  );
}
