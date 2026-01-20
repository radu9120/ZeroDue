"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Globe, Shield, Clock, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function Footer() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname && pathname.startsWith("/invoice")) {
    return null;
  }

  return (
    <footer className="relative bg-white dark:bg-slate-950 pt-24 pb-12 overflow-hidden border-t border-slate-100 dark:border-slate-800">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 bg-slate-50/50 dark:bg-slate-900/50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center h-9 w-9">
                <Image
                  src="/logo.png"
                  alt="ZeroDue"
                  width={36}
                  height={36}
                  className="transition-transform group-hover:scale-105 object-contain"
                  priority
                />
              </div>
              <span className="text-[30px] font-bold transition-colors text-slate-900 dark:text-white flex items-center h-10">
                ZeroDue
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Streamline your invoicing process with our powerful, intuitive
              platform designed for modern businesses.
            </p>
            <div className="flex gap-4">{/* Social links could go here */}</div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
              Product
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Features", href: "#features" },
                { name: "Pricing", href: "/upgrade" },
                { name: "Blog", href: "/blog" },
                { name: "Testimonials", href: "#testimonials" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600/0 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
              Industries
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Freelancers", href: "/industries/freelancers" },
                { name: "Contractors", href: "/industries/contractors" },
                { name: "Consultants", href: "/industries/consultants" },
                { name: "Cleaning Services", href: "/industries/cleaning" },
                { name: "Electricians", href: "/industries/electricians" },
                { name: "Plumbers", href: "/industries/plumbers" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600/0 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
              Resources
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Help Center", href: "/help" },
                { name: "FAQ", href: "/faq" },
                { name: "Contact Us", href: "/contact" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Refund Policy", href: "/refund-policy" },
                { name: "Cookie Policy", href: "/cookies" },
                { name: "Sitemap", href: "/site-map" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600/0 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
              Contact
            </h3>
            <div className="space-y-4">
              <a
                href="mailto:support@zerodue.co"
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Email us at
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white truncate">
                    support@zerodue.co
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-slate-200 dark:border-slate-800">
          {[
            {
              icon: Clock,
              title: "24/7 Support",
              description: "Always here to help",
            },
            {
              icon: Shield,
              title: "Secure Payments",
              description: "Bank-level security",
            },
            {
              icon: Globe,
              title: "Global Coverage",
              description: "Multi-currency support",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
            >
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400">
                <feature.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  {feature.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="py-8 text-center border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} ZeroDue. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
