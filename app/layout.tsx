import type React from "react";
import { Suspense } from "react";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
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
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvoiceFlow - Modern Invoicing Solution",
  description:
    "Streamline your invoicing process with our powerful, intuitive platform.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.invcyflow.com",
    title: "InvoiceFlow • Modern Invoicing Solution",
    description:
      "InvoiceFlow automates invoices, tracks payments, and gives you the insights to stay cash-flow positive.",
    siteName: "InvoiceFlow",
    images: [
      {
        url: "https://www.invcyflow.com/og-cover.png",
        width: 1200,
        height: 630,
        alt: "InvoiceFlow dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@invoiceflow",
    creator: "@invoiceflow",
    title: "InvoiceFlow • Modern Invoicing Solution",
    description:
      "Send professional invoices, automate follow-up, and monitor cash flow in one place.",
    images: ["https://www.invcyflow.com/og-cover.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#111827",
          colorTextOnPrimaryBackground: "#ffffff",
          colorTextSecondary: "#6b7280",
          fontFamily: "Inter, sans-serif",
          borderRadius: "0.75rem",
        },
        elements: {
          userButtonPopoverCard: "shadow-2xl border-0 rounded-xl",
          userButtonPopoverActionButton:
            "hover:bg-blue-50 text-gray-700 rounded-lg",
          userButtonPopoverActionButtonIcon: "text-gray-600",
          userButtonPopoverActionButtonText: "text-gray-700 font-medium",
          userButtonPopoverFooter: "hidden",
          userPreviewMainIdentifier: "text-gray-900 font-semibold",
          userPreviewSecondaryIdentifier: "text-gray-600 text-sm",
          badge: "bg-blue-100 text-blue-700 font-medium",
          avatarBox: "w-10 h-10 rounded-full border-2 border-blue-200",
          userButtonAvatarBox:
            "w-10 h-10 rounded-full border-2 border-blue-200",
          card: "shadow-2xl border-0 rounded-2xl",
          formButtonPrimary:
            "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 normal-case font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className} bg-white dark:bg-slate-900 transition-colors`}
        >
          <ThemeProvider defaultTheme="system" storageKey="invoiceflow-theme">
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
              <HideOnRoutes routes={["/invoice", "/dashboard"]}>
                <Navbar />
              </HideOnRoutes>
            </Suspense>
            <Suspense fallback={null}>
              <div id="root">{children}</div>
            </Suspense>
            <div id="modal-root"></div>
            <Toaster richColors position="top-right" />
            <HideOnRoutes routes={["/invoice", "/dashboard"]}>
              <Footer />
            </HideOnRoutes>
            <CookieBanner />
            <SpeedInsights />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
