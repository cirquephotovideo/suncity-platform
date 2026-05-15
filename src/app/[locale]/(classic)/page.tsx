import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getSkin } from '@/lib/skins';
import ClassicHome from './_ClassicHome';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: 'Sun City Paris — Le plus grand sauna gay de Paris',
    description: locale === 'fr'
      ? 'Sauna gay 100% hommes. 3000 m² sur 3 étages. Ouvert 7/7 à Paris 3.'
      : 'Gay sauna 100% men. 3000 sqm on 3 floors. Open 7/7 in Paris 3.',
  };
}

export default async function HomeDispatch({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  const skin = getSkin(settings?.themeKey);

  // Si un skin alternatif est actif, redirige vers sa route dédiée
  if (skin.route) {
    redirect(`/${locale}${skin.route}`);
  }

  // Sinon, rendre la home classique Sun City
  return <ClassicHome params={params} />;
}
