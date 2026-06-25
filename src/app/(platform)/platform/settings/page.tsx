import { db } from '@/lib/db';
import { requirePlatform } from '@/lib/auth';
import { Card, SectionTitle } from '@/components/ui';
import { SettingRow, AddSettingForm } from '@/components/platform-controls';
import { Settings as SettingsIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PlatformSettingsPage() {
  await requirePlatform();
  const settings = await db.platformSetting.findMany({ orderBy: [{ group: 'asc' }, { label: 'asc' }] });

  const groups = new Map<string, typeof settings>();
  for (const s of settings) {
    const arr = groups.get(s.group) ?? [];
    arr.push(s);
    groups.set(s.group, arr);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Platform settings</h1>
        <p className="text-sm text-muted">Configure the whole platform from here — add or change settings without touching code.</p>
      </div>

      {[...groups.entries()].map(([group, items]) => (
        <Card key={group}>
          <SectionTitle title={group[0].toUpperCase() + group.slice(1)} action={<SettingsIcon className="h-4 w-4 text-muted" />} />
          <ul className="divide-y divide-border">
            {items.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium">{s.label ?? s.key}</p>
                  <p className="font-mono text-xs text-muted">{s.key}</p>
                </div>
                <SettingRow id={s.id} value={s.value} type={s.type} />
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Card>
        <SectionTitle title="Custom settings" subtitle="Define your own configuration keys." />
        <AddSettingForm />
      </Card>
    </div>
  );
}
