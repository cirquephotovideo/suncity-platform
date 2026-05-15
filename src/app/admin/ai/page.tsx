import { requireAdmin } from '@/lib/admin-auth';
import AiStudioClient from '@/components/admin/AiStudioClient';

export default async function AiStudioPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Studio IA</h1>
      <p className="text-textMuted text-sm mb-6">Générez du contenu ou traduisez du texte avec le fournisseur IA configuré.</p>
      <AiStudioClient />
    </div>
  );
}
