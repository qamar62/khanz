"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartButton } from "@/components/order/cart-drawer";
import { cn } from "@/lib/utils";
import { contactInfo } from "@/lib/data";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu & Order" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 lg:px-8"
      >
        <nav className={cn(
          "container mx-auto transition-all duration-500",
          isScrolled
            ? "bg-background/95 dark:bg-background/80 backdrop-blur-xl border border-border rounded-full py-3 px-6 mt-4 max-w-7xl shadow-lg"
            : "bg-transparent py-5 lg:glass lg:rounded-full lg:px-6 lg:mt-4 lg:max-w-7xl"
        )}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="relative z-10">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3"
              >
                <Image
                  src="/logo.png"
                  alt="Khanz Restaurant"
                  width={120}
                  height={40}
                  className={cn(
                    "h-8 w-auto transition duration-500 lg:h-10",
                    isScrolled ? "brightness-0 dark:invert" : "brightness-0 invert"
                  )}
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative group text-sm font-medium tracking-wide uppercase transition-colors duration-300",
                    pathname === link.href
                      ? "text-primary"
                      : isScrolled
                        ? "text-foreground/80 hover:text-primary"
                        : "text-white/80 hover:text-[#d8ad52]"
                  )}
                >
                  {link.label}
                  {pathname === link.href ? (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-primary"
                    />
                  ) : (
                    <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 rounded-full bg-primary/60 transition-all duration-300 group-hover:w-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                className={cn(
                  "hidden items-center gap-2 text-sm transition-colors xl:flex",
                  isScrolled ? "text-foreground/80 hover:text-primary" : "text-white/75 hover:text-[#d8ad52]"
                )}
              >
                <Phone className="h-4 w-4 text-primary" />
                <span>{contactInfo.phone}</span>
              </Link>
              <span className="hidden h-5 w-px bg-border xl:block" />
              <ThemeToggle />
              <CartButton className={isScrolled ? "text-foreground" : "text-white"} />
              <Button
                asChild
                className="whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Link href="/reservation">Book a Table</Link>
              </Button>
            </div>

            {/* Mobile Menu Button & Theme Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle />
              <CartButton className={isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"} />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative z-10 p-2"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <motion.div
                  animate={isMobileMenuOpen ? "open" : "closed"}
                  className="w-6 h-6 flex items-center justify-center"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-foreground" />
                  ) : (
                    <Menu className="h-6 w-6 text-foreground" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-background/98 backdrop-blur-xl" />
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="relative h-full flex flex-col items-center justify-center gap-8 px-8"
            >
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "text-2xl font-serif tracking-wide transition-colors",
                      pathname === link.href
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-col items-center gap-5"
              >
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-border" />
                  <span className="w-1.5 h-1.5 rotate-45 bg-primary" />
                  <span className="h-px w-10 bg-border" />
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 shadow-lg shadow-primary/25"
                >
                  <Link href="/reservation">Book a Table</Link>
                </Button>
                <Link
                  href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  {contactInfo.phone}
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
