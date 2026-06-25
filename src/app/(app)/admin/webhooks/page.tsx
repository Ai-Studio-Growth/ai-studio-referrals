import { requireWorkspace } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, SectionTitle, StatusPill, EmptyState } from '@/components/ui';
import { CreateWebhook, EndpointRow } from '@/components/webhook-manager';
import { Webhook } from 'lucide-react';

export const dynamic = 'force-dynamic';

function ago(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function WebhooksPage() {
  const { org } = await requireWorkspace();
  const [endpoints, deliveries] = await Promise.all([
    db.webhookEndpoint.findMany({ where: { orgId: org.id }, orderBy: { createdAt: 'desc' } }),
    db.webhookDelivery.findMany({
      where: { endpoint: { orgId: org.id } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { endpoint: { select: { url: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Webhooks</h2>
        <p className="text-sm text-muted">Get a signed POST to your systems whenever a conversion is recorded.</p>
      </div>

      <Card>
        <SectionTitle title="Add an endpoint" subtitle="Use * for all events, or a comma-separated list (e.g. conversion.recorded)." action={<Webhook className="h-4 w-4 text-muted" />} />
        <CreateWebhook />
      </Card>

      <Card>
        <SectionTitle title="Endpoints" subtitle={`${endpoints.length} configured`} />
        {endpoints.length === 0 ? (
          <EmptyState title="No endpoints yet" hint="Add one above to start receiving events." />
        ) : (
          <div className="space-y-2">
            {endpoints.map((ep) => (
              <EndpointRow key={ep.id} ep={{ id: ep.id, url: ep.url, events: ep.events, status: ep.status }} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="Recent deliveries" subtitle="Last 20 attempts" />
        {deliveries.length === 0 ? (
          <EmptyState title="No deliveries yet" hint="Send a test event from an endpoint above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Event</th>
                  <th className="px-3 py-2 font-medium">Endpoint</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Code</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-t border-border/60 hover:bg-surface-2/40">
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-muted">{ago(d.createdAt)}</td>
                    <td className="px-3 py-3 font-mono text-xs">{d.event}</td>
                    <td className="max-w-[220px] truncate px-3 py-3 font-mono text-xs text-muted" title={d.endpoint.url}>{d.endpoint.url}</td>
                    <td className="px-3 py-3"><StatusPill status={d.status === 'success' ? 'approved' : d.status === 'failed' ? 'rejected' : 'pending'} /></td>
                    <td className="px-3 py-3 tabular-nums text-muted">{d.statusCode ?? (d.error ? '—' : '')}</td>
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
