"use client";

import { ThemeProvider } from "@/contexts/theme-context";
import { Navbar, Footer, FloatingCTA } from "@/components/layout";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Navbar />
      {children}
      <Footer />
      <FloatingCTA />
    </ThemeProvider>
  );
}
