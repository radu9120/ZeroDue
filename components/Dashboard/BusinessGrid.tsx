"use client";
import { DashboardBusinessStats } from "@/types";
import {
  Building,
  ArrowRight,
  Sparkles,
  User,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import BusinessCard from "./BusinessCard";
import { CreateBusiness } from "../Business/Forms/CreateBusiness";

export default function BusinessGrid({
  dashboardData,
}: {
  dashboardData: DashboardBusinessStats[];
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<
    "company" | "freelancer" | "exploring" | null
  >(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || dashboardData.length === 0) {
      return;
    }

    try {
      const storedId =
        typeof window !== "undefined"
          ? window.localStorage.getItem("activeBusinessId")
          : null;

      const hasStored = storedId
        ? dashboardData.some((business) => String(business.id) === storedId)
        : false;

      if (!hasStored) {
        const firstBusiness = dashboardData[0];
        if (firstBusiness) {
          window.localStorage.setItem(
            "activeBusinessId",
            String(firstBusiness.id)
          );
          window.localStorage.setItem("activeBusinessName", firstBusiness.name);
        }
      }
    } catch (_) {
      // Ignore storage failures (private mode, etc.)
    }
  }, [dashboardData, mounted]);

  if (dashboardData.length === 0) {
    return (
      <div className="py-16">
        {!selectedFlow ? (
          <>
            <div className="mx-auto max-w-4xl text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-header-text dark:text-slate-100 mb-4">
                Let's set up your workspace
              </h2>
              <p className="text-secondary-text dark:text-slate-400 max-w-2xl mx-auto">
                Whether you're running a registered company, freelancing under
                your own name, or just exploring, choose the path that fits. You
                can switch anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <OnboardingCard
                icon={Building}
                title="Registered business"
                description="Add company details, manage team members, and keep records compliant."
                actionLabel="Create company profile"
                onClick={() => setSelectedFlow("company")}
              />
              <OnboardingCard
                icon={User}
                title="Freelancer / Individual"
                description="Send invoices with your personal branding—logos and tax IDs are optional."
                actionLabel="Set up as freelancer"
                onClick={() => setSelectedFlow("freelancer")}
              />
              <OnboardingCard
                icon={Sparkles}
                title="Just exploring"
                description="Create a lightweight profile now and add company details later."
                actionLabel="Start with a quick profile"
                onClick={() => setSelectedFlow("exploring")}
              />
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedFlow(null)}
              className="mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Back to workspace setup</span>
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-blue-100 dark:border-slate-700 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-header-text dark:text-slate-100 mb-2">
                  {selectedFlow === "company"
                    ? "Create your company"
                    : selectedFlow === "freelancer"
                      ? "Set up your freelancer profile"
                      : "Create a starter profile"}
                </h2>
                <p className="text-secondary-text dark:text-slate-400">
                  {selectedFlow === "company"
                    ? "We'll capture the essentials—name, contact info, and branding."
                    : selectedFlow === "freelancer"
                      ? "Use your name or trading alias now. You can add company details anytime."
                      : "Stand up a lightweight profile today and add formal details whenever you're ready."}
                </p>
              </div>

              <CreateBusiness
                key={selectedFlow}
                mode={selectedFlow}
                onSuccess={() => setSelectedFlow(null)}
                closeModal={() => setSelectedFlow(null)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dashboardData.map((company) => (
        <BusinessCard key={company.id} company={company} />
      ))}
      {/* You might want to add an "+ Add New Company" card here as well,
          if the user's plan allows creating more companies and totalBusinesses > 0.
          This would be similar to the CustomModal setup in DashboardHeader.
          For now, this example assumes DashboardHeader handles adding subsequent companies.
      */}
    </div>
  );
}

function OnboardingCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onClick,
}: {
  icon: typeof Building;
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
}) {
  const content = (
    <div className="h-full rounded-2xl border border-blue-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-lg hover:shadow-xl transition-shadow p-6 text-left flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-header-text dark:text-slate-100">
          {title}
        </h3>
      </div>
      <p className="text-secondary-text dark:text-slate-400 flex-1 mb-6">
        {description}
      </p>
      <div className="mt-auto flex items-center justify-between text-sm font-semibold text-blue-600 dark:text-blue-400">
        <span>{actionLabel}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left block w-full rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
    >
      {content}
    </button>
  );
}
