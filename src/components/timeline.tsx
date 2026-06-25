import { MousePointerClick, UserCheck, Gift } from 'lucide-react';
import type { TimelineItem } from '@/lib/stats';
import { EmptyState } from './ui';

const ICON = {
  click: MousePointerClick,
  conversion: UserCheck,
  reward: Gift,
} as const;

const TINT = {
  click: 'text-accent bg-accent/10',
  conversion: 'text-success bg-success/10',
  reward: 'text-brand bg-brand/10',
} as const;

function ago(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) return <EmptyState title="No activity yet" hint="Share your link to see clicks and conversions roll in." />;
  return (
    <ol className="relative space-y-1">
      {items.map((it) => {
        const Icon = ICON[it.type];
        return (
          <li key={it.id} className="flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-2/60">
            <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${TINT[it.type]}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{it.label}</p>
              {it.detail && <p className="truncate text-xs text-muted">{it.detail}</p>}
            </div>
            <time className="shrink-0 text-xs text-muted">{ago(it.at)}</time>
          </li>
        );
      })}
    </ol>
  );
}
