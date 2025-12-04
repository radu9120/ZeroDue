import { CheckCircle, X } from "lucide-react";
import * as React from "react";
import { useState, useEffect } from "react";

interface SuccessBannerProps {
  invoiceNumber?: string | null;
  visible: boolean;
}

export function SuccessBanner({ invoiceNumber, visible }: SuccessBannerProps) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) {
    return null;
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4 relative animate-in fade-in slide-in-from-top-2 duration-300">
      <button
        onClick={() => setShow(false)}
        className="absolute top-3 right-3 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-green-800 dark:text-green-300">
            Invoice Created Successfully!
          </h2>
          <p className="text-sm text-green-700 dark:text-green-400">
            Invoice #{invoiceNumber || "N/A"} has been saved and is ready to
            use.
          </p>
        </div>
      </div>
    </div>
  );
}
