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

// `code` is the bare OTP (e.g. "042913") for template-based sends; `body` is the
// full human-readable line used by the console stub and sandbox/free-form sends.
export interface WhatsAppAdapter {
  send(args: { to: string; body: string; code?: string }): Promise<void>;
}

class ConsoleWhatsApp implements WhatsAppAdapter {
  async send({ to, body }: { to: string; body: string; code?: string }) {
    console.log(`[whatsapp:console] → ${to} | ${body}`);
  }
}

/**
 * Twilio WhatsApp (https://www.twilio.com/whatsapp). `from` must be a
 * WhatsApp-enabled sender. WhatsApp blocks free-form business-initiated
 * messages, so for production set TWILIO_WHATSAPP_CONTENT_SID to an approved
 * authentication Content Template (the code is passed as variable {{1}}). When
 * no template is set we fall back to a plain Body — which only delivers inside
 * the Twilio sandbox or a 24-hour service window.
 */
class TwilioWhatsApp implements WhatsAppAdapter {
  constructor(
    private sid: string,
    private token: string,
    private from: string,
    private contentSid?: string,
  ) {}
  async send({ to, body, code }: { to: string; body: string; code?: string }) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`;
    const auth = Buffer.from(`${this.sid}:${this.token}`).toString('base64');
    const form = new URLSearchParams({ To: `whatsapp:${to}`, From: `whatsapp:${this.from}` });
    if (this.contentSid) {
      form.set('ContentSid', this.contentSid);
      form.set('ContentVariables', JSON.stringify({ '1': code ?? body }));
    } else {
      form.set('Body', body);
    }
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
  }
}

/**
 * Meta WhatsApp Cloud API (graph.facebook.com). For production OTP set
 * META_WHATSAPP_TEMPLATE to an approved "authentication" template name (the code
 * fills the body {{1}} and the copy-code button). Without it we send plain text,
 * which only delivers within a 24-hour customer service window.
 */
class MetaWhatsApp implements WhatsAppAdapter {
  constructor(
    private phoneNumberId: string,
    private token: string,
    private template?: string,
    private lang = 'en_US',
  ) {}
  async send({ to, body, code }: { to: string; body: string; code?: string }) {
    const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
    const recipient = to.replace(/^\+/, '');
    const payload =
      this.template && code
        ? {
            messaging_product: 'whatsapp',
            to: recipient,
            type: 'template',
            template: {
              name: this.template,
              language: { code: this.lang },
              components: [
                { type: 'body', parameters: [{ type: 'text', text: code }] },
                { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
              ],
            },
          }
        : { messaging_product: 'whatsapp', to: recipient, type: 'text', text: { body } };
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
      process.env.TWILIO_WHATSAPP_CONTENT_SID || undefined,
    );
  }
  if (provider === 'meta' && process.env.META_WHATSAPP_PHONE_ID && process.env.META_WHATSAPP_TOKEN) {
    return new MetaWhatsApp(
      process.env.META_WHATSAPP_PHONE_ID,
      process.env.META_WHATSAPP_TOKEN,
      process.env.META_WHATSAPP_TEMPLATE || undefined,
      process.env.META_WHATSAPP_LANG || undefined,
    );
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
