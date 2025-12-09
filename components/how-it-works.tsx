"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  UserPlus,
  FileEdit,
  Send,
  CheckCircle,
  Zap,
  Shield,
  CreditCard,
  Mail,
  Eye,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

function EmailTypingVisual() {
  const [text, setText] = useState("");
  const fullText = "alex@company.com";

  useEffect(() => {
    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      const currentText = fullText.substring(0, currentIndex);
      setText(currentText);

      let typeSpeed = 100;

      if (isDeleting) {
        typeSpeed /= 2;
      }

      if (!isDeleting && currentIndex === fullText.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && currentIndex === 0) {
        isDeleting = false;
        typeSpeed = 500; // Pause before starting
      }

      if (isDeleting) {
        currentIndex--;
      } else {
        currentIndex++;
      }

      timeoutId = setTimeout(type, typeSpeed);
    };

    timeoutId = setTimeout(type, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative w-full h-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-center overflow-hidden">
      <div className="space-y-4 max-w-[240px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="h-2.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full mb-1.5" />
            <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-9 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 flex items-center overflow-hidden">
            <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">
              {text}
            </span>
            <span className="w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5" />
          </div>
          <div className="h-9 w-full bg-blue-600 rounded-lg shadow-md shadow-blue-600/20 flex items-center justify-center text-white text-sm font-medium">
            Create Account
          </div>
        </div>
      </div>
    </div>
  );
}

function SendButtonVisual() {
  const [status, setStatus] = useState<"idle" | "hover" | "sending" | "sent">(
    "idle"
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const runAnimation = () => {
      setStatus("idle");

      // Move cursor to hover
      timeout = setTimeout(() => {
        setStatus("hover");

        // Click/Sending
        timeout = setTimeout(() => {
          setStatus("sending");

          // Sent
          timeout = setTimeout(() => {
            setStatus("sent");

            // Reset
            timeout = setTimeout(runAnimation, 3000);
          }, 1500);
        }, 600);
      }, 1000);
    };

    runAnimation();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative w-full h-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center justify-center overflow-hidden">
      <div className="relative z-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-4 w-64">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500",
              status === "sent"
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-pink-100 dark:bg-pink-900/30"
            )}
          >
            {status === "sent" ? (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <Mail className="w-4 h-4 text-pink-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
              invoice_1023.pdf
            </div>
            <div className="text-[10px] text-slate-500 transition-all duration-300">
              {status === "sent"
                ? "Sent successfully"
                : status === "sending"
                  ? "Sending..."
                  : "Ready to send"}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
            Preview
          </div>
          <div
            className={cn(
              "flex-1 h-8 rounded-lg flex items-center justify-center gap-1.5 text-white text-xs font-medium shadow-lg transition-all duration-300",
              status === "sent"
                ? "bg-green-500 shadow-green-500/20"
                : "bg-pink-500 shadow-pink-500/20",
              status === "hover" && "bg-pink-600 scale-105",
              status === "sending" && "bg-pink-600 scale-95"
            )}
          >
            {status === "sent" ? (
              <>
                Sent <CheckCircle className="w-3 h-3" />
              </>
            ) : status === "sending" ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Send <Send className="w-3 h-3" />
              </>
            )}
          </div>
        </div>

        {/* Cursor */}
        <div
          className="absolute z-20 transition-all duration-500 ease-in-out pointer-events-none"
          style={{
            bottom: status === "idle" ? "-20px" : "20px",
            right: status === "idle" ? "-20px" : "40px",
            opacity: status === "idle" ? 0 : 1,
            transform: status === "sending" ? "scale(0.9)" : "scale(1)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-md"
          >
            <path
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
              fill="black"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50" />
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-2xl transition-colors duration-500",
          status === "sent" ? "bg-green-500/10" : "bg-pink-500/10"
        )}
      />
    </div>
  );
}

function EmailStatusVisual() {
  const timeline = [
    {
      label: "Sent",
      time: "Dec 09, 1:54 PM",
      icon: Send,
      color: "bg-slate-200 dark:bg-slate-800",
      accent: "border-slate-200 dark:border-slate-700",
    },
    {
      label: "Delivered",
      time: "Dec 09, 1:54 PM",
      icon: Check,
      color: "bg-green-100 dark:bg-green-900/30",
      accent: "border-green-200 dark:border-green-800",
    },
    {
      label: "Opened",
      time: "Dec 09, 1:54 PM",
      icon: Eye,
      color: "bg-blue-100 dark:bg-blue-900/30",
      accent: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Clicked",
      time: "Dec 09, 1:54 PM",
      icon: Zap,
      color: "bg-purple-100 dark:bg-purple-900/30",
      accent: "border-purple-200 dark:border-purple-800",
    },
    {
      label: "Opened",
      time: "Dec 09, 2:01 PM",
      icon: Eye,
      color: "bg-blue-100 dark:bg-blue-900/30",
      accent: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Clicked",
      time: "Dec 09, 2:01 PM",
      icon: Zap,
      color: "bg-purple-100 dark:bg-purple-900/30",
      accent: "border-purple-200 dark:border-purple-800",
    },
  ];

  const total = timeline.length;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 1400);

    return () => clearInterval(interval);
  }, [total]);

  return (
    <div className="relative w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 overflow-hidden">
      <div className="absolute top-10 left-4 right-4 h-px bg-slate-100 dark:bg-slate-800 pointer-events-none" />
      <div className="relative flex items-start gap-6 md:gap-8 overflow-x-auto pb-2 px-1 min-w-full">
        <div className="flex items-start gap-6 md:gap-8 min-w-max">
          {timeline.map((event, index) => {
            const Icon = event.icon;
            const isActive = index === activeIndex;
            const isPassed = index < activeIndex;

            return (
              <div
                key={`${event.label}-${index}`}
                className="relative flex flex-col items-center min-w-[120px]"
              >
                {index !== timeline.length - 1 && (
                  <div className="absolute left-1/2 top-5 w-[140%] h-px bg-slate-200 dark:bg-slate-800 -z-10" />
                )}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl border flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm transition-all duration-300",
                    event.color,
                    event.accent,
                    isActive &&
                      "scale-105 ring-2 ring-purple-200 dark:ring-purple-800 text-purple-700 dark:text-purple-200",
                    isPassed && "opacity-80"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                  {event.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {event.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    title: "Create Account",
    description:
      "Sign up in seconds. No credit card required. Get access to professional templates immediately.",
    icon: UserPlus,
    color: "bg-blue-500",
    visual: <EmailTypingVisual />,
  },
  {
    title: "Customize Invoice",
    description:
      "Add your branding, logo, and payment details. Choose from our beautiful pre-made templates.",
    icon: FileEdit,
    color: "bg-purple-500",
    visual: (
      <div className="relative w-full h-48 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex items-center justify-center p-4">
        <div className="relative w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 p-4 transform -rotate-2 transition-transform hover:rotate-0 duration-500">
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-md flex items-center justify-center">
              <div className="w-4 h-4 bg-purple-500 rounded-sm" />
            </div>
            <div className="space-y-1 text-right">
              <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full ml-auto" />
              <div className="h-1.5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full ml-auto" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
            <div className="h-1.5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-full" />
            <div className="h-1.5 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="h-1.5 w-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-4 w-12 bg-purple-100 dark:bg-purple-900/30 rounded text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center">
              $1,250
            </div>
          </div>

          {/* Customization Panel */}
          <div className="absolute -right-12 top-6 bg-white dark:bg-slate-800 p-2.5 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 w-28 transform rotate-6 hover:rotate-0 transition-all duration-300 z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                Theme
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            </div>
            <div className="flex gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-full bg-purple-500 ring-2 ring-offset-1 ring-purple-500/20 dark:ring-offset-slate-800 cursor-pointer" />
              <div className="w-5 h-5 rounded-full bg-blue-500 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" />
              <div className="w-5 h-5 rounded-full bg-emerald-500 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
              <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-purple-500 rounded-full" />
              </div>
              <div className="flex justify-between text-[8px] text-slate-400">
                <span>Font</span>
                <span>Inter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Send Instantly",
    description:
      "Send professional invoices via email or share a secure link directly with your clients.",
    icon: Send,
    color: "bg-pink-500",
    visual: <SendButtonVisual />,
  },
  {
    title: "Track Email Status",
    description:
      "Know exactly when your invoice is delivered and opened. Stay in the loop.",
    icon: CheckCircle,
    color: "bg-green-500",
    visual: <EmailStatusVisual />,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-slate-50 dark:bg-slate-950/50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white"
          >
            How it works
          </motion.h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From sign up to getting paid, we've streamlined every step of the
            process.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm",
                      step.color
                    )}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base md:text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="relative mt-6">
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500",
                      step.color
                    )}
                  />
                  <div className="relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-lg overflow-hidden">
                    {step.visual}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
