import * as React from "react";
import type { ParsedBillTo } from "./types";

interface BillToSectionProps {
  billTo: ParsedBillTo | null;
}

export function BillToSection({ billTo }: BillToSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        BILL TO
      </h3>
      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
        <p className="font-bold text-gray-900 dark:text-slate-100 text-base mb-1">
          {billTo?.name || "Client"}
        </p>
        {billTo?.address && (
          <p className="text-sm text-gray-600 dark:text-slate-300 whitespace-pre-line leading-relaxed mt-1">
            {billTo.address as string}
          </p>
        )}
        {billTo?.email && (
          <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
            {billTo.email as string}
          </p>
        )}
      </div>
    </div>
  );
}
