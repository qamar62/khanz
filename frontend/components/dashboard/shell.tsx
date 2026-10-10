"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, Boxes, CalendarDays, ChefHat, ChevronsUpDown, ClipboardList, ExternalLink, LayoutDashboard,
  LayoutGrid, Loader2, LogOut, Menu as MenuIcon, MonitorSmartphone, Settings, Sparkles, Store, Users, X,
} from "lucide-react";
import { staffLogin } from "@/lib/staff-api";
import { cn } from "@/lib/utils";
import { useStaff } from "./staff-context";

const ADMIN_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "/admin/");

const NAV: { href: string; label: string; icon: React.ElementType; soon?: boolean }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/dashboard/menu", label: "Menu Management", icon: ChefHat },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/reports", label: "Sales Reports", icon: BarChart3 },
  { href: "/dashboard/promotions", label: "Promotions", icon: Sparkles },
  { href: "/dashboard/soon/pos", label: "Point of Sale", icon: MonitorSmartphone, soon: true },
  { href: "/dashboard/soon/floor-plan", label: "Table & Floor Plan", icon: LayoutGrid, soon: true },
  { href: "/dashboard/soon/inventory", label: "Inventory", icon: Boxes, soon: true },
  { href: "/dashboard/soon/settings", label: "Settings", icon: Settings, soon: true },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useStaff();
  const [open, setOpen] = useState(false);
  if (!ready) return <div className="flex min-h-svh items-center justify-center bg-[#f4f5f1]"><Loader2 className="h-5 w-5 animate-spin text-black/40" /></div>;
  if (!user) return <StaffLogin />;
  return (
    <div className="min-h-svh bg-[#f4f5f1] text-[#1b2112]">
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 border-r border-black/[.07] bg-white transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>
      {open ? <button aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/30 lg:hidden" /> : null}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-black/[.06] bg-[#f4f5f1]/90 px-4 backdrop-blur lg:hidden">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-black/5"><MenuIcon className="h-5 w-5" /></button>
          <span className="font-semibold">Khanz Dashboard</span>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const { user, branches, branch, setBranch, signOut } = useStaff();
  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname?.startsWith(href));
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#242b18]"><Image src="/logo.png" alt="" width={22} height={22} className="h-5 w-auto brightness-0 invert" /></span>
        <div className="leading-tight"><p className="font-semibold">Khanz</p><p className="text-xs text-black/45">Restaurant dashboard</p></div>
      </div>

      <div className="px-4">
        <label className="block rounded-xl border border-black/10 px-3 py-2.5">
          <span className="block text-[0.68rem] font-medium uppercase tracking-wide text-black/40">Current restaurant</span>
          <span className="relative mt-0.5 flex items-center">
            <Store className="mr-2 h-4 w-4 shrink-0 text-[#9a7224]" />
            <select value={branch} onChange={(event) => setBranch(event.target.value)} className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold outline-none">
              <option value="all">All restaurants</option>
              {branches.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
            <ChevronsUpDown className="pointer-events-none absolute right-0 h-4 w-4 text-black/35" />
          </span>
        </label>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV.map((item, index) => {
          const active = isActive(item.href);
          const firstSoon = item.soon && !NAV[index - 1]?.soon;
          return (
            <div key={item.href}>
              {firstSoon ? <p className="px-3 pb-1 pt-4 text-[0.68rem] font-semibold uppercase tracking-wide text-black/35">Coming soon</p> : null}
              <Link href={item.href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors", active ? "bg-[#f3efe4] font-semibold text-[#1b2112]" : "text-black/60 hover:bg-black/[.03] hover:text-black", item.soon && !active && "text-black/40")}>
                <item.icon className={cn("h-4.5 w-4.5", active ? "text-[#9a7224]" : "")} />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-black/[.06] p-4">
        <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-black/55 hover:bg-black/[.03]"><ExternalLink className="h-4 w-4" /> Django admin</a>
        <div className="flex items-center gap-3 rounded-xl bg-black/[.03] px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#242b18] text-xs font-semibold uppercase text-white">{user?.name.slice(0, 2)}</span>
          <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-sm font-medium">{user?.name}</p><p className="truncate text-xs text-black/45">{user?.is_superuser ? "Administrator" : "Staff"}</p></div>
          <button onClick={signOut} aria-label="Sign out" title="Sign out" className="rounded-lg p-1.5 text-black/45 hover:bg-white hover:text-rose-700"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

function StaffLogin() {
  const { signIn } = useStaff();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    const response = await staffLogin(username, password);
    setBusy(false);
    if (response.data) signIn(response.data.token, response.data.user);
    else setError(response.error ?? "Sign-in failed.");
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f4f5f1] px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-black/[.07] bg-white p-8 shadow-[0_20px_60px_rgba(16,24,16,.08)]">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#242b18]"><Image src="/logo.png" alt="" width={26} height={26} className="h-6 w-auto brightness-0 invert" /></span>
        <h1 className="mt-5 text-xl font-semibold text-[#1b2112]">Khanz staff sign-in</h1>
        <p className="mt-1 text-sm text-black/50">Use your Django admin username and password.</p>
        <label className="mt-6 block text-sm font-medium">Username<input autoFocus autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-black/12 px-3 outline-none focus:border-[#9a7224]" /></label>
        <label className="mt-4 block text-sm font-medium">Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-black/12 px-3 outline-none focus:border-[#9a7224]" /></label>
        {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p> : null}
        <button type="submit" disabled={busy || !username || !password} className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-[#242b18] text-sm font-semibold text-white transition-colors hover:bg-[#33401f] disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </button>
        <p className="mt-4 text-center text-xs text-black/40">Only accounts marked “staff” in Django can sign in.</p>
      </form>
    </div>
  );
}
