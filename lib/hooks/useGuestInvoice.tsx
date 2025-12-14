"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface GuestInvoiceData {
  company_name?: string;
  company_email?: string;
  company_address?: string;
  client_name?: string;
  client_email?: string;
  client_address?: string;
  invoice_number?: string;
  issue_date?: string;
  due_date?: string;
  currency?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  notes?: string;
  subtotal?: number;
  total?: number;
}

const PENDING_INVOICE_KEY = "zerodue_pending_invoice";
const GUEST_DRAFT_KEY = "zerodue_guest_invoice_draft";

export function useGuestInvoiceData() {
  const searchParams = useSearchParams();
  const [guestData, setGuestData] = useState<GuestInvoiceData | null>(null);
  const [isFromGuest, setIsFromGuest] = useState(false);

  useEffect(() => {
    const fromGuest = searchParams.get("from_guest") === "true";
    setIsFromGuest(fromGuest);

    if (fromGuest) {
      try {
        // Check for pending invoice data
        const pendingData = localStorage.getItem(PENDING_INVOICE_KEY);
        const draftData = localStorage.getItem(GUEST_DRAFT_KEY);

        const dataToUse = pendingData || draftData;

        if (dataToUse) {
          const parsed = JSON.parse(dataToUse);
          setGuestData(parsed);

          // Show success message
          toast.success("Welcome! Your invoice data has been restored.", {
            description: "Complete your business profile to send the invoice.",
          });

          // Clean up localStorage
          localStorage.removeItem(PENDING_INVOICE_KEY);
          localStorage.removeItem(GUEST_DRAFT_KEY);
        }
      } catch (error) {
        console.error("Failed to restore guest invoice data:", error);
      }
    }
  }, [searchParams]);

  return { guestData, isFromGuest };
}

interface GuestInvoiceHandlerProps {
  onDataReady?: (data: GuestInvoiceData) => void;
  children: React.ReactNode;
}

export function GuestInvoiceHandler({
  onDataReady,
  children,
}: GuestInvoiceHandlerProps) {
  const { guestData, isFromGuest } = useGuestInvoiceData();

  useEffect(() => {
    if (guestData && onDataReady) {
      onDataReady(guestData);
    }
  }, [guestData, onDataReady]);

  return <>{children}</>;
}

/**
 * Converts guest invoice form data to the full invoice form format
 */
export function convertGuestDataToFormData(
  guestData: GuestInvoiceData,
  businessId: number
) {
  return {
    invoice_number: guestData.invoice_number || "INV0001",
    company_details: {
      name: guestData.company_name || "",
      email: guestData.company_email || "",
      address: guestData.company_address || "",
      phone: "",
      currency: guestData.currency || "GBP",
      profile_type: "company" as const,
    },
    bill_to: {
      name: guestData.client_name || "",
      email: guestData.client_email || "",
      address: guestData.client_address || "",
      phone: "",
      business_id: businessId,
    },
    issue_date: guestData.issue_date
      ? new Date(guestData.issue_date)
      : new Date(),
    due_date: guestData.due_date ? new Date(guestData.due_date) : new Date(),
    items: guestData.items || [
      { description: "", quantity: 1, unit_price: 0, tax: 0, amount: 0 },
    ],
    description: "",
    subtotal: guestData.subtotal || 0,
    discount: 0,
    shipping: 0,
    total: guestData.total || 0,
    notes: guestData.notes || "",
    bank_details: "",
    currency: guestData.currency || "GBP",
    business_id: businessId,
    invoice_template: "standard",
    meta_data: { from_guest: true },
  };
}
