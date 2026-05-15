'use client';
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="section text-center max-w-prose">
      <h1 className="font-display text-3xl mb-4">Une erreur est survenue</h1>
      <p className="text-textMuted mb-6">{error.message || 'Erreur inattendue'}</p>
      {error.digest && <p className="text-xs text-textMuted mb-6">Code : {error.digest}</p>}
      <button onClick={reset} className="btn-primary">Réessayer</button>
    </section>
  );
}
