import { requirePlatform } from '@/lib/auth';
import { getAuditLogs } from '@/lib/audit';
import { Card } from '@/components/ui';
import { AuditLogTable } from '@/components/audit-log-table';

export const dynamic = 'force-dynamic';

export default async function PlatformAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; q?: string }>;
}) {
  await requirePlatform();
  const sp = await searchParams;
  const result = await getAuditLogs({
    action: sp.action || undefined,
    q: sp.q || undefined,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted">Platform-wide activity across every client workspace.</p>
      </div>
      <Card>
        <AuditLogTable result={result} basePath="/platform/audit" action={sp.action} q={sp.q} showWorkspace />
      </Card>
    </div>
  );
}
