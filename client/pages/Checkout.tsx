import { useParams } from "react-router-dom";
import { useLocale, t, localized } from "@/lib/i18n";
import SEO from "@/components/site/SEO";
import { works, getChaptersByWork } from "@/data/content";
import { useEffect, useMemo, useState } from "react";

function usePublishableKey() {
  const meta = document.querySelector('meta[name="stripe-publishable-key"]') as HTMLMetaElement | null;
  return meta?.content || "";
}

export default function Checkout() {
  const { locale } = useLocale();
  const params = useParams();
  const mode = (params.mode || "").toString();
  const slug = params.slug;
  const order = params.order ? Number(params.order) : undefined;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const pk = usePublishableKey();

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
      return { label: `${slug} #${order}`, amount: Math.round((c.price || 1) * 100) };
    }
    if (mode === "donation") return { label: "Donation", amount: 500 }; // $5 default
    return null;
  }, [mode, slug, order]);

  useEffect(() => {
    async function createIntent() {
      if (!item) return;
      setStatus("Preparing...");
      const res = await fetch("/api/stripe/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: item.amount, currency: "usd", mode, slug, order }),
      });
      const data = await res.json();
      setClientSecret(data.clientSecret || null);
      setStatus(data.demo ? "Demo mode (no key)." : "Ready");
    }
    createIntent();
  }, [item, mode, slug, order]);

  return (
    <section className="py-16 max-w-xl">
      <SEO title={`Checkout — ${t("brand", locale)}`} description="Secure checkout" />
      <h1 className="text-3xl font-semibold">Checkout</h1>
      {!item ? (
        <p className="mt-4 text-muted-foreground">Invalid item.</p>
      ) : (
        <div className="mt-6 rounded-2xl border p-6">
          <div className="font-medium">{item.label}</div>
          <div className="mt-1 text-sm text-muted-foreground">${(item.amount/100).toFixed(2)} USD</div>
          <div className="mt-4 text-sm">{status}</div>
          {!pk && <div className="mt-2 text-xs text-amber-600">Stripe publishable key not set. Running in demo mode.</div>}
          {clientSecret ? (
            <button className="mt-6 rounded-full bg-foreground text-background px-5 py-2 text-sm" onClick={()=>alert("Use test card 4242… on Stripe Elements once keys are set.")}>Pay</button>
          ) : (
            <div className="mt-6 text-sm text-muted-foreground">Creating payment intent…</div>
          )}
        </div>
      )}
    </section>
  );
}
