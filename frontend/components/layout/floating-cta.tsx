"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
        >
          {/* WhatsApp Button */}
          <motion.a
            href="https://wa.me/64211234567?text=Hi,%20I%27d%20like%20to%20make%20a%20reservation"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Contact via WhatsApp"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </motion.a>

          {/* Reserve Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/reservation"
              className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow"
            >
              Reserve a Table
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
