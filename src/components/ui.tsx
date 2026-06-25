import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/** Presentational primitives (server-component safe — no hooks). */

export function Card({ className, children, id }: { className?: string; children: ReactNode; id?: string }) {
  return (
    <div id={id} className={clsx('glass p-5', className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatTile({
  label,
  icon: Icon,
  children,
  accent,
}: {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: `hsl(${accent ?? 'var(--brand)'})` }}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-brand">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{children}</div>
    </Card>
  );
}

export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={clsx('h-2.5 w-full overflow-hidden rounded-full bg-surface-2', className)}>
      <div
        className="h-full rounded-full bg-brand-gradient transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function TierBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="chip border-transparent font-semibold text-white"
      style={{ background: `hsl(${color})` }}
    >
      {name}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: 'bg-success/15 text-success border-success/30',
    paid: 'bg-brand/15 text-brand border-brand/30',
    pending: 'bg-warning/15 text-warning border-warning/30',
    rejected: 'bg-danger/15 text-danger border-danger/30',
    processing: 'bg-accent/15 text-accent border-accent/30',
    open: 'bg-danger/15 text-danger border-danger/30',
  };
  return <span className={clsx('chip capitalize', map[status] ?? 'bg-surface-2 text-muted')}>{status}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} />;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border py-12 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}
