"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Globe, Shield, Clock } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith("/invoice")) {
    return null;
  }

  return (
    <footer
      id="contact"
      className="relative bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-24 pb-12 overflow-hidden"
    >
      {/* Decorative blurs - improved positioninggg */}
      <div className="absolute -top-32 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-200 dark:bg-cyan-900/20 rounded-full opacity-20 blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-1 lg:col-span-1"
          >
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              >
                <Image
                  src="/logo.png"
                  alt={"logo"}
                  height={50}
                  width={50}
                ></Image>
              </motion.div>
              <span className="text-2xl font-bold text-header-text dark:text-slate-100">
                InvoiceFlow
              </span>
            </Link>
            <p className="text-secondary-text dark:text-slate-400">
              Streamline your invoicing process with our powerful, intuitive
              platform designed for modern businesses.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-header-text dark:text-slate-100 mb-5">
              Product
            </h3>
            {[
              { name: "Features", href: "#features" },
              { name: "Pricing", href: "/upgrade" },
              { name: "Blog", href: "/blog" },
              { name: "Testimonials", href: "#testimonials" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="block text-secondary-text dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors py-1"
              >
                {item.name}
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-header-text dark:text-slate-100 mb-5">
              Resources
            </h3>
            {[
              { name: "Help Center", href: "/help" },
              { name: "Contact Us", href: "/contact" },
              { name: "Privacy Policy", href: "/privacy-policy" },
              { name: "Cookie Policy", href: "/cookies" },
              { name: "Sitemap", href: "/sitemap" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="block text-secondary-text dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors py-1"
              >
                {item.name}
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-header-text dark:text-slate-100 mb-5">
              Contact
            </h3>
            <div className="space-y-5">
              <div className="flex items-start group">
                <Mail className="h-5 w-5 text-primary dark:text-blue-400 mr-3 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-header-text dark:text-slate-100">
                    Email Us
                  </p>
                  <a
                    href="mailto:privacy@invoiceflow.com"
                    className="text-secondary-text dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
                  >
                    privacy@invoiceflow.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10"
        >
          {[
            {
              icon: (
                <Clock className="h-6 w-6 text-primary dark:text-blue-400" />
              ),
              title: "24/7 Support",
              description:
                "Our team is always available to help with any questions or issues.",
            },
            {
              icon: (
                <Shield className="h-6 w-6 text-primary dark:text-blue-400" />
              ),
              title: "Secure Payments",
              description:
                "Bank-level security ensures your financial data is always protected.",
            },
            {
              icon: (
                <Globe className="h-6 w-6 text-primary dark:text-blue-400" />
              ),
              title: "Global Coverage",
              description:
                "Support for multiple currencies and international payment methods.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="flex items-start p-4 rounded-xl hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="mr-4 p-3 bg-blue-50 dark:bg-slate-800 rounded-lg">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold text-header-text dark:text-slate-100 mb-1">
                  {feature.title}
                </h4>
                <p className="text-sm text-secondary-text dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div className="py-8 flex flex-col md:flex-row justify-center items-center">
          <p className="text-secondary-text dark:text-slate-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} InvoiceFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
