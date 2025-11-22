"use client";

import { useState } from "react";
import {
  Building,
  ChevronLeft,
  Sparkles,
  User,
  ArrowRight,
} from "lucide-react";
import { CreateBusiness } from "./Forms/CreateBusiness";

export type ProfileFlowMode = "company" | "freelancer" | "exploring";

interface ProfileSetupFlowProps {
  variant?: "standalone" | "modal";
  onCompleted?: () => void;
  closeModal?: () => void;
}

export default function ProfileSetupFlow({
  variant = "standalone",
  onCompleted,
  closeModal,
}: ProfileSetupFlowProps) {
  const [selectedFlow, setSelectedFlow] = useState<ProfileFlowMode | null>(
    null
  );
  const currentStep = selectedFlow ? 2 : 1;

  const handleSuccess = () => {
    setSelectedFlow(null);
    onCompleted?.();
    closeModal?.();
  };

  const isModal = variant === "modal";
  const outerPadding = isModal ? "py-6" : "py-16";
  const containerClasses = `${outerPadding} px-4 sm:px-6`;

  const handleStepNavigation = (step: number) => {
    if (step === 1) {
      setSelectedFlow(null);
    }
  };

  return (
    <div className={containerClasses}>
      <StepProgress
        currentStep={currentStep}
        onNavigate={handleStepNavigation}
        canAccessDetails={Boolean(selectedFlow)}
      />
      {!selectedFlow ? (
        <>
          <div className="mx-auto max-w-4xl text-center mb-10 space-y-3">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-blue-500 dark:text-blue-300">
              Create or switch profile type
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-header-text dark:text-slate-100">
              Let's set up your workspace
            </h2>
            <p className="text-secondary-text dark:text-slate-400 max-w-2xl mx-auto text-base">
              Whether you're running a registered company, freelancing under
              your own name, or just exploring, choose the path that fits. You
              can switch anytime.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
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
              onSuccess={handleSuccess}
              closeModal={() => {
                setSelectedFlow(null);
                closeModal?.();
              }}
            />
          </div>
        </div>
      )}
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
    <div className="h-full rounded-3xl border border-blue-100/70 bg-white/95 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl dark:border-slate-700/70 dark:bg-slate-900/90">
      <div className="flex h-full flex-col p-6 sm:p-7 text-left">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/40">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <h3 className="text-xl font-semibold text-header-text dark:text-slate-100">
            {title}
          </h3>
        </div>
        <p className="text-secondary-text dark:text-slate-400 flex-1 mb-6 leading-relaxed">
          {description}
        </p>
        <div className="mt-auto flex items-center justify-between text-sm font-semibold text-blue-600 dark:text-blue-300">
          <span>{actionLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left block w-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
    >
      {content}
    </button>
  );
}

function StepProgress({
  currentStep,
  onNavigate,
  canAccessDetails,
}: {
  currentStep: 1 | 2;
  onNavigate: (step: number) => void;
  canAccessDetails: boolean;
}) {
  const steps = [
    {
      id: 1,
      label: "Choose profile type",
      description: "Pick the path that fits",
      isActive: currentStep === 1,
    },
    {
      id: 2,
      label: "Enter profile details",
      description: "Complete your information",
      isActive: currentStep === 2,
    },
  ];

  return (
    <div className="mx-auto mb-8 max-w-4xl">
      <ol className="grid gap-3 rounded-3xl border border-blue-100/60 bg-white/80 p-4 shadow-sm sm:grid-cols-2 dark:border-slate-700/70 dark:bg-slate-900/80">
        {steps.map((step, index) => {
          const isClickable =
            step.id === 1 || (step.id === 2 && canAccessDetails);
          const isPast = currentStep > step.id;
          const baseStyles = step.isActive
            ? "border-blue-500 bg-blue-50/60 text-blue-900"
            : isPast
              ? "border-blue-200 bg-white text-blue-600"
              : "border-transparent text-gray-500";
          return (
            <li key={step.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => (isClickable ? onNavigate(step.id) : undefined)}
                disabled={!isClickable}
                className={`flex w-full flex-col rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-100 ${baseStyles}`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">
                    {step.id}
                  </span>
                  {step.label}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  {step.description}
                </span>
              </button>
              {index === 0 && (
                <span className="hidden h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent sm:block" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
