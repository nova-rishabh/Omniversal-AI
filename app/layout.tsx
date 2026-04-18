import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

/* ─── Fonts ──────────────────────────────────────────────────────────────────
   DESIGN.md §3: Inter exclusively — "neutral, neo-grotesque efficiency."
   Geist Mono kept for code/technical readouts only.
   Geist Sans and Crimson Text removed — they conflict with the scientific
   editorial aesthetic.
   ─────────────────────────────────────────────────────────────────────────── */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  /* Load the full weight range for Big/Small editorial contrast:
     400 (body), 600 (labels), 700 (display, buttons) */
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ─── Metadata ───────────────────────────────────────────────────────────────*/
export const metadata: Metadata = {
  title: {
    default: "Omniversal — Neural Workflow Platform",
    template: "%s · Omniversal",
  },
  description:
    "Enterprise-grade neural processing at the edge. Advanced reasoning, sub-millisecond latency, SOC 2 compliant.",
  /* Prevent search engine indexing for internal tools — typical for enterprise */
  robots: { index: false, follow: false },
};

/* ─── Viewport / theme-color ─────────────────────────────────────────────────
   Match the void: #0e0e0e so the browser chrome blends in on mobile.
   ─────────────────────────────────────────────────────────────────────────── */
export const viewport: Viewport = {
  themeColor: "#0e0e0e",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      /* dark class pre-applied — this is a dark-only design system */
      className={`dark h-full ${inter.variable} ${geistMono.variable}`}
      /* Suppress hydration mismatch from theme detection scripts */
      suppressHydrationWarning
    >
      <body
        /* 
          - antialiased: matches globals.css -webkit-font-smoothing
          - min-h-full flex flex-col: allows footer to be pushed to bottom
          - selection classes are handled in globals.css (primary teal)
        */
        className="min-h-full flex flex-col antialiased"
      >
        {children}
      </body>
    </html>
  );
}
