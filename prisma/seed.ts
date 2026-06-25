import { PrismaClient, Prisma } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import crypto from 'crypto';
import type { ReferrerRewardConfig, RewardRule } from '../src/lib/config/campaign-config';
import { hashPassword } from '../src/lib/password';

const db = new PrismaClient();
const nano = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 5);

// Deterministic-ish randomness helpers
const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(arr: T[]): T => arr[rand(arr.length)];
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000 - rand(86_400_000));
const hash = (v: string) => crypto.createHmac('sha256', 'dev-secret-change-me').update(v).digest('hex').slice(0, 32);

const FIRST = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Riley', 'Morgan', 'Casey', 'Jamie', 'Avery', 'Quinn', 'Parker', 'Drew', 'Skyler', 'Reese', 'Devon', 'Harper', 'Rowan', 'Emerson', 'Finley', 'Sage'];
const LAST = ['Chen', 'Patel', 'Kim', 'Garcia', 'Okafor', 'Müller', 'Rossi', 'Silva', 'Nguyen', 'Ahmed', 'Johnson', 'Lopez', 'Ivanov', 'Tanaka', 'Andersson'];
const COUNTRIES = ['US', 'GB', 'IN', 'DE', 'BR', 'CA', 'AU', 'NG', 'JP', 'FR'];

function rr(base: RewardRule, milestones: ReferrerRewardConfig['milestones'] = []): Prisma.InputJsonValue {
  return { base, milestones } as unknown as Prisma.InputJsonValue;
}

async function main() {
  console.log('🌱  Resetting demo data…');
  // Order matters for FK cleanup.
  await db.auditLog.deleteMany();
  await db.fraudFlag.deleteMany();
  await db.reward.deleteMany();
  await db.payout.deleteMany();
  await db.conversion.deleteMany();
  await db.click.deleteMany();
  await db.referral.deleteMany();
  await db.campaign.deleteMany();
  await db.apiKey.deleteMany();
  await db.notification.deleteMany();
  await db.integration.deleteMany();
  await db.integrationProvider.deleteMany();
  await db.platformSetting.deleteMany();
  await db.communityPost.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.membership.deleteMany();
  await db.endUser.deleteMany();
  await db.org.deleteMany();

  const inDays = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

  // ── Org 1: a SaaS company ──────────────────────────────────────────────────
  const nimbus = await db.org.create({
    data: {
      name: 'Analytics Dashboard',
      slug: 'analytics',
      brandColor: '256 88% 60%',
      accentColor: '192 92% 50%',
      currency: 'USD',
      plan: 'growth',
      subStatus: 'active',
      mrrCents: 9900,
      seats: 10,
      renewsAt: inDays(20),
      members: {
        create: [
          { email: 'admin@nimbus.io', name: 'Dana Owner', role: 'admin' },
          { email: 'manager@nimbus.io', name: 'Lee Manager', role: 'manager' },
          { email: 'viewer@nimbus.io', name: 'Pat Viewer', role: 'viewer' },
        ],
      },
    },
  });

  // ── Org 2: an e-commerce brand ──────────────────────────────────────────────
  const verde = await db.org.create({
    data: {
      name: 'Verde Goods',
      slug: 'verde',
      brandColor: '152 62% 42%',
      accentColor: '38 92% 52%',
      currency: 'EUR',
      plan: 'starter',
      subStatus: 'active',
      mrrCents: 4900,
      seats: 5,
      renewsAt: inDays(12),
      members: { create: [{ email: 'owner@verde.shop', name: 'Verde Owner', role: 'admin' }] },
    },
  });

  // ── Extra client workspaces (populate the platform admin clients list) ──────
  const demoHash = await hashPassword('Demo1234');
  const extraClients = [
    { name: 'Lumio Pay', slug: 'lumio', plan: 'scale', subStatus: 'active', mrrCents: 24900, seats: 25, owner: 'finance@lumio.com', ownerName: 'Mara Finance' },
    { name: 'Trailhead', slug: 'trailhead', plan: 'growth', subStatus: 'past_due', mrrCents: 9900, seats: 10, owner: 'ops@trailhead.co', ownerName: 'Ravi Ops' },
    { name: 'Penpal Learn', slug: 'penpal', plan: 'starter', subStatus: 'trialing', mrrCents: 0, seats: 5, owner: 'hello@penpal.io', ownerName: 'Sofia Lee', trial: true },
    { name: 'Boxly D2C', slug: 'boxly', plan: 'free', subStatus: 'canceled', mrrCents: 0, seats: 3, owner: 'team@boxly.shop', ownerName: 'Tom Box' },
  ];
  for (const c of extraClients) {
    const org = await db.org.create({
      data: {
        name: c.name,
        slug: c.slug,
        plan: c.plan,
        subStatus: c.subStatus,
        mrrCents: c.mrrCents,
        seats: c.seats,
        renewsAt: c.subStatus === 'active' || c.subStatus === 'past_due' ? inDays(rand(28) + 1) : null,
        trialEndsAt: c.trial ? inDays(rand(8) + 1) : null,
        createdAt: daysAgo(rand(120) + 10),
        members: { create: [{ email: c.owner, name: c.ownerName, role: 'admin' }] },
      },
    });
    await db.account.create({
      data: { email: c.owner, name: c.ownerName, passwordHash: demoHash, orgId: org.id, role: 'advertiser' },
    });
  }

  // ── Demo login accounts (so you can sign in immediately) ────────────────────
  await db.account.create({
    data: { email: 'super@aistudioreferrals.com', name: 'Platform Admin', passwordHash: demoHash, role: 'super_admin' },
  });
  await db.account.create({
    data: { email: 'demo@nimbus.io', name: 'Dana Owner', passwordHash: demoHash, orgId: nimbus.id, role: 'advertiser' },
  });
  await db.account.create({
    data: { email: 'owner@verde.shop', name: 'Verde Owner', passwordHash: demoHash, orgId: verde.id, role: 'advertiser' },
  });

  // Demo API key for the public API (full key shown once; we log it here).
  const rawKey = `rl_live_${nano()}${nano()}`.toLowerCase();
  await db.apiKey.create({
    data: {
      orgId: nimbus.id,
      name: 'Default server key',
      prefix: rawKey.slice(0, 12),
      hashedKey: crypto.createHash('sha256').update(rawKey).digest('hex'),
    },
  });

  // ── Campaigns (config-driven, varied reward types) ──────────────────────────
  const saasCampaign = await db.campaign.create({
    data: {
      orgId: nimbus.id,
      name: 'Give $20, Get $20',
      slug: 'give-20-get-20',
      description: 'Double-sided cash reward when an invited team starts a paid plan.',
      triggerEvent: 'subscription',
      attributionModel: 'last_touch',
      attributionWindowDays: 30,
      rewardHoldDays: 7,
      maxRewardsPerUser: 25,
      totalBudgetCents: 500_000,
      referrerReward: rr(
        { type: 'cash', amount: 2000, unit: 'cents', recurring: false, label: '$20 cash' },
        [
          { atConversions: 3, reward: { type: 'cash', amount: 5000, unit: 'cents', recurring: false, label: '$50 bonus' }, badge: 'Rising Star' },
          { atConversions: 8, reward: { type: 'cash', amount: 15000, unit: 'cents', recurring: false, label: '$150 bonus' }, badge: 'Power Referrer' },
          { atConversions: 15, reward: { type: 'free_months', amount: 3, unit: 'months', recurring: false, label: '3 free months' }, badge: 'Legend' },
        ],
      ),
      refereeReward: { type: 'discount', amount: 20, unit: 'percent', recurring: false, label: '20% off first month' } as unknown as Prisma.InputJsonValue,
      eligibility: { newUsersOnly: true, blockDisposableEmail: true } as unknown as Prisma.InputJsonValue,
      abTestKey: 'welcome-offer',
      abWeight: 50,
    },
  });

  // A/B variant of the same offer with a different amount.
  await db.campaign.create({
    data: {
      orgId: nimbus.id,
      name: 'Give 1 Month, Get 1 Month',
      slug: 'give-month-get-month',
      description: 'Variant B — free months instead of cash.',
      triggerEvent: 'subscription',
      attributionModel: 'last_touch',
      rewardHoldDays: 7,
      referrerReward: rr({ type: 'free_months', amount: 1, unit: 'months', recurring: false, label: '1 free month' }),
      refereeReward: { type: 'free_months', amount: 1, unit: 'months', recurring: false, label: '1 free month' } as unknown as Prisma.InputJsonValue,
      abTestKey: 'welcome-offer',
      abWeight: 50,
      status: 'active',
    },
  });

  const shopCampaign = await db.campaign.create({
    data: {
      orgId: verde.id,
      name: 'Refer a Friend — Points',
      slug: 'friend-points',
      description: 'Earn loyalty points on every friend’s first purchase.',
      triggerEvent: 'first_purchase',
      attributionModel: 'first_touch',
      attributionWindowDays: 14,
      rewardHoldDays: 3,
      referrerReward: rr({ type: 'points', amount: 500, unit: 'points', recurring: false, label: '500 points' }),
      refereeReward: { type: 'discount', amount: 1000, unit: 'flat', recurring: false, label: '$10 off' } as unknown as Prisma.InputJsonValue,
    },
  });

  // ── End users + referrals + activity ────────────────────────────────────────
  async function buildUniverse(orgId: string, campaignId: string, count: number, valueRange: [number, number]) {
    for (let i = 0; i < count; i++) {
      const first = pick(FIRST);
      const name = `${first} ${pick(LAST)}`;
      const email = `${first.toLowerCase()}.${nano().toLowerCase()}@example.com`;
      const country = pick(COUNTRIES);
      const user = await db.endUser.create({
        data: {
          orgId,
          email,
          name,
          country,
          avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`,
          createdAt: daysAgo(rand(40) + 5),
        },
      });

      const code = `${first.toUpperCase().slice(0, 4)}-${nano()}`.toLowerCase();
      const referral = await db.referral.create({
        data: { orgId, campaignId, referrerId: user.id, code, createdAt: user.createdAt },
      });

      // Clicks: 0–25
      const clickCount = rand(26);
      const ipHash = hash(`${country}-${rand(50)}`);
      const deviceHash = hash(`dev-${user.id}-${rand(3)}`);
      for (let c = 0; c < clickCount; c++) {
        await db.click.create({
          data: {
            referralId: referral.id,
            ipHash: hash(`${country}-${rand(80)}`),
            deviceHash: hash(`dev-${rand(400)}`),
            country: pick(COUNTRIES),
            userAgent: 'Mozilla/5.0 (seed)',
            referer: pick(['https://twitter.com', 'https://wa.me', 'direct', 'https://news.ycombinator.com']),
            createdAt: daysAgo(rand(30)),
          },
        });
      }

      // Conversions: a fraction of clicks
      const convCount = Math.min(clickCount, rand(Math.ceil(clickCount / 3) + 1));
      for (let c = 0; c < convCount; c++) {
        const value = valueRange[0] + rand(valueRange[1] - valueRange[0]);
        const roll = Math.random();
        const status = roll < 0.7 ? 'approved' : roll < 0.9 ? 'pending' : 'rejected';
        const refereeName = `${pick(FIRST)} ${pick(LAST)}`;
        const referee = await db.endUser.create({
          data: {
            orgId,
            email: `${refereeName.split(' ')[0].toLowerCase()}.${nano().toLowerCase()}@example.com`,
            name: refereeName,
            country: pick(COUNTRIES),
            createdAt: daysAgo(rand(28)),
          },
        });
        const conv = await db.conversion.create({
          data: {
            orgId,
            campaignId,
            referralId: referral.id,
            refereeUserId: referee.id,
            event: (await db.campaign.findUniqueOrThrow({ where: { id: campaignId } })).triggerEvent,
            valueCents: value,
            status,
            attribution: 'last_touch',
            createdAt: daysAgo(rand(25)),
          },
        });

        if (status !== 'rejected') {
          const campaign = await db.campaign.findUniqueOrThrow({ where: { id: campaignId } });
          const cfg = campaign.referrerReward as unknown as ReferrerRewardConfig;
          const base = cfg.base;
          const rewardStatus = status === 'approved' ? (Math.random() < 0.5 ? 'approved' : 'paid') : 'pending';
          await db.reward.create({
            data: {
              orgId,
              campaignId,
              conversionId: conv.id,
              userId: user.id,
              side: 'referrer',
              type: base.type,
              amountCents: base.type === 'cash' || base.type === 'credit' ? base.amount : 0,
              unit: base.unit ?? null,
              quantity: base.type === 'points' || base.type === 'free_months' ? base.amount : 0,
              status: rewardStatus,
              holdUntil: daysAgo(-2),
              createdAt: conv.createdAt,
            },
          });
          if (rewardStatus === 'approved' && (base.type === 'cash' || base.type === 'credit')) {
            await db.endUser.update({ where: { id: user.id }, data: { walletCents: { increment: base.amount } } });
          }
        } else {
          await db.fraudFlag.create({
            data: {
              orgId,
              subjectType: 'conversion',
              subjectId: conv.id,
              reason: pick(['self_referral', 'ip_velocity', 'device_duplicate', 'disposable_email']),
              severity: pick(['medium', 'high']),
              status: 'open',
            },
          });
        }
      }
    }
  }

  console.log('🌱  Building Nimbus (SaaS) universe…');
  await buildUniverse(nimbus.id, saasCampaign.id, 24, [1500, 12000]);
  console.log('🌱  Building Verde (e-commerce) universe…');
  await buildUniverse(verde.id, shopCampaign.id, 16, [2000, 20000]);

  // A couple of payouts to show the wallet/payout flow.
  const richReferrer = await db.endUser.findFirst({
    where: { orgId: nimbus.id, walletCents: { gt: 0 } },
    orderBy: { walletCents: 'desc' },
  });
  if (richReferrer) {
    await db.payout.create({
      data: {
        orgId: nimbus.id,
        userId: richReferrer.id,
        amountCents: Math.min(richReferrer.walletCents, 5000),
        method: 'console',
        status: 'paid',
        reference: `sim_${nano()}`,
        paidAt: daysAgo(2),
      },
    });
  }

  // ── Referrer portal account (linked to a real Nimbus referrer) ──────────────
  const topReferrer =
    (await db.endUser.findFirst({
      where: { orgId: nimbus.id, referralsMade: { some: {} } },
      orderBy: { referralsMade: { _count: 'desc' } },
    })) ?? (await db.endUser.findFirstOrThrow({ where: { orgId: nimbus.id } }));
  await db.endUser.update({ where: { id: topReferrer.id }, data: { email: 'referrer@nimbus.io', name: 'Jordan Referrer' } });
  await db.account.create({
    data: {
      email: 'referrer@nimbus.io',
      name: 'Jordan Referrer',
      passwordHash: demoHash,
      orgId: nimbus.id,
      role: 'referrer',
      endUserId: topReferrer.id,
    },
  });

  // ── Integration provider catalog (no-code, super-admin extensible) ──────────
  const integrationCatalog = [
    { provider: 'stripe', name: 'Stripe', category: 'payouts', fields: [{ key: 'secretKey', label: 'Secret key', type: 'password' }] },
    { provider: 'paypal', name: 'PayPal', category: 'payouts', fields: [{ key: 'clientId', label: 'Client ID', type: 'text' }, { key: 'clientSecret', label: 'Client secret', type: 'password' }] },
    { provider: 'resend', name: 'Resend', category: 'messaging', fields: [{ key: 'apiKey', label: 'API key', type: 'password' }] },
    { provider: 'twilio', name: 'Twilio', category: 'messaging', fields: [{ key: 'accountSid', label: 'Account SID', type: 'text' }, { key: 'authToken', label: 'Auth token', type: 'password' }] },
    { provider: 'slack', name: 'Slack', category: 'messaging', fields: [{ key: 'webhookUrl', label: 'Webhook URL', type: 'text' }] },
    { provider: 'shopify', name: 'Shopify', category: 'ecommerce', fields: [{ key: 'apiKey', label: 'API key', type: 'password' }] },
    { provider: 'hubspot', name: 'HubSpot', category: 'crm', fields: [{ key: 'apiKey', label: 'API key', type: 'password' }] },
    { provider: 'posthog', name: 'PostHog', category: 'analytics', fields: [{ key: 'projectKey', label: 'Project key', type: 'text' }] },
  ];
  for (const p of integrationCatalog) {
    await db.integrationProvider.create({
      data: { slug: p.provider, name: p.name, category: p.category, fields: p.fields as unknown as Prisma.InputJsonValue, enabled: true },
    });
  }

  // ── Per-client integration connections ──────────────────────────────────────
  for (const org of [nimbus, verde]) {
    for (const intg of integrationCatalog) {
      const connected = Math.random() < 0.5;
      await db.integration.create({
        data: {
          orgId: org.id,
          provider: intg.provider,
          category: intg.category,
          status: connected ? 'connected' : 'disconnected',
          connectedAt: connected ? daysAgo(rand(40)) : null,
        },
      });
    }
  }

  // ── Notifications (platform broadcasts + per-client) ────────────────────────
  await db.notification.create({
    data: { audience: 'all', channel: 'inapp', title: 'Welcome to Ai Studio Referrals', body: 'Your referral platform is live. Launch your first campaign to get started.', status: 'sent', createdAt: daysAgo(8) },
  });
  await db.notification.create({
    data: { audience: 'advertisers', channel: 'email', title: 'New: milestone reward tiers', body: 'You can now reward your top referrers with milestone bonuses.', status: 'sent', createdAt: daysAgo(3) },
  });
  await db.notification.create({
    data: { orgId: nimbus.id, audience: 'referrers', channel: 'inapp', title: 'Double rewards weekend', body: 'Earn 2× on every successful referral this weekend only.', status: 'sent', createdAt: daysAgo(1) },
  });

  // ── Platform settings (no-code config) ──────────────────────────────────────
  const settings = [
    { key: 'platform_name', value: 'Ai Studio Referrals', group: 'general', label: 'Platform name', type: 'text' },
    { key: 'support_email', value: 'support@aistudioreferrals.com', group: 'general', label: 'Support email', type: 'text' },
    { key: 'signups_enabled', value: 'true', group: 'access', label: 'Allow new sign-ups', type: 'boolean' },
    { key: 'default_trial_days', value: '14', group: 'billing', label: 'Default trial length (days)', type: 'number' },
    { key: 'default_currency', value: 'USD', group: 'billing', label: 'Default currency', type: 'text' },
    { key: 'fraud_hold_days', value: '7', group: 'fraud', label: 'Default reward hold (days)', type: 'number' },
    { key: 'maintenance_mode', value: 'false', group: 'access', label: 'Maintenance mode', type: 'boolean' },
  ];
  for (const s of settings) await db.platformSetting.create({ data: s });

  // ── Community posts ─────────────────────────────────────────────────────────
  const posts = [
    { authorName: 'Ai Studio Team', authorRole: 'team', category: 'announcements', title: 'Welcome to the community 👋', body: 'Share your referral wins, ask questions, and request features. We read everything.', pinned: true, createdAt: daysAgo(14) },
    { authorName: 'Dana Owner', authorRole: 'advertiser', category: 'wins', title: 'Hit a 1.8× viral coefficient!', body: 'Switched to double-sided cash rewards and our K-factor crossed 1.8 this month. Game changer.', createdAt: daysAgo(5) },
    { authorName: 'Jordan Referrer', authorRole: 'referrer', category: 'general', title: 'Best channels for sharing?', body: 'WhatsApp is converting way better than X for me. What works for you all?', createdAt: daysAgo(2) },
    { authorName: 'Ai Studio Team', authorRole: 'team', category: 'feature-requests', title: 'Roadmap: in-app payouts', body: 'We are exploring native payouts. Reply with the providers you need most.', createdAt: daysAgo(1) },
  ];
  for (const p of posts) await db.communityPost.create({ data: p });

  await db.auditLog.create({
    data: { orgId: nimbus.id, actor: 'system', action: 'seed.completed', metadata: { ok: true } as Prisma.InputJsonValue },
  });

  const stats = {
    orgs: await db.org.count(),
    campaigns: await db.campaign.count(),
    users: await db.endUser.count(),
    referrals: await db.referral.count(),
    clicks: await db.click.count(),
    conversions: await db.conversion.count(),
    rewards: await db.reward.count(),
  };
  console.log('✅  Seed complete:', stats);
  console.log(`🔑  Demo API key (save it, shown once): ${rawKey}`);
  console.log('👤  Demo logins (password: Demo1234):');
  console.log('     • Platform admin →  super@aistudioreferrals.com');
  console.log('     • Advertiser     →  demo@nimbus.io');
  console.log('     • Referrer       →  referrer@nimbus.io');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
