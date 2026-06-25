import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export interface AuditLogRow {
  id: string;
  orgId: string;
  orgName: string;
  actor: string;
  action: string;
  entity: string | null;
  metadata: Prisma.JsonValue;
  createdAt: Date;
}

export interface AuditLogResult {
  rows: AuditLogRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  actions: string[];
}

export interface GetAuditLogsOptions {
  /** Scope to a single org (advertiser view). Omit for platform-wide view. */
  orgId?: string;
  /** Filter by exact action string. */
  action?: string;
  /** Substring search on actor or entity. */
  q?: string;
  page?: number;
  pageSize?: number;
}

export async function getAuditLogs({
  orgId,
  action,
  q,
  page = 1,
  pageSize = 25,
}: GetAuditLogsOptions): Promise<AuditLogResult> {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, Math.min(pageSize, 100));
  const skip = (safePage - 1) * safeSize;

  const where: Prisma.AuditLogWhereInput = {
    ...(orgId ? { orgId } : {}),
    ...(action ? { action } : {}),
    ...(q
      ? {
          OR: [
            { actor: { contains: q } },
            { entity: { contains: q } },
          ],
        }
      : {}),
  };

  const [rawRows, total, actionRows] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeSize,
      include: { org: { select: { name: true } } },
    }),
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      distinct: ['action'],
      select: { action: true },
      orderBy: { action: 'asc' },
    }),
  ]);

  const rows: AuditLogRow[] = rawRows.map((r) => ({
    id: r.id,
    orgId: r.orgId,
    orgName: r.org.name,
    actor: r.actor,
    action: r.action,
    entity: r.entity,
    metadata: r.metadata,
    createdAt: r.createdAt,
  }));

  const actions = actionRows.map((a) => a.action);
  const totalPages = Math.max(1, Math.ceil(total / safeSize));

  return { rows, total, page: safePage, pageSize: safeSize, totalPages, actions };
}
