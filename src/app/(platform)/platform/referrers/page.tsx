import { requirePlatform } from '@/lib/auth';
import { getGlobalReferrers } from '@/lib/stats';
import { money } from '@/lib/money';
import { Card, SectionTitle, StatTile, TierBadge } from '@/components/ui';
import { StatCounter } from '@/components/stat-counter';
import { Gift, Users, Sparkle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PlatformReferrersPage() {
  await requirePlatform();
  const referrers = await getGlobalReferrers(150);

  const totalConversions = referrers.reduce((s, r) => s + r.conversions, 0);
  const totalClicks = referrers.reduce((s, r) => s + r.clicks, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Referrers</h1>
        <p className="text-sm text-muted">Performance of every referrer across all client workspaces.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile label="Active referrers" icon={Users} accent="var(--brand)"><StatCounter value={referrers.length} /></StatTile>
        <StatTile label="Total clicks" icon={Gift} accent="var(--accent)"><StatCounter value={totalClicks} /></StatTile>
        <StatTile label="Conversions" icon={Sparkle} accent="var(--success)"><StatCounter value={totalConversions} /></StatTile>
      </div>

      <Card>
        <SectionTitle title="All referrers" subtitle="Ranked by approved conversions." />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Referrer</th>
                <th className="px-3 py-2 font-medium">Workspace</th>
                <th className="px-3 py-2 font-medium">Tier</th>
                <th className="px-3 py-2 text-right font-medium">Clicks</th>
                <th className="px-3 py-2 text-right font-medium">Conversions</th>
                <th className="px-3 py-2 text-right font-medium">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {referrers.map((u, i) => (
                <tr key={u.id} className="border-t border-border/60 hover:bg-surface-2/40">
                  <td className="px-3 py-3 text-muted">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.avatarUrl ?? ''} alt="" className="h-7 w-7 rounded-full border bg-surface-2" />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted">{u.org}</td>
                  <td className="px-3 py-3"><TierBadge name={u.tier.name} color={u.tier.color} /></td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{u.clicks}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">{u.conversions}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{money(u.earningsCents, u.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
