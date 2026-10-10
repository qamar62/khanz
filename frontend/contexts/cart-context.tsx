"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MenuCategory, MenuItem, OrderLineInput, menuAPI } from "@/lib/api";

export type CartOption = { id: number; name: string; price: number };
export type CartLine = {
  key: string;
  menuItemId: number;
  code: string;
  name: string;
  basePrice: number;
  options: CartOption[];
  quantity: number;
  notes: string;
};

export const lineUnitPrice = (line: Pick<CartLine, "basePrice" | "options">) =>
  line.basePrice + line.options.reduce((sum, option) => sum + option.price, 0);

/** Build a line from a menu item + chosen options. Identical choices merge into one line. */
export function buildLine(item: MenuItem, optionIds: number[] = [], quantity = 1, notes = ""): CartLine {
  const options = item.options
    .filter((option) => optionIds.includes(option.id))
    .map((option) => ({ id: option.id, name: option.name, price: Number(option.additional_price) || 0 }));
  const ids = options.map((option) => option.id).sort((a, b) => a - b).join(",");
  return {
    key: `${item.id}|${ids}|${notes.trim().toLowerCase()}`,
    menuItemId: item.id,
    code: item.code,
    name: item.name,
    basePrice: Number(item.price) || 0,
    options,
    quantity,
    notes: notes.trim(),
  };
}

export function mergeLine(lines: CartLine[], line: CartLine): CartLine[] {
  const existing = lines.find((current) => current.key === line.key);
  if (!existing) return [...lines, line];
  return lines.map((current) => (current.key === line.key ? { ...current, quantity: Math.min(current.quantity + line.quantity, 50) } : current));
}

export const toOrderInput = (lines: CartLine[]): OrderLineInput[] =>
  lines.map((line) => ({ menu_item_id: line.menuItemId, quantity: line.quantity, option_ids: line.options.map((option) => option.id), notes: line.notes }));

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (item: MenuItem, optionIds?: number[], quantity?: number, notes?: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  menu: MenuCategory[] | null;
  loadMenu: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "khanz:cart:v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuCategory[] | null>(null);
  const menuRequested = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* start with an empty cart */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines, ready]);

  const loadMenu = useCallback(() => {
    if (menuRequested.current) return;
    menuRequested.current = true;
    menuAPI.list().then((response) => {
      if (response.data) setMenu(response.data);
      else menuRequested.current = false;
    });
  }, []);

  const add = useCallback((item: MenuItem, optionIds: number[] = [], quantity = 1, notes = "") => {
    setLines((current) => mergeLine(current, buildLine(item, optionIds, quantity, notes)));
  }, []);
  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) => (quantity <= 0 ? current.filter((line) => line.key !== key) : current.map((line) => (line.key === key ? { ...line, quantity: Math.min(quantity, 50) } : line))));
  }, []);
  const remove = useCallback((key: string) => setLines((current) => current.filter((line) => line.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: Math.round(lines.reduce((sum, line) => sum + lineUnitPrice(line) * line.quantity, 0) * 100) / 100,
    ready, add, setQuantity, remove, clear, isOpen, setOpen, menu, loadMenu,
  }), [lines, ready, add, setQuantity, remove, clear, isOpen, menu, loadMenu]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
