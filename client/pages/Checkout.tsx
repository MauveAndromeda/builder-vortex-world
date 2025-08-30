import { useLocale, t, localized } from "@/lib/i18n";
import SEO from "@/components/site/SEO";
import { works, getChaptersByWork } from "@/data/content";
import { useEffect, useMemo, useState } from "react";
import * as I18N from "@/lib/i18n";
import { toast } from "sonner";
import { useParams, useLocation } from "react-router-dom";

async function getPublishableKey() {
  try {
    const r = await fetch("/api/stripe/publishable-key");
    const j = await r.json();
    return j.publishableKey as string;
  } catch {
    return "";
  }
}

export default function Checkout() {
  const { locale } = I18N.useLocale();
  const params = useParams();
  const loc = useLocation();
  let mode = "" as string;
  if (loc.pathname.includes("/buy-all")) mode = "buy-all";
  else if (loc.pathname.includes("/work/")) mode = "work";
  else if (loc.pathname.includes("/chapter/")) mode = "chapter";
  else if (loc.pathname.includes("/donation")) mode = "donation";
  const slug = params.slug;
  const order = params.order ? Number(params.order) : undefined;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [pk, setPk] = useState<string>("");
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [human, setHuman] = useState(false);

  const item = useMemo(() => {
    if (mode === "buy-all") return { label: "Buy All", amount: 100000 }; // $1000
    if (mode === "work" && slug) {
      const w = works.find((x) => x.slug === slug);
      if (!w) return null;
      return { label: w.title, amount: Math.round((w.price || 10) * 100) };
    }
    if (mode === "chapter" && slug && order) {
      const c = getChaptersByWork(slug).find((x) => x.order === order);
      if (!c) return null;
      return {
        label: `${slug} #${order}`,
        amount: Math.round((c.price || 1) * 100),
      };
    }
    if (mode === "donation") return { label: "Donation", amount: 500 }; // $5 default
    return null;
  }, [mode, slug, order]);

  useEffect(() => {
    async function setup() {
      if (!item) return;
      setStatus("Preparing...");
      const [key, intentRes] = await Promise.all([
        getPublishableKey(),
        fetch("/api/stripe/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: item.amount,
            currency: "usd",
            mode,
            slug,
            order,
          }),
        }).then((r) => r.json()),
      ]);
      setPk(key || "");
      setClientSecret(intentRes.clientSecret || null);
      setStatus(intentRes.demo ? "Demo mode (no key)." : "Ready");
      if (key && intentRes.clientSecret && (window as any).Stripe) {
        const s = (window as any).Stripe(key);
        const els = s.elements({ clientSecret: intentRes.clientSecret });
        const payment = els.create("payment");
        payment.mount("#payment-element");
        setStripe(s);
        setElements(els);
      }
    }
    setup();
  }, [item, mode, slug, order]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setStatus("Confirming payment…");
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:
          window.location.origin + "/" + locale + "/account/purchases",
      },
      redirect: "if_required",
    });
    if (error) setStatus(error.message || "Payment failed");
    else {
      setStatus("Paid or redirected");
      try {
        const ach: string[] = [];
        if (mode === "donation") ach.push("first_tip");
        if (mode === "buy-all") ach.push("first_buy_all");
        if (ach.length) {
          await fetch("/api/achievements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ achievements: ach }),
          });
        }
        ach.forEach((a) =>
          toast(`Achievement unlocked: ${a.replace("_", " ")}`),
        );
      } catch {}
    }
  }

  return (
    <section className="py-16 max-w-xl">
      <SEO
        title={`Checkout — ${I18N.t("brand", locale)}`}
        description="Secure checkout"
      />
      <h1 className="text-3xl font-semibold">Checkout</h1>
      {!item ? (
        <p className="mt-4 text-muted-foreground">Invalid item.</p>
      ) : (
        <div className="mt-6 rounded-2xl border p-6">
          <div className="font-medium">{item.label}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            ${(item.amount / 100).toFixed(2)} USD
          </div>
          <div className="mt-4 text-sm">{status}</div>
          {!pk && (
            <div className="mt-2 text-xs text-amber-600">
              Stripe publishable key not set. Running in demo mode.
            </div>
          )}
          {clientSecret ? (
            <form onSubmit={pay} className="mt-4 grid gap-4">
              <div className="rounded-md border p-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={human}
                    onChange={(e) => setHuman(e.target.checked)}
                  />
                  I am human
                </label>
                <div id="payment-element" className="mt-3"></div>
              </div>
              <button
                disabled={!human}
                className="rounded-full bg-foreground text-background px-5 py-2 text-sm disabled:opacity-50"
              >
                Pay
              </button>
            </form>
          ) : (
            <div className="mt-6 text-sm text-muted-foreground">
              Creating payment intent…
            </div>
          )}
        </div>
      )}
    </section>
  );
}
