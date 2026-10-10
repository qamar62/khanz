"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/contexts/theme-context";
import { CartProvider } from "@/contexts/cart-context";
import { Navbar, Footer, FloatingCTA } from "@/components/layout";
import { CartDrawer } from "@/components/order/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  // The staff dashboard has its own layout: no public navbar, footer, cart or floating buttons.
  if (pathname.startsWith("/dashboard")) {
    return <>{children}<Toaster position="bottom-right" /></>;
  }
  return (
    <ThemeProvider>
      <CartProvider>
        <Navbar />
        {children}
        <Footer />
        <FloatingCTA />
        <CartDrawer />
        <Toaster position="bottom-center" />
      </CartProvider>
    </ThemeProvider>
  );
}
