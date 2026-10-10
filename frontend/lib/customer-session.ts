import type { Customer } from "@/lib/api";

const KEY = "khanz:customer";

export type CustomerSession = { token: string; customer: Customer };

export function readCustomerSession(): CustomerSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CustomerSession) : null;
  } catch {
    return null;
  }
}

export function saveCustomerSession(session: CustomerSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable: the session lasts for this page only */
  }
}

export function clearCustomerSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

const ORDER_EMAIL_KEY = "khanz:last-order";

type RememberedOrder = { reference: string; email: string; accessToken?: string };

/** Remember the last order (email + guest access token) so the return page can load and pay it. */
export function rememberOrder(reference: string, email: string, accessToken?: string) {
  try {
    localStorage.setItem(ORDER_EMAIL_KEY, JSON.stringify({ reference, email, accessToken }));
  } catch {
    /* ignore */
  }
}

function remembered(reference: string): RememberedOrder | null {
  try {
    const raw = localStorage.getItem(ORDER_EMAIL_KEY);
    const value = raw ? (JSON.parse(raw) as RememberedOrder) : null;
    return value && value.reference === reference ? value : null;
  } catch {
    return null;
  }
}

export function rememberedOrderEmail(reference: string): string | null {
  return remembered(reference)?.email || null;
}

export function rememberedOrderToken(reference: string): string | null {
  return remembered(reference)?.accessToken || null;
}
