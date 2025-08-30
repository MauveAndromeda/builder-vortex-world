import SEO from "@/components/site/SEO";
import { useLocale, t } from "@/lib/i18n";

export default function About() {
  const { locale } = useLocale();
  return (
    <section className="py-16 max-w-3xl">
      <SEO
        title={`About — ${t("brand", locale)}`}
        description="About YCity Bookroom."
      />
      <h1 className="text-3xl font-semibold">About</h1>
      <p className="mt-4 text-muted-foreground">
        YCity Bookroom is a minimalist space for literary experiments—quiet
        reading, generous typography, and gentle motion.
      </p>
    </section>
  );
}
