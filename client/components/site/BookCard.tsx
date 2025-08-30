import { Link } from "react-router-dom";
import { localized, useLocale, t } from "@/lib/i18n";
import { Work } from "@/data/content";

export default function BookCard({ work }: { work: Work }) {
  const { locale } = useLocale();
  return (
    <article className="group rounded-2xl border overflow-hidden transition hover:shadow-sm">
      <div className="block">
        <Link to={localized(`/work/${work.slug}`, locale)} className="block">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={work.cover}
              alt={work.title}
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </Link>
        <div className="p-4">
          <h3 className="font-semibold leading-snug">
            <Link
              to={localized(`/work/${work.slug}`, locale)}
              className="hover:underline underline-offset-4"
            >
              {work.title}
            </Link>
          </h3>
          <div className="text-xs text-muted-foreground mt-0.5">
            {work.author}
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {work.excerpt}
          </p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="opacity-70">${work.price?.toFixed(2)}</span>
            <div className="flex gap-2">
              <Link
                to={localized(`/work/${work.slug}`, locale)}
                className="rounded-full border px-3 py-1 transition group-hover:bg-muted"
              >
                {t("readOnline", locale)}
              </Link>
              <Link
                to={localized(`/checkout/work/${work.slug}`, locale)}
                className="rounded-full border px-3 py-1 transition group-hover:bg-muted"
              >
                Buy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
