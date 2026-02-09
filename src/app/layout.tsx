import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";


export const metadata: Metadata = {
  title: {
    default: 'RuleKit — Turn human judgment into rules that run themselves',
    template: '%s | RuleKit',
  },
  description: "Write rules in plain English. Run them on any input. Get instant, explainable decisions — without hardcoding business logic.",
  openGraph: {
    type: 'website',
    siteName: 'RuleKit',
    title: 'RuleKit — Turn human judgment into rules that run themselves',
    description: 'Write rules in plain English. Run them on any input. Get instant, explainable decisions — without hardcoding business logic.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RuleKit — Turn human judgment into rules that run themselves',
    description: 'Write rules in plain English. Run them on any input. Get instant, explainable decisions.',
  },
  icons: {
    icon: [
      // Put .ico first (best fallback) and add cache-busting
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png?v=1", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=1", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png?v=1",
  },
  manifest: "/site.webmanifest?v=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-right" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
