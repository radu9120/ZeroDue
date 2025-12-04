import type React from "react";
import { Suspense } from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CookieBanner from "@/components/cookie-banner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import HideOnRoutes from "@/components/layout/HideOnRoutes";
import ChatBot from "@/components/ChatBot/ChatBot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZeroDue - Zero Hassle Invoicing",
  description:
    "Send professional invoices, automate follow-up, and get paid faster with ZeroDue.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://zerodue.co",
    title: "ZeroDue • Zero Hassle Invoicing",
    description:
      "ZeroDue automates invoices, tracks payments, and gives you the insights to stay cash-flow positive.",
    siteName: "ZeroDue",
    images: [
      {
        url: "https://zerodue.co/og-cover.png",
        width: 1200,
        height: 630,
        alt: "ZeroDue dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@zerodueco",
    creator: "@zerodueco",
    title: "ZeroDue • Zero Hassle Invoicing",
    description:
      "Send professional invoices, automate follow-up, and monitor cash flow in one place.",
    images: ["https://zerodue.co/og-cover.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white dark:bg-slate-900 transition-colors`}
      >
        <ThemeProvider defaultTheme="system" storageKey="zerodue-theme">
          {/* Google tag (gtag.js) */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-89218JDW2M"
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-89218JDW2M');
            `}
          </Script>
          <Analytics />
          <Suspense fallback={null}>
            <HideOnRoutes routes={["/invoice", "/dashboard", "/upgrade"]}>
              <Navbar />
            </HideOnRoutes>
          </Suspense>
          <Suspense fallback={null}>
            <div id="root">{children}</div>
          </Suspense>
          <div id="modal-root"></div>
          <Toaster richColors position="top-right" />
          <HideOnRoutes routes={["/invoice", "/dashboard", "/upgrade"]}>
            <Footer />
          </HideOnRoutes>
          <Suspense fallback={null}>
            <HideOnRoutes routes={["/dashboard"]}>
              <ChatBot />
            </HideOnRoutes>
          </Suspense>
          <CookieBanner />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
