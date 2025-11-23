import Bounded from "@/components/ui/BoundedSection";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="min-h-screen pt-24 bg-gradient-to-br from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center py-12 px-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            Start invoicing in less than 2 minutes
          </p>
        </div>
        <SignUp
          afterSignUpUrl="/dashboard"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-2xl border-0 rounded-2xl bg-white dark:bg-slate-800",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-medium rounded-xl transition-all duration-200",
              socialButtonsBlockButtonText:
                "font-medium text-gray-700 dark:text-slate-200",
              dividerLine: "bg-gray-200 dark:bg-slate-600",
              dividerText: "text-gray-500 dark:text-slate-400 text-sm",
              formButtonPrimary:
                "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-200 normal-case",
              formFieldInput:
                "rounded-xl border-2 border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all duration-200 text-gray-900 dark:text-slate-100 dark:bg-slate-700",
              formFieldLabel:
                "text-gray-700 dark:text-slate-300 font-medium text-sm",
              footerActionLink:
                "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold",
              identityPreviewText:
                "text-gray-700 dark:text-slate-300 font-medium",
              identityPreviewEditButton:
                "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
              formHeaderTitle:
                "text-2xl font-bold text-gray-900 dark:text-slate-100",
              formHeaderSubtitle: "text-gray-600 dark:text-slate-400",
              otpCodeFieldInput:
                "border-2 border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg dark:bg-slate-700 dark:text-slate-100",
              formResendCodeLink:
                "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium",
              footer: "hidden",
            },
            layout: {
              socialButtonsPlacement: "top",
              socialButtonsVariant: "blockButton",
            },
          }}
        />
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
