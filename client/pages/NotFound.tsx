import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { t, useLocale, localized } from "@/lib/i18n";

const NotFound = () => {
  const location = useLocation();
  const { locale } = useLocale();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <section className="py-24 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-semibold">404</h1>
        <p className="mt-2 text-muted-foreground">{t("notFound", locale)}</p>
        <div className="mt-6">
          <Link
            className="rounded-full bg-foreground text-background px-4 py-2 text-sm"
            to={localized("/", locale)}
          >
            {t("home", locale)}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
