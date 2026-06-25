import { db } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { Card, SectionTitle, StatusPill } from '@/components/ui';
import { WorkspaceForm, BrandingForm, ApiKeyCreate, InviteMember } from '@/components/settings-forms';
import { Building2, Palette, KeyRound, Users2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { org } = await requireWorkspace();
  const [members, apiKeys] = await Promise.all([
    db.membership.findMany({ where: { orgId: org.id }, orderBy: { createdAt: 'asc' } }),
    db.apiKey.findMany({ where: { orgId: org.id }, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted">Workspace, white-label branding, team and API access.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Workspace" subtitle={`/${org.slug}`} action={<Building2 className="h-4 w-4 text-muted" />} />
          <WorkspaceForm name={org.name} currency={org.currency} customDomain={org.customDomain ?? ''} />
        </Card>

        <Card>
          <SectionTitle title="Branding" subtitle="White-label the referrer experience." action={<Palette className="h-4 w-4 text-muted" />} />
          <BrandingForm brandColor={org.brandColor} accentColor={org.accentColor} />
        </Card>

        <Card>
          <SectionTitle title="Team & roles" action={<Users2 className="h-4 w-4 text-muted" />} />
          <ul className="divide-y divide-border">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted">{m.email}</p>
                </div>
                <span className="chip border-border bg-surface-2 capitalize">{m.role}</span>
              </li>
            ))}
          </ul>
          <InviteMember />
        </Card>

        <Card>
          <SectionTitle title="API keys" subtitle="Authenticate the public REST API & widget." action={<KeyRound className="h-4 w-4 text-muted" />} />
          <ul className="space-y-2">
            {apiKeys.map((k) => (
              <li key={k.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-2/40 px-3 py-2.5">
                <div>
                  <p className="font-mono text-sm">{k.prefix}••••••••</p>
                  <p className="text-xs text-muted">{k.name}</p>
                </div>
                <StatusPill status={k.revokedAt ? 'rejected' : 'approved'} />
              </li>
            ))}
            {apiKeys.length === 0 && <li className="text-sm text-muted">No API keys yet.</li>}
          </ul>
          <ApiKeyCreate />
        </Card>
      </div>
    </div>
  );
}
