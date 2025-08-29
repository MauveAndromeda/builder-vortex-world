import SEO from "@/components/site/SEO";
import { useLocale, t } from "@/lib/i18n";

export default function Profile() {
  const { locale } = useLocale();
  return (
    <section className="py-16 max-w-2xl">
      <SEO title={`Profile — ${t("brand", locale)}`} />
      <h1 className="text-3xl font-semibold">Profile</h1>
      <p className="mt-2 text-muted-foreground text-sm">Manage your account details.</p>
    </section>
  );
}
