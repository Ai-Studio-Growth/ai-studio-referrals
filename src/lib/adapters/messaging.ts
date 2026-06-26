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

// ── WhatsApp ──────────────────────────────────────────────────────────────────
// Same swappable-adapter pattern as email: unconfigured providers fall back to a
// console stub so OTP flows run end-to-end in dev without any credentials.

export interface WhatsAppAdapter {
  send(args: { to: string; body: string }): Promise<void>;
}

class ConsoleWhatsApp implements WhatsAppAdapter {
  async send({ to, body }: { to: string; body: string }) {
    console.log(`[whatsapp:console] → ${to} | ${body}`);
  }
}

/** Twilio WhatsApp (https://www.twilio.com/whatsapp). `from` must be a WhatsApp-enabled number. */
class TwilioWhatsApp implements WhatsAppAdapter {
  constructor(private sid: string, private token: string, private from: string) {}
  async send({ to, body }: { to: string; body: string }) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`;
    const auth = Buffer.from(`${this.sid}:${this.token}`).toString('base64');
    const form = new URLSearchParams({
      To: `whatsapp:${to}`,
      From: `whatsapp:${this.from}`,
      Body: body,
    });
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
  }
}

/** Meta WhatsApp Cloud API (graph.facebook.com). Sends a plain text message. */
class MetaWhatsApp implements WhatsAppAdapter {
  constructor(private phoneNumberId: string, private token: string) {}
  async send({ to, body }: { to: string; body: string }) {
    const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/^\+/, ''),
        type: 'text',
        text: { body },
      }),
    });
  }
}

export function getWhatsAppAdapter(): WhatsAppAdapter {
  const provider = process.env.WHATSAPP_PROVIDER ?? 'console';
  if (
    provider === 'twilio' &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM
  ) {
    return new TwilioWhatsApp(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      process.env.TWILIO_WHATSAPP_FROM,
    );
  }
  if (provider === 'meta' && process.env.META_WHATSAPP_PHONE_ID && process.env.META_WHATSAPP_TOKEN) {
    return new MetaWhatsApp(process.env.META_WHATSAPP_PHONE_ID, process.env.META_WHATSAPP_TOKEN);
  }
  return new ConsoleWhatsApp();
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
