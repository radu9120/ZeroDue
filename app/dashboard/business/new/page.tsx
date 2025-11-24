"use client";

import ProfileSetupFlow from "@/components/Business/ProfileSetupFlow";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewBusinessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <ProfileSetupFlow
          variant="standalone"
          onCompleted={() => {
            router.push("/dashboard");
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
