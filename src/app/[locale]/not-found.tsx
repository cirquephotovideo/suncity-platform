import { Link } from '@/i18n/routing';
export default function NotFound() {
  return (
    <section className="section text-center max-w-prose">
      <h1 className="font-display text-4xl mb-4">404</h1>
      <p className="text-textMuted mb-6">Cette page n'existe pas (encore).</p>
      <Link href="/" className="btn-primary">Retour à l'accueil</Link>
    </section>
  );
}
