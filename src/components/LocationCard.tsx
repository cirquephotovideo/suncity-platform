import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export interface LocationCardProps {
  slug: string;
  title: string;
  summary: string;
  iconKey?: string | null;
}

export function LocationCard({ slug, title, summary }: LocationCardProps) {
  const t = useTranslations('places');
  return (
    <Link href={`/lieux/${slug}` as any} className="group block bg-bgAlt border border-border rounded-lg p-5 hover:border-primary/60 transition">
      <h3 className="font-display text-xl text-primary mb-2 group-hover:text-accent">{title}</h3>
      <p className="text-sm text-textMuted leading-relaxed mb-3">{summary}</p>
      <span className="text-xs text-primary">{t('discover')} →</span>
    </Link>
  );
}
