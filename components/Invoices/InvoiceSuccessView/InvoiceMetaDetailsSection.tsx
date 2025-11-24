import * as React from "react";
import { Truck, Hammer, Code } from "lucide-react";
import type { InvoiceListItem } from "@/types";
import { cn } from "@/lib/utils";

interface InvoiceMetaDetailsSectionProps {
  invoice: InvoiceListItem;
  isCompactLayout: boolean;
}

export function InvoiceMetaDetailsSection({
  invoice,
  isCompactLayout,
}: InvoiceMetaDetailsSectionProps) {
  const metaData = (invoice as any).meta_data || {};
  const template = invoice.invoice_template;

  if (!metaData || Object.keys(metaData).length === 0) {
    return null;
  }

  const containerClass = cn(
    "mb-6 p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200",
    isCompactLayout && "mb-5 p-4"
  );

  const gridClass = cn(
    "grid gap-4",
    isCompactLayout ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
  );

  const itemClass = "flex flex-col gap-1";
  const labelClass =
    "text-xs font-semibold text-slate-500 uppercase tracking-wide";
  const valueClass = "text-sm font-medium text-slate-900";

  const renderTruckingDetails = () => (
    <div className={containerClass}>
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-[18px] w-[18px] text-blue-500" />
        <span className="font-semibold text-slate-800">Logistics Details</span>
      </div>
      <div className={gridClass}>
        {metaData.origin && (
          <div className={itemClass}>
            <span className={labelClass}>Origin</span>
            <span className={valueClass}>{metaData.origin}</span>
          </div>
        )}
        {metaData.destination && (
          <div className={itemClass}>
            <span className={labelClass}>Destination</span>
            <span className={valueClass}>{metaData.destination}</span>
          </div>
        )}
        {metaData.bol_number && (
          <div className={itemClass}>
            <span className={labelClass}>Bill of Lading #</span>
            <span className={valueClass}>{metaData.bol_number}</span>
          </div>
        )}
        {metaData.truck_number && (
          <div className={itemClass}>
            <span className={labelClass}>Truck / Trailer #</span>
            <span className={valueClass}>{metaData.truck_number}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderConstructionDetails = () => (
    <div className={containerClass}>
      <div className="flex items-center gap-2 mb-4">
        <Hammer className="h-[18px] w-[18px] text-orange-500" />
        <span className="font-semibold text-slate-800">Project Details</span>
      </div>
      <div className={gridClass}>
        {metaData.project_name && (
          <div className={itemClass}>
            <span className={labelClass}>Project Name</span>
            <span className={valueClass}>{metaData.project_name}</span>
          </div>
        )}
        {metaData.site_address && (
          <div className={itemClass}>
            <span className={labelClass}>Site Address</span>
            <span className={valueClass}>{metaData.site_address}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderFreelanceDetails = () => (
    <div className={containerClass}>
      <div className="flex items-center gap-2 mb-4">
        <Code className="h-[18px] w-[18px] text-purple-500" />
        <span className="font-semibold text-slate-800">Project Details</span>
      </div>
      <div className={gridClass}>
        {metaData.project_name && (
          <div className={itemClass}>
            <span className={labelClass}>Project Name</span>
            <span className={valueClass}>{metaData.project_name}</span>
          </div>
        )}
        {metaData.po_number && (
          <div className={itemClass}>
            <span className={labelClass}>PO Number</span>
            <span className={valueClass}>{metaData.po_number}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (template === "trucking") return renderTruckingDetails();
  if (template === "construction") return renderConstructionDetails();
  if (template === "freelance") return renderFreelanceDetails();

  return null;
}
