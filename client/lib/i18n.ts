import { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export type Locale = "en" | "zh-CN";
export const SUPPORTED_LOCALES: Locale[] = ["en", "zh-CN"];

export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const params = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const raw = (params.locale as string) || "en";
  const locale: Locale = SUPPORTED_LOCALES.includes(raw as Locale) ? (raw as Locale) : "en";

  function setLocale(next: Locale) {
    const parts = loc.pathname.split("/").filter(Boolean);
    if (parts.length === 0) {
      nav(`/${next}${loc.search}${loc.hash}`, { replace: true });
      return;
    }
    const [, ...rest] = [parts[0], ...parts.slice(1)];
    const path = rest.length ? `/${next}/` + rest.join("/") : `/${next}`;
    nav(path + loc.search + loc.hash, { replace: true });
  }

  return useMemo(() => ({ locale, setLocale }), [locale]);
}

export const t = (key: string, locale: Locale): string => {
  const dict: Record<Locale, Record<string, string>> = {
    en: {
      brand: "YCity Bookroom",
      hero: "You found YCity’s little bookroom",
      readOnline: "Read online",
      buyAll: "Buy all $1000",
      searchPlaceholder: "Search works, authors…",
      works: "Works",
      about: "About",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      comingSoon: "Coming soon",
      newsletterTitle: "Get updates",
      newsletterDesc: "Occasional notes. No spam.",
      emailPlaceholder: "Your email",
      subscribe: "Subscribe",
      chapters: "Chapters",
      home: "Home",
      notFound: "Page not found",
    },
    "zh-CN": {
      brand: "YCity 小书房",
      hero: "你找到了 YCity 的小书房",
      readOnline: "在线阅读",
      buyAll: "全部购买 $1000",
      searchPlaceholder: "搜索作品、作者…",
      works: "作品",
      about: "关于",
      contact: "联系",
      privacy: "隐私",
      terms: "条款",
      comingSoon: "即将上线",
      newsletterTitle: "订阅更新",
      newsletterDesc: "偶尔来���，不打扰。",
      emailPlaceholder: "你的邮箱",
      subscribe: "订阅",
      chapters: "章节",
      home: "首页",
      notFound: "页面未找到",
    },
  };
  return dict[locale][key] ?? key;
};

export function localized(path: string, locale: Locale) {
  if (!path || path === "/") return `/${locale}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export const CANONICAL_DOMAIN = "https://yclit.org";
