import { db } from '@/lib/db';
import { requirePlatform } from '@/lib/auth';
import { Card, SectionTitle } from '@/components/ui';
import { IntegrationToggle, ProviderToggle, AddProviderForm } from '@/components/platform-controls';
import { CreditCard, MessageSquare, ShoppingBag, Users2, BarChart3, Plug } from 'lucide-react';

export const dynamic = 'force-dynamic';

const CATEGORY_ICON: Record<string, typeof CreditCard> = {
  payouts: CreditCard,
  messaging: MessageSquare,
  ecommerce: ShoppingBag,
  crm: Users2,
  analytics: BarChart3,
  other: Plug,
};

export default async function IntegrationsPage() {
  await requirePlatform();

  const [providers, integrations] = await Promise.all([
    db.integrationProvider.findMany({ orderBy: { name: 'asc' } }),
    db.integration.findMany({ include: { org: { select: { name: true } } }, orderBy: { provider: 'asc' } }),
  ]);

  const connectedCount = new Map<string, number>();
  for (const i of integrations) {
    if (i.status === 'connected') connectedCount.set(i.provider, (connectedCount.get(i.provider) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted">Extend the catalog and manage per-client connections — no code required.</p>
      </div>

      {/* Add provider (no-code) */}
      <Card>
        <SectionTitle title="Add an integration provider" subtitle="New providers appear in the catalog instantly — no deploy." action={<Plug className="h-4 w-4 text-muted" />} />
        <AddProviderForm />
      </Card>

      {/* Catalog */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {providers.map((p) => {
          const Icon = CATEGORY_ICON[p.category] ?? Plug;
          return (
            <Card key={p.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <ProviderToggle id={p.id} enabled={p.enabled} />
              </div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs capitalize text-muted">{p.category}</p>
              <p className="text-xs text-muted">{connectedCount.get(p.slug) ?? 0} clients connected</p>
            </Card>
          );
        })}
      </div>

      {/* Per-client connections */}
      <Card>
        <SectionTitle title="Connections" subtitle="Toggle any client's integration on or off." />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">Client</th>
                <th className="px-3 py-2 font-medium">Provider</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((i) => (
                <tr key={i.id} className="border-t border-border/60 hover:bg-surface-2/40">
                  <td className="px-3 py-3 font-medium">{i.org.name}</td>
                  <td className="px-3 py-3 capitalize">{i.provider}</td>
                  <td className="px-3 py-3 capitalize text-muted">{i.category}</td>
                  <td className="px-3 py-3"><IntegrationToggle integrationId={i.id} status={i.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
