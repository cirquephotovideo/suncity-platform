'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

function parseJsonSafe(v: any) { if (!v) return null; try { return JSON.parse(String(v)); } catch { return null; } }

export async function updateSettings(formData: FormData) {
  const userId = await requireAdminUserId();
  const data = {
    contactPhone: String(formData.get('contactPhone') ?? '') || null,
    contactEmail: String(formData.get('contactEmail') ?? '') || null,
    address: String(formData.get('address') ?? '') || null,
    rcs: String(formData.get('rcs') ?? '') || null,
    openingHoursJson: parseJsonSafe(formData.get('openingHoursJson')),
    socialJson: parseJsonSafe(formData.get('socialJson')),
    partnersJson: parseJsonSafe(formData.get('partnersJson')),
    ageGateEnabled: formData.get('ageGateEnabled') === 'on',
    ageGateMinAge: Number(formData.get('ageGateMinAge') ?? 18),
    themeKey: String(formData.get('themeKey') ?? 'sun'),
    defaultLocale: String(formData.get('defaultLocale') ?? 'fr') as 'fr' | 'en',
  };
  await prisma.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  await audit({ actorId: userId, action: 'UPDATE', targetType: 'SiteSettings', targetId: '1', diff: data as any });
  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout');
}
