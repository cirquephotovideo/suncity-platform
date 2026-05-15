import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/admin/login');
  return session;
}

export async function requireAdminUserId(): Promise<string> {
  const s = await requireAdmin();
  return (s.user as any).id;
}
