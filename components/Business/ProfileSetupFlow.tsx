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
import { motion, AnimatePresence } from "framer-motion";

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
  const outerPadding = isModal ? "py-6" : "py-0";
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
      <AnimatePresence mode="wait">
        {!selectedFlow ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
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

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
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
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
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
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-full w-full flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="mb-4 rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>
      <div className="mt-auto flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
        {actionLabel}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
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
    <div className="mx-auto mb-12 max-w-3xl">
      <div className="relative flex justify-between">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 px-12">
          <div className="h-0.5 w-full bg-gray-200 dark:bg-slate-800">
            <motion.div
              className="h-full bg-blue-600 dark:bg-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: currentStep === 2 ? "100%" : "0%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {steps.map((step) => {
          const isClickable =
            step.id === 1 || (step.id === 2 && canAccessDetails);
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => (isClickable ? onNavigate(step.id) : undefined)}
                disabled={!isClickable}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCurrent
                    ? "border-blue-600 bg-white text-blue-600 dark:border-blue-500 dark:bg-slate-900 dark:text-blue-500 scale-110 shadow-lg shadow-blue-500/20"
                    : isCompleted
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                      : "border-gray-300 bg-white text-gray-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600"
                }`}
              >
                {isCompleted ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                ) : (
                  <span className="text-sm font-bold">{step.id}</span>
                )}
              </button>
              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    isCurrent
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {step.label}
                </p>
                <p className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
