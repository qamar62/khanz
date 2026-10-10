"use client";

import type { Order } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const KEY = "khanz:staff";
export const STAFF_SIGNED_OUT = "khanz:staff-signed-out";

export type StaffUser = { username: string; name: string; email: string; is_superuser: boolean };
export type StaffSession = { token: string; user: StaffUser };

export function readStaffSession(): StaffSession | null {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function saveStaffSession(session: StaffSession) {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* session lasts for this tab */ }
}
export function clearStaffSession() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

function readable(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.map(readable).join(" ");
  if (typeof raw === "object") return Object.values(raw as Record<string, unknown>).map(readable).join(" ");
  return String(raw);
}

/** Authenticated request to the staff API. A 401 signs the user out everywhere. */
export async function staffFetch<T>(path: string, init: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  const session = readStaffSession();
  try {
    const { headers, ...rest } = init;
    const response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: { "Content-Type": "application/json", ...(session ? { Authorization: `Staff ${session.token}` } : {}), ...headers },
    });
    if (response.status === 401) {
      clearStaffSession();
      window.dispatchEvent(new Event(STAFF_SIGNED_OUT));
      return { error: "Your session has expired. Please sign in again." };
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { error: readable(body.detail ?? body) || `Request failed (${response.status})` };
    return { data: body as T };
  } catch {
    return { error: "Can't reach the server. Check your connection." };
  }
}

export async function staffLogin(username: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/staff/login/`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { error: readable(body.detail ?? body) || "Sign-in failed." };
    return { data: body as StaffSession };
  } catch {
    return { error: "Can't reach the server. Check your connection." };
  }
}

export type BranchOption = { slug: string; name: string };

export type Overview = {
  date: string;
  stats: { revenue_today: string; orders_today: number; active_orders: number; bookings_today: number; guests_today: number; revenue_7d: string; pending_bookings: number };
  queue: Order[];
  upcoming_bookings: BookingRow[];
};

export type BookingRow = { id: number; reference: string; name: string; phone: string; date: string; time: string; guests: number; status: string; branch: string };

export type StaffReservation = {
  id: number; reference: string; name: string; email: string; phone: string; date: string; time: string;
  adult_guests: number; child_guests: number; guests: number; occasion: string; special_requests: string; status: string;
  payment_status: string; branch: string; branch_details?: { name: string; slug: string };
  preorder?: { reference: string; total: string; payment_status: string; currency: string } | null;
};

export type StaffMenuCategory = {
  id: number; name: string; slug: string; is_active: boolean;
  items: { id: number; code: string; name: string; description: string; price: string; is_active: boolean; is_popular: boolean; is_chef_special: boolean; spice_level: number; dietary_labels: string[]; options: { id: number; name: string; additional_price: string }[] }[];
};

export type CustomerRow = { name: string; email: string; phone: string; orders: number; spend: string; bookings: number; last_seen: string | null };

export type Sales = {
  days: number;
  series: { date: string; revenue: string; orders: number }[];
  totals: { revenue: string; orders: number; discount: string; fees: string; food: string };
  average_order: string;
  top_items: { name: string; quantity: number; revenue: string }[];
  by_kind: { kind: string; revenue: string; orders: number }[];
};

export type PromotionRow = { id: number; title: string; badge: string; state: "live" | "scheduled" | "paused" | "expired"; applies_to: string; starts_at: string; ends_at: string; min_subtotal: string; paid_orders: number; discount_given: string };

export const branchParam = (branch: string) => (branch && branch !== "all" ? `branch=${encodeURIComponent(branch)}` : "");
