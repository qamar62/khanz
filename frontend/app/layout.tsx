import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "Khanz Restaurant | Premium Asian Cuisine & Catering",
    template: "%s | Khanz Restaurant",
  },
  description:
    "Experience the finest Asian cuisine in New Zealand. Premium dining, bespoke catering for weddings and corporate events. Book your table today.",
  keywords: [
    "Asian restaurant",
    "New Zealand",
    "catering",
    "fine dining",
    "wedding catering",
    "corporate events",
    "Asian food",
    "premium dining",
  ],
  authors: [{ name: "Khanz Restaurant" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    siteName: "Khanz Restaurant",
    title: "Khanz Restaurant | Premium Asian Cuisine & Catering",
    description:
      "Experience the finest Asian cuisine in New Zealand. Premium dining, bespoke catering for weddings and corporate events.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khanz Restaurant | Premium Asian Cuisine & Catering",
    description:
      "Experience the finest Asian cuisine in New Zealand. Premium dining, bespoke catering for weddings and corporate events.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a1c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
