import SEO from "@/components/site/SEO";
import SEO from "@/components/site/SEO";
import { useLocale, t, localized } from "@/lib/i18n";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { works } from "@/data/content";

function getUser(){ try{ return JSON.parse(localStorage.getItem("auth:user")||"null"); }catch{return null;} }

export default function AccountLayout() {
  const { locale } = useLocale();
  const nav = useNavigate();
  const [user, setUser] = useState<any>(getUser());
  useEffect(()=>{
    const on = () => setUser(getUser());
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  },[]);
  function signOut(){ localStorage.removeItem("auth:user"); localStorage.removeItem("auth:password"); setUser(null); nav(localized("/account/sign-in", locale)); }
  return (
    <section className="py-16">
      <SEO title={`Account — ${t("brand", locale)}`} />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Account</h1>
        <div className="flex items-center gap-3">
          <Link to={localized("/checkout/donation", locale)} className="rounded-full bg-foreground text-background px-4 py-2 text-sm">Donate</Link>
          {user ? <button onClick={signOut} className="rounded-full border px-4 py-2 text-sm">Sign out</button> : null}
        </div>
      </div>
      <nav className="mt-4 flex gap-4 text-sm">
        <Link to="sign-in" className="underline">Sign in</Link>
        <Link to="register" className="underline">Register</Link>
        <Link to="purchases" className="underline">Purchases</Link>
        <Link to="/profile" className="underline">Profile</Link>
      </nav>
      {user && (
        <div className="mt-4 rounded-2xl border p-4 bg-card">
          <div className="text-sm text-muted-foreground">Signed in as</div>
          <div className="font-medium">{user.name || user.email}</div>
          <div className="text-xs opacity-80">{user.email}</div>
        </div>
      )}
      <div className="mt-6">
        <Outlet />
      </div>
    </section>
  );
}

export function SignIn() {
  const { locale } = useLocale();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  function submit(e: React.FormEvent){
    e.preventDefault(); setErr("");
    const saved = localStorage.getItem("auth:password");
    const u = getUser();
    if (!u || !saved){ setErr("No account found. Please register."); return; }
    const ok = btoa(password) === saved && u.email === email;
    if (!ok){ setErr("Email or password incorrect."); return; }
    nav(localized("/account/purchases", locale));
  }
  return (
    <form onSubmit={submit} className="max-w-sm grid gap-3">
      <label className="grid gap-1 text-sm">
        <span>Email</span>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required className="rounded-md border px-3 py-2 bg-background" />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Password</span>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required className="rounded-md border px-3 py-2 bg-background" />
      </label>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button className="mt-1 rounded-full bg-foreground text-background px-4 py-2 text-sm">Sign in</button>
    </form>
  );
}

export function Register() {
  const { locale } = useLocale();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  function submit(e: React.FormEvent){
    e.preventDefault(); setErr("");
    if (password.length < 6){ setErr("Password must be at least 6 characters."); return; }
    const user = { name, email };
    try{
      localStorage.setItem("auth:user", JSON.stringify(user));
      localStorage.setItem("auth:password", btoa(password));
    }catch{}
    nav(localized("/account/purchases", locale));
  }
  return (
    <form onSubmit={submit} className="max-w-sm grid gap-3">
      <label className="grid gap-1 text-sm">
        <span>Name</span>
        <input value={name} onChange={(e)=>setName(e.target.value)} required className="rounded-md border px-3 py-2 bg-background" />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Email</span>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required className="rounded-md border px-3 py-2 bg-background" />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Password</span>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required className="rounded-md border px-3 py-2 bg-background" />
      </label>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button className="mt-1 rounded-full bg-foreground text-background px-4 py-2 text-sm">Create account</button>
    </form>
  );
}

export function Purchases() {
  const owned = useMemo(()=> works.filter(w=> localStorage.getItem(`owned:${w.slug}`)==='1'), []);
  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border p-4">
        <div className="font-medium">Your Library</div>
        {owned.length===0 ? (
          <div className="text-sm text-muted-foreground mt-1">No purchases yet.</div>
        ) : (
          <ul className="mt-2 text-sm list-disc pl-5">
            {owned.map(w=> <li key={w.slug}>{w.title}</li>)}
          </ul>
        )}
      </div>
      <div className="rounded-2xl border p-4">
        <div className="font-medium">Support</div>
        <p className="text-sm text-muted-foreground mt-1">If you enjoy the reading experience, consider a small donation.</p>
        <Link to="../checkout/donation" className="mt-3 inline-flex rounded-full bg-foreground text-background px-4 py-2 text-sm">Donate</Link>
      </div>
    </div>
  );
}
