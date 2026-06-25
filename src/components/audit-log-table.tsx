import Link from 'next/link';
import type { AuditLogResult } from '@/lib/audit';
import { SectionTitle, EmptyState } from '@/components/ui';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

function fmt(d: Date) {
  return new Date(d).toISOString().slice(0, 16).replace('T', ' ');
}

function pageHref(basePath: string, page: number, action?: string, q?: string) {
  const sp = new URLSearchParams();
  if (page > 1) sp.set('page', String(page));
  if (action) sp.set('action', action);
  if (q) sp.set('q', q);
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Server-rendered audit log table with a GET filter form + pagination — works
 * without client JS. Used by both the advertiser and platform audit pages.
 */
export function AuditLogTable({
  result,
  basePath,
  action,
  q,
  showWorkspace,
}: {
  result: AuditLogResult;
  basePath: string;
  action?: string;
  q?: string;
  showWorkspace?: boolean;
}) {
  const { rows, total, page, totalPages, actions } = result;

  return (
    <div>
      <SectionTitle
        title="Activity log"
        subtitle={`${total.toLocaleString()} event${total === 1 ? '' : 's'}`}
      />

      {/* Filters (GET form — no client JS needed) */}
      <form method="get" action={basePath} className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search actor or entity…"
            className="w-full rounded-xl border bg-surface-2 pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <select
          name="action"
          defaultValue={action ?? ''}
          className="rounded-xl border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <button type="submit" className="btn-brand !py-2.5 text-sm">Filter</button>
        {(action || q) && (
          <Link href={basePath} className="btn-ghost !py-2.5 text-sm">Clear</Link>
        )}
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No matching events" hint="Try a different action or search term." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">Time</th>
                {showWorkspace && <th className="px-3 py-2 font-medium">Workspace</th>}
                <th className="px-3 py-2 font-medium">Actor</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Entity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-surface-2/40">
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-muted">{fmt(r.createdAt)}</td>
                  {showWorkspace && <td className="px-3 py-3 text-muted">{r.orgName}</td>}
                  <td className="px-3 py-3">{r.actor}</td>
                  <td className="px-3 py-3">
                    <span className="chip border-brand/30 bg-brand/10 font-mono text-xs text-brand">{r.action}</span>
                  </td>
                  <td className="max-w-[180px] truncate px-3 py-3 font-mono text-xs text-muted" title={r.entity ?? ''}>
                    {r.entity ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={pageHref(basePath, page - 1, action, q)} className="btn-ghost !py-2 text-sm">
                <ChevronLeft className="h-4 w-4" /> Prev
              </Link>
            ) : (
              <span className="btn-ghost pointer-events-none !py-2 text-sm opacity-40"><ChevronLeft className="h-4 w-4" /> Prev</span>
            )}
            {page < totalPages ? (
              <Link href={pageHref(basePath, page + 1, action, q)} className="btn-ghost !py-2 text-sm">
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="btn-ghost pointer-events-none !py-2 text-sm opacity-40">Next <ChevronRight className="h-4 w-4" /></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
