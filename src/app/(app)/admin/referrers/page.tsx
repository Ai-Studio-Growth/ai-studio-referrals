import { requireWorkspace } from '@/lib/auth';
import { getLeaderboard } from '@/lib/stats';
import { money } from '@/lib/money';
import { Card, SectionTitle, TierBadge, EmptyState } from '@/components/ui';
import { InviteReferrer } from '@/components/invite-referrer';
import { UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReferrersPage() {
  const { org } = await requireWorkspace();
  const referrers = await getLeaderboard(org.id, 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Referrers</h2>
        <p className="text-sm text-muted">Invite people to refer for {org.name} and track their performance.</p>
      </div>

      <Card>
        <SectionTitle title="Invite a referrer" subtitle="They get a referral link + a portal login to track earnings." action={<UserPlus className="h-4 w-4 text-muted" />} />
        <InviteReferrer />
      </Card>

      <Card>
        <SectionTitle title="Your referrers" subtitle={`${referrers.length} active`} />
        {referrers.length === 0 ? (
          <EmptyState title="No referrers yet" hint="Invite your first referrer above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-medium">Referrer</th>
                  <th className="px-3 py-2 font-medium">Tier</th>
                  <th className="px-3 py-2 text-right font-medium">Clicks</th>
                  <th className="px-3 py-2 text-right font-medium">Conversions</th>
                  <th className="px-3 py-2 text-right font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {referrers.map((u) => (
                  <tr key={u.id} className="border-t border-border/60 hover:bg-surface-2/40">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u.avatarUrl ?? ''} alt="" className="h-7 w-7 rounded-full border bg-surface-2" />
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><TierBadge name={u.tier.name} color={u.tier.color} /></td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted">{u.clicks}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">{u.conversions}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{money(u.earningsCents, org.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
