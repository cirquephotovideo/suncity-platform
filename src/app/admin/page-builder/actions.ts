'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import type { BlockKind } from '@prisma/client';

export async function addBlock(pageId: string, kind: BlockKind) {
  const userId = await requireAdminUserId();
  const last = await prisma.pageBlock.findFirst({ where: { pageId }, orderBy: { orderIdx: 'desc' } });
  const block = await prisma.pageBlock.create({
    data: { pageId, kind, orderIdx: (last?.orderIdx ?? 0) + 10, dataJson: defaultDataFor(kind), visible: true },
  });
  await audit({ actorId: userId, action: 'CREATE', targetType: 'PageBlock', targetId: block.id, diff: { kind } });
  revalidatePath(`/admin/page-builder/${pageId}`);
  return block.id;
}

export async function updateBlock(blockId: string, formData: FormData) {
  const userId = await requireAdminUserId();
  const dataJsonRaw = String(formData.get('dataJson') ?? '{}');
  let dataJson: any = {};
  try { dataJson = JSON.parse(dataJsonRaw); } catch { throw new Error('Invalid JSON'); }
  const block = await prisma.pageBlock.update({
    where: { id: blockId },
    data: { dataJson, visible: formData.get('visible') === 'on', orderIdx: Number(formData.get('orderIdx') ?? 0) },
  });
  await audit({ actorId: userId, action: 'UPDATE', targetType: 'PageBlock', targetId: blockId });
  revalidatePath(`/admin/page-builder/${block.pageId}`);
}

export async function deleteBlock(blockId: string, pageId: string) {
  const userId = await requireAdminUserId();
  await prisma.pageBlock.delete({ where: { id: blockId } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'PageBlock', targetId: blockId });
  revalidatePath(`/admin/page-builder/${pageId}`);
}

function defaultDataFor(kind: BlockKind): any {
  switch (kind) {
    case 'HERO_VIDEO':    return { eyebrow: 'Sun City', title: 'Titre', body: 'Texte', videoUrl: '', ctaLabel: 'Voir', ctaHref: '/agenda' };
    case 'HERO_IMAGE':    return { eyebrow: '', title: '', body: '', imageUrl: '', ctaLabel: '', ctaHref: '' };
    case 'TEXT':          return { html: '<p>Texte libre</p>' };
    case 'IMAGE':         return { src: '', alt: '', caption: '' };
    case 'CTA':           return { label: 'CTA', href: '/' };
    case 'GALLERY':       return { kind: 'GALLERY', limit: 12 };
    case 'EVENT_LIST':    return { limit: 8 };
    case 'LOCATION_LIST': return { limit: 5 };
    case 'TARIFF_TABLE':  return {};
    case 'PARTNERS':      return {};
    case 'CONTACT_FORM':  return {};
    case 'NEWSLETTER_FORM': return {};
    case 'RAW_HTML':      return { html: '<div></div>' };
    case 'EMBED':         return { url: '', height: 480 };
    default: return {};
  }
}
