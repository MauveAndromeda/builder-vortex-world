import SEO from "@/components/site/SEO";
import { useLocale, t } from "@/lib/i18n";
import { Link, Outlet } from "react-router-dom";

export default function AccountLayout() {
  const { locale } = useLocale();
  return (
    <section className="py-16">
      <SEO title={`Account — ${t("brand", locale)}`} />
      <h1 className="text-3xl font-semibold">Account</h1>
      <nav className="mt-4 flex gap-4 text-sm">
        <Link to="sign-in" className="underline">Sign in</Link>
        <Link to="register" className="underline">Register</Link>
        <Link to="purchases" className="underline">Purchases</Link>
      </nav>
      <div className="mt-6">
        <Outlet />
      </div>
    </section>
  );
}

export function SignIn() {
  return <div className="text-muted-foreground">Sign in — coming soon.</div>;
}
export function Register() {
  return <div className="text-muted-foreground">Register — coming soon.</div>;
}
export function Purchases() {
  return <div className="text-muted-foreground">Purchases — coming soon.</div>;
}
