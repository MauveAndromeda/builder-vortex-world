import { RequestHandler } from "express";

export const handleCreateIntent: RequestHandler = async (req, res) => {
  try {
    const { amount, currency = "usd", mode, slug, order } = req.body || {};
    if (!amount || typeof amount !== "number") return res.status(400).json({ ok: false, error: "amount required" });
    const sk = process.env.STRIPE_SECRET_KEY;
    const metadata: Record<string, string> = { mode: String(mode || "unknown") };
    if (slug) metadata.slug = String(slug);
    if (order) metadata.order = String(order);

    if (!sk) {
      return res.json({ ok: true, demo: true, clientSecret: "demo_client_secret" });
    }

    const body = new URLSearchParams({
      amount: String(amount),
      currency,
      "automatic_payment_methods[enabled]": "true",
      "metadata[mode]": metadata.mode,
      ...(metadata.slug ? { "metadata[slug]": metadata.slug } : {}),
      ...(metadata.order ? { "metadata[order]": metadata.order } : {}),
    });

    const r = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sk}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const json = await r.json();
    if (!r.ok) return res.status(400).json({ ok: false, error: json.error?.message || "stripe_error" });
    return res.json({ ok: true, clientSecret: json.client_secret });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "server_error" });
  }
};

export const handleStripeWebhook: RequestHandler = async (req, res) => {
  try {
    // For simplicity, we do not verify signature here. Configure verification in production.
    res.json({ received: true });
  } catch {
    res.status(500).end();
  }
};
