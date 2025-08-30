import { RequestHandler } from "express";
import Stripe from "stripe";

export const handlePublicKey: RequestHandler = (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "" });
};

export const handleCreateIntent: RequestHandler = async (req, res) => {
  try {
    const { amount, currency = "usd", mode, slug, order } = req.body || {};
    if (!amount || typeof amount !== "number")
      return res.status(400).json({ ok: false, error: "amount required" });
    const sk = process.env.STRIPE_SECRET_KEY;
    const metadata: Record<string, string> = {
      mode: String(mode || "unknown"),
    };
    if (slug) metadata.slug = String(slug);
    if (order) metadata.order = String(order);

    if (!sk) {
      return res.json({
        ok: true,
        demo: true,
        clientSecret: "demo_client_secret",
      });
    }

    const stripe = new Stripe(sk, { apiVersion: "2025-08-27.basil" });
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });
    return res.json({ ok: true, clientSecret: intent.client_secret });
  } catch (e: any) {
    return res
      .status(500)
      .json({ ok: false, error: e?.message || "server_error" });
  }
};

export const handleStripeWebhook: RequestHandler = async (req, res) => {
  try {
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sk = process.env.STRIPE_SECRET_KEY || "";
    if (!sk) return res.status(200).json({ received: true, demo: true });
    const stripe = new Stripe(sk, { apiVersion: "2025-08-27.basil" });

    if (whSecret) {
      const sig = req.headers["stripe-signature"] as string | undefined;
      const raw = (req as any).body; // express.raw
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(raw, sig!, whSecret);
      } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      // Optionally handle event.type
      return res.json({ received: true, id: event.id });
    }

    return res.json({ received: true });
  } catch {
    res.status(500).end();
  }
};
