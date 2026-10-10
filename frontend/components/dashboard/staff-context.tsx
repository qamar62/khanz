"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BranchOption, STAFF_SIGNED_OUT, StaffUser, clearStaffSession, readStaffSession, saveStaffSession, staffFetch } from "@/lib/staff-api";

type StaffContextValue = {
  user: StaffUser | null;
  ready: boolean;
  branches: BranchOption[];
  branch: string;
  setBranch: (slug: string) => void;
  signIn: (token: string, user: StaffUser) => void;
  signOut: () => void;
};

const StaffContext = createContext<StaffContextValue | null>(null);
const BRANCH_KEY = "khanz:staff-branch";

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [ready, setReady] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branch, setBranchState] = useState("all");

  const loadMe = useCallback(async () => {
    const response = await staffFetch<{ user: StaffUser; branches: BranchOption[] }>("/staff/me/");
    if (response.data) { setUser(response.data.user); setBranches(response.data.branches); }
    else setUser(null);
    setReady(true);
  }, []);

  useEffect(() => {
    try { setBranchState(localStorage.getItem(BRANCH_KEY) || "all"); } catch { /* ignore */ }
    if (readStaffSession()) loadMe(); else setReady(true);
    const onSignedOut = () => setUser(null);
    window.addEventListener(STAFF_SIGNED_OUT, onSignedOut);
    return () => window.removeEventListener(STAFF_SIGNED_OUT, onSignedOut);
  }, [loadMe]);

  const value: StaffContextValue = {
    user, ready, branches, branch,
    setBranch: (slug) => { setBranchState(slug); try { localStorage.setItem(BRANCH_KEY, slug); } catch { /* ignore */ } },
    signIn: (token, nextUser) => { saveStaffSession({ token, user: nextUser }); setUser(nextUser); loadMe(); },
    signOut: () => { clearStaffSession(); setUser(null); },
  };
  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) throw new Error("useStaff must be used inside StaffProvider");
  return context;
}

/** Fetch staff data and refresh it on an interval (and when the restaurant changes). */
export function useStaffData<T>(path: string | null, refreshMs = 0) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let active = true;
    setLoading(true);
    staffFetch<T>(path).then((response) => {
      if (!active) return;
      setLoading(false);
      if (response.data !== undefined) { setData(response.data); setError(""); } else setError(response.error ?? "Something went wrong.");
    });
    return () => { active = false; };
  }, [path, tick]);

  useEffect(() => {
    if (!refreshMs) return;
    const timer = setInterval(() => { if (document.visibilityState === "visible") setTick((t) => t + 1); }, refreshMs);
    return () => clearInterval(timer);
  }, [refreshMs]);

  return { data, error, loading, reload: () => setTick((t) => t + 1), setData };
}
