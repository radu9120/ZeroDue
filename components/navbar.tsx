"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MenuIcon, XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@/components/auth/UserButton";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const businessId = searchParams?.get("business_id");
  const [storedBusinessId, setStoredBusinessId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") {
      return;
    }

    if (businessId) {
      try {
        window.localStorage.setItem("activeBusinessId", businessId);
        setStoredBusinessId(businessId);
        return;
      } catch (_) {
        // Ignore storage write issues
      }
    }

    try {
      const stored = window.localStorage.getItem("activeBusinessId");
      setStoredBusinessId(stored);
    } catch (_) {
      setStoredBusinessId(null);
    }
  }, [businessId, pathname]);

  const resolvedBusinessId = businessId ?? storedBusinessId ?? undefined;

  if (pathname && pathname.startsWith("/invoice")) {
    return null;
  }

  const closeMenu = () => setIsMenuOpen(false);

  // Handle scroll effect for background change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50 shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="ZeroDue logo"
                  height={20}
                  width={20}
                  className="object-contain invert brightness-0"
                />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                ZeroDue
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex items-center space-x-8"
          >
            {/* Show different links based on authentication status */}
            {mounted && (
              <>
                <SignedOut>
                  <Link
                    href="#features"
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    Features
                  </Link>
                  <Link
                    href="/upgrade"
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="#testimonials"
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    Testimonials
                  </Link>
                  <Link
                    href="/contact"
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    Contact
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <>
                    <Link
                      href={
                        resolvedBusinessId
                          ? `/dashboard/clients?business_id=${resolvedBusinessId}`
                          : "/dashboard"
                      }
                      className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    >
                      Clients
                    </Link>
                    <Link
                      href={
                        resolvedBusinessId
                          ? `/dashboard/invoices?business_id=${resolvedBusinessId}`
                          : "/dashboard"
                      }
                      className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    >
                      Invoices
                    </Link>
                  </>
                </SignedIn>
              </>
            )}
          </motion.div>

          {/* Desktop Auth & Mobile Menu Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center space-x-3"
          >
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Desktop Authentication */}
            <div className="hidden md:flex items-center space-x-3">
              {mounted && (
                <>
                  <SignedOut>
                    <SignInButton>
                      <Button
                        variant="ghost"
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Log in
                      </Button>
                    </SignInButton>
                    <SignUpButton>
                      <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 shadow-lg shadow-blue-500/20">
                        Sign up
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </>
              )}
            </div>

            {/* Mobile User Button (when signed in) */}
            <div className="md:hidden">
              {mounted && (
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden p-2 hover:bg-blue-50 dark:hover:bg-slate-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {isMenuOpen ? (
                  <XIcon className="h-5 w-5" />
                ) : (
                  <MenuIcon className="h-5 w-5" />
                )}
              </motion.div>
            </Button>
          </motion.div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xl"
            >
              <div className="p-4 space-y-4">
                <div className="flex flex-col space-y-2">
                  {/* Mobile Navigation Links - Different for auth states */}
                  <SignedOut>
                    {["Features", "Pricing", "Testimonials", "Contact"].map(
                      (item) => (
                        <Link
                          key={item}
                          href={
                            item === "Pricing"
                              ? "/upgrade"
                              : item === "Contact"
                                ? "/contact"
                                : `#${item.toLowerCase()}`
                          }
                          className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 font-medium flex items-center justify-between group"
                          onClick={closeMenu}
                        >
                          {item}
                          <span className="text-slate-400 group-hover:text-blue-500 transition-colors">
                            →
                          </span>
                        </Link>
                      )
                    )}
                  </SignedOut>

                  <SignedIn>
                    {[
                      { label: "Dashboard", href: "/dashboard" },
                      {
                        label: "Clients",
                        href: resolvedBusinessId
                          ? `/dashboard/clients?business_id=${resolvedBusinessId}`
                          : "/dashboard",
                      },
                      {
                        label: "Invoices",
                        href: resolvedBusinessId
                          ? `/dashboard/invoices?business_id=${resolvedBusinessId}`
                          : "/dashboard",
                      },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 font-medium flex items-center justify-between group"
                        onClick={closeMenu}
                      >
                        {item.label}
                        <span className="text-slate-400 group-hover:text-blue-500 transition-colors">
                          →
                        </span>
                      </Link>
                    ))}
                  </SignedIn>

                  {/* Mobile Authentication */}
                  <SignedOut>
                    <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                      <SignInButton>
                        <Button
                          variant="neutralOutline"
                          className="w-full h-12 text-base font-medium border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                          onClick={closeMenu}
                        >
                          Log in
                        </Button>
                      </SignInButton>
                      <SignUpButton>
                        <Button
                          className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20"
                          onClick={closeMenu}
                        >
                          Sign up
                        </Button>
                      </SignUpButton>
                    </div>
                  </SignedOut>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Overlay - only show when menu is open */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[-1] md:hidden"
              onClick={closeMenu}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
