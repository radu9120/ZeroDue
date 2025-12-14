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
import {
  OrganizationSchema,
  SoftwareApplicationSchema,
  WebsiteSchema,
} from "@/components/seo/StructuredData";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zerodue.co"),
  title: {
    default:
      "ZeroDue - Free Invoice Generator & Professional Invoicing Software",
    template: "%s | ZeroDue",
  },
  description:
    "Create professional invoices for free with ZeroDue. Send invoices, automate payment reminders, track payments, and get paid faster. Perfect for freelancers and small businesses.",
  keywords: [
    "invoice generator",
    "free invoicing software",
    "invoice template",
    "online invoicing",
    "freelancer invoices",
    "small business invoicing",
    "payment tracking",
    "invoice automation",
    "professional invoices",
    "billing software",
  ],
  authors: [{ name: "ZeroDue" }],
  creator: "ZeroDue",
  publisher: "ZeroDue",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.zerodue.co",
    title: "ZeroDue - Free Invoice Generator & Professional Invoicing",
    description:
      "Create and send professional invoices for free. Automate payment reminders, track payments, and manage cash flow with ZeroDue.",
    siteName: "ZeroDue",
    images: [
      {
        url: "https://www.zerodue.co/og-cover.png",
        width: 1200,
        height: 630,
        alt: "ZeroDue - Professional Invoice Generator Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@zerodueco",
    creator: "@zerodueco",
    title: "ZeroDue - Free Invoice Generator",
    description:
      "Create professional invoices for free. Automate follow-ups and get paid faster.",
    images: ["https://www.zerodue.co/og-cover.png"],
  },
  alternates: {
    canonical: "https://www.zerodue.co",
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
<<<<<<< Updated upstream
        <OrganizationSchema />
        <SoftwareApplicationSchema />
        <WebsiteSchema />
=======
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TGMZ7GXK');`}
        </Script>
>>>>>>> Stashed changes
      </head>
      <body
        className={`${inter.className} bg-white dark:bg-slate-900 transition-colors`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TGMZ7GXK"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
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
