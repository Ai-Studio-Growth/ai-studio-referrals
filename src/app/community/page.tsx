import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSession, homeForRole } from '@/lib/auth';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, SectionTitle } from '@/components/ui';
import { CommunityComposer } from '@/components/community-composer';
import { ArrowLeft, Pin, MessagesSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Community · Ai Studio Referrals' };

const roleChip: Record<string, string> = {
  team: 'border-brand/30 bg-brand/10 text-brand',
  advertiser: 'border-accent/30 bg-accent/10 text-accent',
  referrer: 'border-success/30 bg-success/10 text-success',
  super_admin: 'border-brand/30 bg-brand/10 text-brand',
};

function ago(d: Date) {
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default async function CommunityPage() {
  const { role } = await requireSession('/community');
  const posts = await db.communityPost.findMany({ orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }], take: 50 });

  return (
    <div className="min-h-screen bg-bg bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href={homeForRole(role)} className="btn-ghost !py-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-brand-fg shadow-glow">
            <MessagesSquare className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Community</h1>
            <p className="text-sm text-muted">Share wins, ask questions, and request features.</p>
          </div>
        </div>

        <Card>
          <SectionTitle title="Start a discussion" />
          <CommunityComposer />
        </Card>

        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id} className={p.pinned ? 'border-brand/40' : ''}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {p.pinned && <Pin className="h-4 w-4 text-brand" />}
                  <h3 className="font-semibold">{p.title}</h3>
                </div>
                <span className="shrink-0 text-xs text-muted">{ago(p.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{p.body}</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="font-medium">{p.authorName}</span>
                <span className={`chip ${roleChip[p.authorRole] ?? 'border-border bg-surface-2'} capitalize`}>{p.authorRole.replace('_', ' ')}</span>
                <span className="chip border-border bg-surface-2 capitalize">{p.category.replace('-', ' ')}</span>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
