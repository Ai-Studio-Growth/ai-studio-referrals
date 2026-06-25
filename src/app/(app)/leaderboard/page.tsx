import { requireSession, homeForRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getLeaderboard } from '@/lib/stats';
import { money } from '@/lib/money';
import { Card, SectionTitle, TierBadge } from '@/components/ui';
import { Trophy, Medal } from 'lucide-react';

export const dynamic = 'force-dynamic';

const PODIUM = ['from-amber-300/30', 'from-slate-300/30', 'from-orange-400/30'];

export default async function LeaderboardPage() {
  const { org, role } = await requireSession('/leaderboard');
  if (!org) redirect(homeForRole(role));
  const rows = await getLeaderboard(org.id, 25);
  const top = rows.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-brand-fg shadow-glow">
          <Trophy className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted">{org.name} · top referrers this season</p>
        </div>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {top.map((u, i) => (
          <Card key={u.id} className={`relative overflow-hidden bg-gradient-to-b ${PODIUM[i]} to-transparent`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.avatarUrl ?? ''} alt="" className="h-12 w-12 rounded-full border bg-surface-2" />
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-surface text-xs font-bold shadow">
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{u.name}</p>
                <TierBadge name={u.tier.name} color={u.tier.color} />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted">{u.conversions} conversions</span>
              <span className="font-semibold">{money(u.earningsCents, org.currency)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Full table */}
      <Card>
        <SectionTitle title="Full rankings" subtitle="Anonymized handles can be enabled per campaign." />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Referrer</th>
                <th className="px-3 py-2 font-medium">Tier</th>
                <th className="px-3 py-2 text-right font-medium">Clicks</th>
                <th className="px-3 py-2 text-right font-medium">Conversions</th>
                <th className="px-3 py-2 text-right font-medium">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u, i) => (
                <tr key={u.id} className="border-t border-border/60 transition-colors hover:bg-surface-2/50">
                  <td className="px-3 py-3 text-muted">
                    {i < 3 ? <Medal className="h-4 w-4 text-brand" /> : i + 1}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.avatarUrl ?? ''} alt="" className="h-7 w-7 rounded-full border bg-surface-2" />
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <TierBadge name={u.tier.name} color={u.tier.color} />
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{u.clicks}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">{u.conversions}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{money(u.earningsCents, org.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
