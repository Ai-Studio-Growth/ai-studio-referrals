'use server';

import { db } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createCommunityPostAction(input: { title: string; body: string; category: string }) {
  const { account, role } = await requireSession();
  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 3 || body.length < 3) return { ok: false as const, error: 'Add a title and a message.' };
  await db.communityPost.create({
    data: { authorName: account.name, authorRole: role, title, body, category: input.category || 'general' },
  });
  revalidatePath('/community');
  return { ok: true as const };
}
