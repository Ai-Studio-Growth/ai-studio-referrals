import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { SessionContext } from '@/lib/auth';

/** Build the Prisma `where` clause for notifications relevant to this account. */
export function relevantNotificationsWhere(session: SessionContext): Prisma.NotificationWhereInput {
  const { account, role } = session;
  const audienceForRole = role === 'advertiser' ? 'advertisers' : role === 'referrer' ? 'referrers' : null;

  const or: Prisma.NotificationWhereInput[] = [{ audience: 'all' }];
  if (audienceForRole) or.push({ audience: audienceForRole });
  if (account.orgId) or.push({ orgId: account.orgId });

  return { status: 'sent', channel: 'inapp', OR: or };
}

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  read: boolean;
};

/** Return up to `limit` most-recent relevant notifications with a `read` flag. */
export async function getNotifications(session: SessionContext, limit = 20): Promise<NotificationItem[]> {
  const where = relevantNotificationsWhere(session);

  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      receipts: {
        where: { accountId: session.account.id },
        select: { readAt: true },
      },
    },
  });

  return notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt,
    read: n.receipts.length > 0 && n.receipts[0].readAt !== null,
  }));
}

/** Count unread relevant notifications for this account. */
export async function getUnreadCount(session: SessionContext): Promise<number> {
  const where = relevantNotificationsWhere(session);

  // Get all relevant notification ids, then count those without a read receipt.
  const allIds = await db.notification.findMany({
    where,
    select: { id: true },
  });

  if (allIds.length === 0) return 0;

  const readIds = await db.notificationReceipt.findMany({
    where: {
      accountId: session.account.id,
      notificationId: { in: allIds.map((n) => n.id) },
      readAt: { not: null },
    },
    select: { notificationId: true },
  });

  return allIds.length - readIds.length;
}
