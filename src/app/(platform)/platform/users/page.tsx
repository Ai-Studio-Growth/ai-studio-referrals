import { db } from '@/lib/db';
import { requirePlatform } from '@/lib/auth';
import { Card, SectionTitle, StatTile, StatusPill } from '@/components/ui';
import { StatCounter } from '@/components/stat-counter';
import { RoleSelect, SuspendButton } from '@/components/platform-controls';
import { Users2, ShieldCheck, Megaphone, Gift } from 'lucide-react';

export const dynamic = 'force-dynamic';

const roleChip: Record<string, string> = {
  super_admin: 'border-brand/30 bg-brand/10 text-brand',
  advertiser: 'border-accent/30 bg-accent/10 text-accent',
  referrer: 'border-success/30 bg-success/10 text-success',
};

export default async function UsersPage() {
  const { account: me } = await requirePlatform();

  const [accounts, supers, advertisers, referrers] = await Promise.all([
    db.account.findMany({ orderBy: { createdAt: 'desc' }, include: { org: { select: { name: true } } } }),
    db.account.count({ where: { role: 'super_admin' } }),
    db.account.count({ where: { role: 'advertiser' } }),
    db.account.count({ where: { role: 'referrer' } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted">Every login across the platform — manage roles and access.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total accounts" icon={Users2} accent="var(--brand)"><StatCounter value={accounts.length} /></StatTile>
        <StatTile label="Platform admins" icon={ShieldCheck} accent="var(--brand)"><StatCounter value={supers} /></StatTile>
        <StatTile label="Advertisers" icon={Megaphone} accent="var(--accent)"><StatCounter value={advertisers} /></StatTile>
        <StatTile label="Referrers" icon={Gift} accent="var(--success)"><StatCounter value={referrers} /></StatTile>
      </div>

      <Card>
        <SectionTitle title="All accounts" subtitle="Change a role or suspend access. Sessions end immediately on suspend." />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">Workspace</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Account</th>
                <th className="px-3 py-2 font-medium">Last login</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const self = a.id === me.id;
                return (
                  <tr key={a.id} className="border-t border-border/60 hover:bg-surface-2/40">
                    <td className="px-3 py-3">
                      <p className="font-medium">{a.name}{self && <span className="ml-2 text-xs text-muted">(you)</span>}</p>
                      <p className="text-xs text-muted">{a.email}</p>
                    </td>
                    <td className="px-3 py-3 text-muted">{a.org?.name ?? '—'}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`chip capitalize ${roleChip[a.role] ?? 'border-border bg-surface-2'}`}>{a.role.replace('_', ' ')}</span>
                        <RoleSelect accountId={a.id} role={a.role} disabled={self} />
                      </div>
                    </td>
                    <td className="px-3 py-3"><StatusPill status={a.status === 'suspended' ? 'rejected' : 'approved'} /></td>
                    <td className="px-3 py-3 text-xs text-muted">{a.lastLoginAt ? a.lastLoginAt.toISOString().slice(0, 10) : 'never'}</td>
                    <td className="px-3 py-3 text-right"><div className="flex justify-end"><SuspendButton accountId={a.id} status={a.status} disabled={self} /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
