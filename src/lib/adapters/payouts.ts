/**
 * Payout adapter. A single interface with provider implementations selected by
 * PAYOUT_PROVIDER. The console provider simulates a successful payout so the
 * end-to-end flow (request → processing → paid) works with zero config.
 */

export type PayoutRequest = {
  amountCents: number;
  currency?: string;
  recipientEmail: string;
  recipientName?: string | null;
  note?: string;
};

export type PayoutResult = {
  status: 'paid' | 'processing' | 'failed';
  reference: string;
  provider: string;
};

export interface PayoutAdapter {
  readonly name: string;
  send(req: PayoutRequest): Promise<PayoutResult>;
}

class ConsolePayout implements PayoutAdapter {
  name = 'console';
  async send(req: PayoutRequest): Promise<PayoutResult> {
    const reference = `sim_${Math.random().toString(36).slice(2, 10)}`;
    console.log(`[payout:console] ${req.amountCents}¢ → ${req.recipientEmail} (${reference})`);
    return { status: 'paid', reference, provider: this.name };
  }
}

class StripePayout implements PayoutAdapter {
  name = 'stripe';
  constructor(private secret: string) {}
  async send(req: PayoutRequest): Promise<PayoutResult> {
    // Real impl: Stripe Transfers / Connect payouts. Stubbed network call shape:
    // await stripe.transfers.create({ amount: req.amountCents, currency, destination })
    if (!this.secret) return { status: 'failed', reference: '', provider: this.name };
    return { status: 'processing', reference: `tr_${Date.now()}`, provider: this.name };
  }
}

// PayPal / Razorpay / Wise / Tremendous would follow the same shape.

export function getPayoutAdapter(): PayoutAdapter {
  const provider = process.env.PAYOUT_PROVIDER ?? 'console';
  switch (provider) {
    case 'stripe':
      return new StripePayout(process.env.STRIPE_SECRET_KEY ?? '');
    default:
      return new ConsolePayout();
  }
}
