'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: String(fd.get('email')),
      password: String(fd.get('password')),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) setError('Identifiants invalides');
    else router.push('/admin');
  }

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-bgAlt border border-border rounded-lg p-8 space-y-4">
        <h1 className="font-display text-2xl text-primary text-center mb-2">Sun City — BO</h1>
        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required
            className="w-full bg-bg border border-border rounded-md px-3 py-2 focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required
            className="w-full bg-bg border border-border rounded-md px-3 py-2 focus:border-primary outline-none" />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
