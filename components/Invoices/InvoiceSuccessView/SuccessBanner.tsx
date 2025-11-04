import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import * as React from "react";

interface SuccessBannerProps {
  invoiceNumber?: string | null;
  visible: boolean;
}

export function SuccessBanner({ invoiceNumber, visible }: SuccessBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800 shadow-xl">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 dark:bg-green-800 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-300 mb-2">
              Invoice Created Successfully!
            </h1>
            <p className="text-green-700 dark:text-green-400 text-base md:text-lg">
              Invoice #{invoiceNumber || "N/A"} has been saved and is ready to
              use.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
