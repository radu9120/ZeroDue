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
            <Analytics />
            <Suspense fallback={null}>
              <HideOnRoutes routes={["/invoice"]}>
                <Navbar />
              </HideOnRoutes>
            </Suspense>
            <Suspense fallback={null}>
              <div id="root">{children}</div>
            </Suspense>
            <div id="modal-root"></div>
            <Toaster richColors position="top-right" />
            <HideOnRoutes routes={["/invoice"]}>
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
