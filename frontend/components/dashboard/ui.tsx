"use client";

import { Construction, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const money = (value: string | number, currency = "NZD") =>
  new Intl.NumberFormat("en-NZ", { style: "currency", currency }).format(Number(value) || 0);

export const timeLabel = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", timeZone: "Pacific/Auckland" }) : "—";

export const dateLabel = (iso: string | null, withTime = false) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleString("en-NZ", {
    weekday: "short", day: "numeric", month: "short", timeZone: "Pacific/Auckland",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }) : "—";

export const time24to12 = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
};

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border border-black/[.07] bg-white shadow-[0_1px_2px_rgba(16,24,16,.04)]", className)}>{children}</section>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-black/[.06] px-5 py-4">
      <div><h2 className="text-base font-semibold text-[#1b2112]">{title}</h2>{subtitle ? <p className="mt-0.5 text-xs text-black/45">{subtitle}</p> : null}</div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-semibold tracking-tight text-[#1b2112]">{title}</h1>{subtitle ? <p className="mt-1 text-sm text-black/50">{subtitle}</p> : null}</div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  // orders
  awaiting_payment: "bg-zinc-100 text-zinc-600",
  confirmed: "bg-sky-50 text-sky-700",
  preparing: "bg-amber-50 text-amber-700",
  ready: "bg-emerald-50 text-emerald-700",
  collected: "bg-zinc-100 text-zinc-600",
  cancelled: "bg-rose-50 text-rose-700",
  // reservations
  pending: "bg-amber-50 text-amber-700",
  payment_pending: "bg-orange-50 text-orange-700",
  waiting: "bg-violet-50 text-violet-700",
  table_ready: "bg-teal-50 text-teal-700",
  seated: "bg-sky-50 text-sky-700",
  completed: "bg-zinc-100 text-zinc-600",
  no_show: "bg-rose-50 text-rose-700",
  // promotions
  live: "bg-emerald-50 text-emerald-700",
  scheduled: "bg-sky-50 text-sky-700",
  paused: "bg-zinc-100 text-zinc-600",
  expired: "bg-rose-50 text-rose-600",
  paid: "bg-emerald-50 text-emerald-700",
  unpaid: "bg-zinc-100 text-zinc-600",
};

const STATUS_LABELS: Record<string, string> = {
  awaiting_payment: "Awaiting payment", confirmed: "New", preparing: "On cooking", ready: "Ready to collect",
  collected: "Collected", cancelled: "Cancelled", pending: "Pending", payment_pending: "Awaiting payment",
  waiting: "Waiting", table_ready: "Table ready", seated: "Seated", completed: "Completed", no_show: "No-show",
  live: "Live", scheduled: "Scheduled", paused: "Paused", expired: "Expired", paid: "Paid", unpaid: "Unpaid",
};

const BOOKING_LABELS: Record<string, string> = { confirmed: "Confirmed", pending: "Needs confirming" };

export function StatusBadge({ status, className, booking = false }: { status: string; className?: string; booking?: boolean }) {
  const label = (booking ? BOOKING_LABELS[status] : undefined) ?? STATUS_LABELS[status] ?? status.replace(/_/g, " ");
  const style = booking && status === "confirmed" ? "bg-emerald-50 text-emerald-700" : STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-600";
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[0.7rem] font-semibold", style, className)}>{label}</span>;
}

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint?: string; icon: React.ElementType }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between"><span className="text-sm text-black/55">{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3efe4] text-[#9a7224]"><Icon className="h-4.5 w-4.5" /></span></div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-[#1b2112]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-black/45">{hint}</p> : null}
    </Card>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <div className="flex items-center justify-center gap-2 py-16 text-sm text-black/45"><Loader2 className="h-4 w-4 animate-spin" />{label}</div>;
}

export function Empty({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efe4] text-[#9a7224]"><Icon className="h-5 w-5" /></span>
      <p className="mt-3 font-medium text-[#1b2112]">{title}</p>
      {text ? <p className="mt-1 max-w-sm text-sm text-black/45">{text}</p> : null}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{message}</div>;
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string; count?: number }[]; onChange: (value: T) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-black/[.04] p-1">
      {options.map((option) => (
        <button key={option.value} type="button" onClick={() => onChange(option.value)} className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", value === option.value ? "bg-white text-[#1b2112] shadow-sm" : "text-black/55 hover:text-black")}>
          {option.label}{option.count !== undefined ? <span className="ml-1.5 text-xs text-black/40">{option.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-black/10 bg-white px-3.5 text-sm outline-none placeholder:text-black/35 focus:border-[#9a7224] sm:w-64" />;
}

export function Button({ variant = "primary", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "danger" }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[#242b18] text-white hover:bg-[#33401f]",
        variant === "outline" && "border border-black/12 bg-white text-[#1b2112] hover:bg-black/[.03]",
        variant === "ghost" && "text-black/60 hover:bg-black/[.04] hover:text-black",
        variant === "danger" && "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
        className,
      )}
    />
  );
}

export function ComingSoon({ title, text, points }: { title: string; text: string; points: string[] }) {
  return (
    <Card className="mx-auto max-w-2xl p-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3efe4] text-[#9a7224]"><Construction className="h-6 w-6" /></span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7224]">Coming soon</p>
      <h1 className="mt-2 text-2xl font-semibold text-[#1b2112]">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-black/55">{text}</p>
      <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm text-black/65">
        {points.map((point) => <li key={point} className="flex gap-2 rounded-xl bg-black/[.03] px-4 py-2.5"><span className="text-[#9a7224]">•</span>{point}</li>)}
      </ul>
    </Card>
  );
}
