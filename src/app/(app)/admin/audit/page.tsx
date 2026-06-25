import { requireWorkspace } from '@/lib/auth';
import { getAuditLogs } from '@/lib/audit';
import { Card } from '@/components/ui';
import { AuditLogTable } from '@/components/audit-log-table';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; q?: string }>;
}) {
  const { org } = await requireWorkspace();
  const sp = await searchParams;
  const result = await getAuditLogs({
    orgId: org.id,
    action: sp.action || undefined,
    q: sp.q || undefined,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Audit log</h2>
        <p className="text-sm text-muted">Every referral, reward, payout and settings change in {org.name}.</p>
      </div>
      <Card>
        <AuditLogTable result={result} basePath="/admin/audit" action={sp.action} q={sp.q} />
      </Card>
    </div>
  );
}
