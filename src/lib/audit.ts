import { prisma } from './prisma';
import type { AuditAction } from '@prisma/client';

export async function audit(opts: {
  actorId?: string | null;
  action: AuditAction;
  targetType: string;
  targetId?: string;
  diff?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: opts.actorId ?? null,
        action: opts.action,
        targetType: opts.targetType,
        targetId: opts.targetId ?? null,
        diffJson: (opts.diff ?? undefined) as any,
        ip: opts.ip ?? null,
        userAgent: opts.userAgent ?? null,
      },
    });
  } catch (e) { console.error('audit failed', e); }
}
