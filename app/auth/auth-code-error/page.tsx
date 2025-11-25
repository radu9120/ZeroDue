import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Authentication Error
        </h1>

        <p className="text-gray-600 dark:text-slate-400 mb-6">
          We couldn&apos;t verify your authentication. This could happen if:
        </p>

        <ul className="text-left text-sm text-gray-600 dark:text-slate-400 mb-6 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            The link has expired
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            The link was already used
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            There was a network issue
          </li>
        </ul>

        <div className="flex flex-col gap-3">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
          >
            Try signing in again
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
