'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import type { CouponKind } from '@prisma/client';

export async function createCoupon(formData: FormData) {
  const userId = await requireAdminUserId();
  const c = await prisma.coupon.create({
    data: {
      code: String(formData.get('code') ?? '').toUpperCase().trim(),
      kind: String(formData.get('kind') ?? 'PERCENT') as CouponKind,
      value: Number(formData.get('value') ?? 0),
      validFrom: formData.get('validFrom') ? new Date(String(formData.get('validFrom'))) : null,
      validUntil: formData.get('validUntil') ? new Date(String(formData.get('validUntil'))) : null,
      maxRedemptions: formData.get('maxRedemptions') ? Number(formData.get('maxRedemptions')) : null,
      active: formData.get('active') === 'on',
    },
  });
  await audit({ actorId: userId, action: 'CREATE', targetType: 'Coupon', targetId: c.id });
  revalidatePath('/admin/coupons');
  return c.id;
}

export async function deleteCoupon(id: string) {
  const userId = await requireAdminUserId();
  await prisma.coupon.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'Coupon', targetId: id });
  revalidatePath('/admin/coupons');
}
