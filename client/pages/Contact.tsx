import SEO from "@/components/site/SEO";
import { useLocale, t } from "@/lib/i18n";
import { useState } from "react";

export default function Contact() {
  const { locale } = useLocale();
  const [status, setStatus] = useState<string>("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    try {
      await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.get("name"), email: data.get("email"), message: data.get("message") }) });
      setStatus("Sent");
      e.currentTarget.reset();
    } catch {
      setStatus("Error");
    }
  }
  return (
    <section className="py-16 max-w-3xl">
      <SEO title={`Contact — ${t("brand", locale)}`} description="Contact YCity Bookroom." />
      <h1 className="text-3xl font-semibold">Contact</h1>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <input required name="name" placeholder="Name" className="rounded-xl border px-4 py-2" />
        <input required type="email" name="email" placeholder="Email" className="rounded-xl border px-4 py-2" />
        <textarea required name="message" placeholder="Message" rows={5} className="rounded-xl border px-4 py-2" />
        <button className="rounded-full bg-foreground text-background px-5 py-2 text-sm w-fit">Send</button>
        {status && <div className="text-sm text-muted-foreground">{status}</div>}
      </form>
    </section>
  );
}
