import { db } from '@/lib/db';
import { requirePlatform } from '@/lib/auth';
import { formatCents } from '@/lib/config/campaign-config';
import { Card, SectionTitle, StatusPill } from '@/components/ui';
import { PlanSelect, StatusSelect } from '@/components/platform-controls';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  await requirePlatform();

  const orgs = await db.org.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { members: true, referrals: true, campaigns: true, users: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
        <p className="text-sm text-muted">{orgs.length} workspaces · manage plans and subscription status inline.</p>
      </div>

      <Card>
        <SectionTitle title="All workspaces" subtitle="Each row is an advertiser tenant." />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">Client</th>
                <th className="px-3 py-2 font-medium">Plan</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">MRR</th>
                <th className="px-3 py-2 text-right font-medium">Campaigns</th>
                <th className="px-3 py-2 text-right font-medium">Referrals</th>
                <th className="px-3 py-2 text-right font-medium">Members</th>
                <th className="px-3 py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id} className="border-t border-border/60 align-middle hover:bg-surface-2/40">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-xs font-bold text-brand-fg">
                        {o.name.charAt(0)}
                      </span>
                      <div>
                        <p className="font-medium">{o.name}</p>
                        <p className="text-xs text-muted">/{o.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><PlanSelect orgId={o.id} plan={o.plan} /></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <StatusPill status={o.subStatus} />
                      <StatusSelect orgId={o.id} status={o.subStatus} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium">{formatCents(o.mrrCents)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{o._count.campaigns}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{o._count.referrals}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{o._count.members}</td>
                  <td className="px-3 py-3 text-xs text-muted">{o.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
