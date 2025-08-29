import SEO from "@/components/site/SEO";
import { t, useLocale } from "@/lib/i18n";

export default function Placeholder({ title }: { title: string }) {
  const { locale } = useLocale();
  return (
    <section className="py-16">
      <SEO title={`${title} — ${t("brand", locale)}`} />
      <div className="max-w-prose">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-muted-foreground">{t("comingSoon", locale)}.</p>
      </div>
    </section>
  );
}
