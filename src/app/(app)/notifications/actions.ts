'use server';

import { db } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { relevantNotificationsWhere } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

/** Upsert read receipts for every relevant unread notification. */
export async function markAllReadAction(): Promise<void> {
  const session = await requireSession();
  const where = relevantNotificationsWhere(session);

  const notifications = await db.notification.findMany({
    where,
    select: { id: true },
  });

  const now = new Date();

  await Promise.all(
    notifications.map((n) =>
      db.notificationReceipt.upsert({
        where: {
          accountId_notificationId: {
            accountId: session.account.id,
            notificationId: n.id,
          },
        },
        update: { readAt: now },
        create: {
          accountId: session.account.id,
          notificationId: n.id,
          readAt: now,
        },
      }),
    ),
  );

  revalidatePath('/notifications');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

/** Mark a single notification as read. */
export async function markReadAction(notificationId: string): Promise<void> {
  const session = await requireSession();
  const now = new Date();

  await db.notificationReceipt.upsert({
    where: {
      accountId_notificationId: {
        accountId: session.account.id,
        notificationId,
      },
    },
    update: { readAt: now },
    create: {
      accountId: session.account.id,
      notificationId,
      readAt: now,
    },
  });

  revalidatePath('/notifications');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
}
