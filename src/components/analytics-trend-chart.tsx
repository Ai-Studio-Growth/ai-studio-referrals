'use client';

import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = { month: string; conversions: number; spend: number };

/** Monthly conversions (bars) + reward spend (line). Lazy-rendered on the analytics page. */
export default function AnalyticsTrendChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="aBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(256 88% 62%)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(256 88% 62%)" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="l" tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} tickLine={false} axisLine={false} width={36} />
          <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
            formatter={(v: number, name: string) => (name === 'spend' ? [`$${v.toLocaleString()}`, 'Spend'] : [v, 'Conversions'])}
          />
          <Bar yAxisId="l" dataKey="conversions" fill="url(#aBar)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          <Line yAxisId="r" type="monotone" dataKey="spend" stroke="hsl(36 96% 55%)" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
