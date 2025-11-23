import * as React from "react";
import { Truck, Hammer, Code, MapPin, FileText, Hash } from "lucide-react";
import type { InvoiceListItem } from "@/types";

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

  const containerStyle: React.CSSProperties = {
    marginBottom: isCompactLayout ? "20px" : "24px",
    padding: isCompactLayout ? "16px" : "20px",
    backgroundColor: "#f8fafc", // slate-50
    borderRadius: "12px",
    border: "1px solid #e2e8f0", // slate-200
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(2, 1fr)",
    gap: "16px",
  };

  const itemStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b", // slate-500
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#0f172a", // slate-900
  };

  const renderTruckingDetails = () => (
    <div style={containerStyle}>
      <div
        style={{
          ...itemStyle,
          marginBottom: "16px",
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Truck size={18} color="#3b82f6" />
        <span style={{ fontWeight: 600, color: "#1e293b" }}>
          Logistics Details
        </span>
      </div>
      <div style={gridStyle}>
        {metaData.origin && (
          <div style={itemStyle}>
            <span style={labelStyle}>Origin</span>
            <span style={valueStyle}>{metaData.origin}</span>
          </div>
        )}
        {metaData.destination && (
          <div style={itemStyle}>
            <span style={labelStyle}>Destination</span>
            <span style={valueStyle}>{metaData.destination}</span>
          </div>
        )}
        {metaData.bol_number && (
          <div style={itemStyle}>
            <span style={labelStyle}>Bill of Lading #</span>
            <span style={valueStyle}>{metaData.bol_number}</span>
          </div>
        )}
        {metaData.truck_number && (
          <div style={itemStyle}>
            <span style={labelStyle}>Truck / Trailer #</span>
            <span style={valueStyle}>{metaData.truck_number}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderConstructionDetails = () => (
    <div style={containerStyle}>
      <div
        style={{
          ...itemStyle,
          marginBottom: "16px",
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Hammer size={18} color="#f97316" />
        <span style={{ fontWeight: 600, color: "#1e293b" }}>
          Project Details
        </span>
      </div>
      <div style={gridStyle}>
        {metaData.project_name && (
          <div style={itemStyle}>
            <span style={labelStyle}>Project Name</span>
            <span style={valueStyle}>{metaData.project_name}</span>
          </div>
        )}
        {metaData.site_address && (
          <div style={itemStyle}>
            <span style={labelStyle}>Site Address</span>
            <span style={valueStyle}>{metaData.site_address}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderFreelanceDetails = () => (
    <div style={containerStyle}>
      <div
        style={{
          ...itemStyle,
          marginBottom: "16px",
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Code size={18} color="#a855f7" />
        <span style={{ fontWeight: 600, color: "#1e293b" }}>
          Project Details
        </span>
      </div>
      <div style={gridStyle}>
        {metaData.project_name && (
          <div style={itemStyle}>
            <span style={labelStyle}>Project Name</span>
            <span style={valueStyle}>{metaData.project_name}</span>
          </div>
        )}
        {metaData.po_number && (
          <div style={itemStyle}>
            <span style={labelStyle}>PO Number</span>
            <span style={valueStyle}>{metaData.po_number}</span>
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
