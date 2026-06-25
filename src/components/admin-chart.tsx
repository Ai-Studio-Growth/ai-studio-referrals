'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = { date: string; clicks: number; conversions: number };

/** Lazy-loaded time-series chart (clicks vs conversions) for the admin dashboard. */
export default function AdminChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(192 92% 50%)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(192 92% 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(256 88% 62%)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="hsl(256 88% 62%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Area type="monotone" dataKey="clicks" stroke="hsl(192 92% 50%)" strokeWidth={2} fill="url(#gClicks)" />
          <Area type="monotone" dataKey="conversions" stroke="hsl(256 88% 62%)" strokeWidth={2} fill="url(#gConv)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
