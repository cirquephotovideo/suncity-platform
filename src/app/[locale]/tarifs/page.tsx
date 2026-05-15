import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/format';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tariffs' });
  return { title: `${t('title')} — Sun City Paris`, description: t('intro') };
}

export default async function TariffsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('tariffs');

  const tariffs = await prisma.tariff.findMany({
    where: { active: true },
    include: { translations: { where: { locale: locale as any } } },
    orderBy: { orderIndex: 'asc' },
  });

  return (
    <section className="section">
      <p className="eyebrow mb-3">Sun City</p>
      <h1 className="font-display text-4xl md:text-5xl mb-4">{t('title')}</h1>
      <p className="text-textMuted mb-10">{t('intro')}</p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bgAlt text-textMuted">
            <tr>
              <th className="text-left px-4 py-3">Tarif</th>
              <th className="text-left px-4 py-3">Conditions</th>
              <th className="text-right px-4 py-3">Prix</th>
            </tr>
          </thead>
          <tbody>
            {tariffs.map((tariff) => {
              const tr = tariff.translations[0];
              return (
                <tr key={tariff.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{tr?.label ?? tariff.code}</td>
                  <td className="px-4 py-3 text-textMuted">{tariff.conditionLabel ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-primary font-semibold">{formatPrice(tariff.priceCents, locale === 'fr' ? 'fr-FR' : 'en-GB')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-textMuted mt-6">{t('extraTowel')} · {t('freePass')}</p>
    </section>
  );
}
