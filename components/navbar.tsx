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
} from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const businessId = searchParams?.get("business_id");
  const [storedBusinessId, setStoredBusinessId] = useState<string | null>(null);

  useEffect(() => {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 shadow-md"
          : "bg-transparent"
      } border-b border-gray-200/50 dark:border-slate-700/50`}
    >
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <SignedOut>
              <Link href="/" className="flex items-center space-x-2">
                <motion.div
                  initial={{ rotate: -10, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src="/logo.png"
                    alt="InvoiceFlow logo"
                    height={24}
                    width={24}
                    className="object-contain"
                  />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xl font-bold text-header-text dark:text-slate-100"
                >
                  InvoiceFlow
                </motion.span>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="flex items-center space-x-2">
                <motion.div
                  initial={{ rotate: -10, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src="/logo.png"
                    alt="InvoiceFlow logo"
                    height={24}
                    width={24}
                    className="object-contain"
                  />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xl font-bold text-header-text dark:text-slate-100"
                >
                  InvoiceFlow
                </motion.span>
              </Link>
            </SignedIn>
          </div>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex items-center space-x-8"
          >
            {/* Show different links based on authentication status */}
            <SignedOut>
              <Link
                href="#features"
                className="text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                href="/upgrade"
                className="text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors font-medium"
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors font-medium"
              >
                Testimonials
              </Link>
              <Link
                href="/contact"
                className="text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors font-medium"
              >
                Contact
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors font-medium"
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
                  className="text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Clients
                </Link>
                <Link
                  href={
                    resolvedBusinessId
                      ? `/dashboard/invoices?business_id=${resolvedBusinessId}`
                      : "/dashboard"
                  }
                  className="text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Invoices
                </Link>
              </>
            </SignedIn>
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
              <SignedOut>
                <SignInButton>
                  <Button
                    variant="ghost"
                    className="text-primary-text hover:text-primary hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Log in
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-cyan-500 text-white rounded-xl px-6">
                    Sign up
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>

            {/* Mobile User Button (when signed in) */}
            <div className="md:hidden">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
                height: { duration: 0.25 },
                opacity: { duration: 0.2 },
              }}
              className="md:hidden overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-b-lg border-t border-blue-100 dark:border-slate-700"
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="py-4 px-2"
              >
                <div className="flex flex-col space-y-1">
                  {/* Mobile Navigation Links - Different for auth states */}
                  <SignedOut>
                    <Link
                      href="#features"
                      className="px-4 py-3 text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium"
                      onClick={closeMenu}
                    >
                      Features
                    </Link>
                    <Link
                      href="/upgrade"
                      className="px-4 py-3 text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium"
                      onClick={closeMenu}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="#testimonials"
                      className="px-4 py-3 text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium"
                      onClick={closeMenu}
                    >
                      Testimonials
                    </Link>
                    <Link
                      href="/contact"
                      className="px-4 py-3 text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium"
                      onClick={closeMenu}
                    >
                      Contact
                    </Link>
                  </SignedOut>

                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="px-4 py-3 text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium"
                      onClick={closeMenu}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={
                        resolvedBusinessId
                          ? `/dashboard/clients?business_id=${resolvedBusinessId}`
                          : "/dashboard"
                      }
                      className="px-4 py-3 text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium"
                      onClick={closeMenu}
                    >
                      Clients
                    </Link>
                    <Link
                      href={
                        resolvedBusinessId
                          ? `/dashboard/invoices?business_id=${resolvedBusinessId}`
                          : "/dashboard"
                      }
                      className="px-4 py-3 text-primary-text dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium"
                      onClick={closeMenu}
                    >
                      Invoices
                    </Link>
                  </SignedIn>

                  {/* Mobile Authentication */}
                  <SignedOut>
                    <div className="pt-3 mt-3 border-t border-blue-100 dark:border-slate-700 space-y-2">
                      <SignInButton>
                        <Button
                          variant="secondary"
                          className="w-full py-3 text-base font-medium border-blue-200 dark:border-slate-700 text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all duration-200"
                          onClick={closeMenu}
                        >
                          Sign In
                        </Button>
                      </SignInButton>
                      <SignUpButton>
                        <Button
                          className="w-full py-3 text-base font-medium bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-cyan-500 text-white rounded-xl transition-all duration-200"
                          onClick={closeMenu}
                        >
                          Get Started Free
                        </Button>
                      </SignUpButton>
                    </div>
                  </SignedOut>
                </div>
              </motion.div>
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
