import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found - 404",
  description:
    "The page you're looking for doesn't exist. Find what you need on ZeroDue - free invoice generator for freelancers and small businesses.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 px-4">
      <div className="text-center max-w-xl">
        <div className="mb-8">
          <span className="text-8xl font-bold text-blue-600 dark:text-blue-500">
            404
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Contact Support
          </Link>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Popular Pages
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/pricing"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Pricing
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              href="/blog"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Blog
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              href="/faq"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              FAQ
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              href="/help"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Help Center
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              href="/sign-up"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
