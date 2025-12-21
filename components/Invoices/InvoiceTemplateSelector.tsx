"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Truck,
  Hammer,
  Code,
  FileText,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Sparkles,
  Zap,
  Wrench,
  Camera,
  Palette,
  Trees,
} from "lucide-react";
import { motion } from "framer-motion";

export type InvoiceTemplateType =
  | "standard"
  | "trucking"
  | "construction"
  | "freelance"
  | "hourly"
  | "timesheet"
  | "cleaning"
  | "electrical"
  | "plumbing"
  | "photography"
  | "design"
  | "landscaping"
  | "consultant";

interface InvoiceTemplateSelectorProps {
  selectedTemplate: InvoiceTemplateType;
  onSelect: (template: InvoiceTemplateType) => void;
}

export const InvoiceTemplateSelector = ({
  selectedTemplate,
  onSelect,
}: InvoiceTemplateSelectorProps) => {
  const templates = [
    {
      id: "standard",
      name: "Standard",
      icon: FileText,
      description: "General purpose invoice for any business.",
    },
    {
      id: "hourly",
      name: "Hourly / Time",
      icon: Clock,
      description: "Bill by the hour. Great for consultants and contractors.",
    },
    {
      id: "timesheet",
      name: "Weekly Timesheet",
      icon: Clock,
      description: "Track daily shifts with start/finish times and rates.",
    },
    {
      id: "trucking",
      name: "Trucking / Logistics",
      icon: Truck,
      description: "Includes Origin, Destination, BOL, and Fuel Surcharge.",
    },
    {
      id: "construction",
      name: "Construction / Contractor",
      icon: Hammer,
      description: "Project billing with materials, labor, and retainage.",
    },
    {
      id: "freelance",
      name: "Freelance / Creative",
      icon: Briefcase,
      description: "Milestone-based billing for freelancers and agencies.",
    },
    {
      id: "consultant",
      name: "Consulting Services",
      icon: Code,
      description: "Professional services with hourly or project rates.",
    },
    {
      id: "cleaning",
      name: "Cleaning Services",
      icon: Sparkles,
      description: "Property-based billing with recurring service options.",
    },
    {
      id: "electrical",
      name: "Electrical Services",
      icon: Zap,
      description: "Job-based invoicing with parts and labor breakdown.",
    },
    {
      id: "plumbing",
      name: "Plumbing Services",
      icon: Wrench,
      description: "Service calls with parts, labor, and emergency rates.",
    },
    {
      id: "photography",
      name: "Photography",
      icon: Camera,
      description: "Session-based billing with package and print options.",
    },
    {
      id: "design",
      name: "Design Services",
      icon: Palette,
      description: "Project-based design work with revisions and assets.",
    },
    {
      id: "landscaping",
      name: "Landscaping",
      icon: Trees,
      description: "Property maintenance with materials and labor split.",
    },
  ] as const;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2);
      } else {
        setVisibleItems(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, templates.length - visibleItems);

  // Ensure index is valid on resize
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const next = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex((c) => c + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
    }
  };

  return (
    <div className="relative mb-8 group">
      {/* Desktop/Tablet Controls */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:block">
        <Button
          variant="neutralOutline"
          size="icon"
          className={cn(
            "rounded-full shadow-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700",
            currentIndex === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={prev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:block">
        <Button
          variant="neutralOutline"
          size="icon"
          className={cn(
            "rounded-full shadow-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700",
            currentIndex === maxIndex && "opacity-50 cursor-not-allowed"
          )}
          onClick={next}
          disabled={currentIndex === maxIndex}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Carousel Track */}
      <div className="overflow-hidden px-1 py-2 -mx-1">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * (100 / visibleItems)}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            const Icon = template.icon;

            return (
              <div
                key={template.id}
                className={cn(
                  "flex-shrink-0 px-2 transition-all duration-300",
                  visibleItems === 1
                    ? "w-full"
                    : visibleItems === 2
                      ? "w-1/2"
                      : "w-1/4"
                )}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-200 border-2 hover:border-blue-400 dark:hover:border-blue-500 relative overflow-hidden h-full",
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20"
                      : "border-transparent hover:shadow-md"
                  )}
                  onClick={() => onSelect(template.id as InvoiceTemplateType)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center h-full justify-center gap-3 min-h-[160px]">
                    {isSelected && (
                      <div className="absolute top-2 right-2 text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "p-3 rounded-full",
                        isSelected
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Mobile Controls */}
      <div className="flex sm:hidden justify-between mt-2 px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={prev}
          disabled={currentIndex === 0}
          className="text-gray-500"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Prev
        </Button>
        <div className="flex gap-1 items-center">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === currentIndex
                  ? "bg-blue-600"
                  : "bg-gray-300 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={next}
          disabled={currentIndex === maxIndex}
          className="text-gray-500"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
