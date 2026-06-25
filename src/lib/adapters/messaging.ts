/**
 * Messaging adapter. Picks an email/SMS/alert provider from env at runtime.
 * Unconfigured providers fall back to a console stub so the app always runs.
 * Swap in Resend/SendGrid/Twilio/Slack by setting the relevant env vars.
 */

export type MessageEvent =
  | 'reward.issued'
  | 'payout.requested'
  | 'payout.paid'
  | 'fraud.flagged'
  | 'referral.invited';

export interface EmailAdapter {
  send(args: { to: string; subject: string; html: string }): Promise<void>;
}

class ConsoleEmail implements EmailAdapter {
  async send({ to, subject }: { to: string; subject: string; html: string }) {
    console.log(`[email:console] → ${to} | ${subject}`);
  }
}

class ResendEmail implements EmailAdapter {
  constructor(private apiKey: string, private from: string) {}
  async send({ to, subject, html }: { to: string; subject: string; html: string }) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to, subject, html }),
    });
  }
}

export function getEmailAdapter(): EmailAdapter {
  const provider = process.env.EMAIL_PROVIDER ?? 'console';
  const from = process.env.EMAIL_FROM ?? 'rewards@aistudioreferrals.dev';
  if (provider === 'resend' && process.env.RESEND_API_KEY) {
    return new ResendEmail(process.env.RESEND_API_KEY, from);
  }
  // sendgrid/etc. would slot in here.
  return new ConsoleEmail();
}

async function alertAdmins(event: MessageEvent, data: Record<string, unknown>) {
  const slack = process.env.SLACK_WEBHOOK_URL;
  const discord = process.env.DISCORD_WEBHOOK_URL;
  const text = `*${event}* ${JSON.stringify(data)}`;
  try {
    if (slack) await fetch(slack, { method: 'POST', body: JSON.stringify({ text }) });
    if (discord) await fetch(discord, { method: 'POST', body: JSON.stringify({ content: text }) });
  } catch {
    /* alerts are best-effort */
  }
}

async function outboundWebhook(event: MessageEvent, data: Record<string, unknown>) {
  const url = process.env.OUTBOUND_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, ts: Date.now() }),
    });
  } catch {
    /* best-effort */
  }
}

/** Unified event emitter: emails the user, alerts admins, fires outbound webhooks. */
export async function emit(
  event: MessageEvent,
  args: { orgId: string; to?: string; subject?: string; data: Record<string, unknown> },
) {
  const tasks: Promise<unknown>[] = [outboundWebhook(event, { orgId: args.orgId, ...args.data })];
  if (event === 'fraud.flagged') tasks.push(alertAdmins(event, args.data));
  if (args.to && args.subject) {
    tasks.push(
      getEmailAdapter().send({
        to: args.to,
        subject: args.subject,
        html: `<p>${args.subject}</p>`,
      }),
    );
  }
  await Promise.allSettled(tasks);
}
