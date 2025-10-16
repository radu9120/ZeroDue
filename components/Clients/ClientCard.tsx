"use client";
import {
  DollarSign,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  PlusIcon,
  Users,
} from "lucide-react";
import CustomModal from "../ModalsForms/CustomModal";
import InvoiceByBusinessClient from "../Invoices/InvoiceWrapper";
import { ClientForm } from "./ClientForm"; // Import ClientForm
import { updateClient } from "@/lib/actions/client.actions"; // Import update action
import { useState } from "react";
import { billToSchema } from "@/schemas/invoiceSchema";
import { z } from "zod";
import { useRouter } from "next/navigation";

export default function ClientCard({ client }: { client: any }) {
  const router = useRouter();
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const handleUpdateClient = async (values: z.infer<typeof billToSchema>) => {
    setIsEditSubmitting(true);
    try {
      // Add the client ID to the values
      const dataToUpdate = { ...values, id: client.id };
      const updatedClient = await updateClient(dataToUpdate);

      if (updatedClient) {
        console.log("Client updated successfully:", updatedClient);
        router.refresh(); // Refresh to show updated data
        // Modal should close automatically after successful submission
      } else {
        console.error("Failed to update client");
        alert("Failed to update client. Please try again.");
      }
    } catch (error) {
      console.error("Error updating client:", error);
      alert(
        `Error updating client: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsEditSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-header-text dark:text-slate-100">{client.name}</h3>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-secondary-text dark:text-slate-400" />
          <span className="text-sm text-primary-text dark:text-slate-300">{client.email}</span>
        </div>
        {client.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-secondary-text dark:text-slate-400" />
            <span className="text-sm text-primary-text dark:text-slate-300">{client.phone}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-secondary-text dark:text-slate-400 mt-0.5" />
            <span className="text-sm text-primary-text dark:text-slate-300">{client.address}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-secondary-text dark:text-slate-400">
              Invoices
            </span>
          </div>
          <span className="text-lg font-bold text-header-text dark:text-slate-100">
            {client.invoices || 0}
          </span>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-secondary-text dark:text-slate-400">
              Total
            </span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {client.totalPaid || "$0.00"}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <CustomModal
          heading={`Edit Client: ${client.name}`}
          description="Update the client's information"
          openBtnLabel="Edit"
          btnVariant="secondary"
          btnIcon={Edit}
          className="w-full"
        >
          <ClientForm
            business_id={client.business_id}
            defaultValues={{
              id: client.id,
              name: client.name,
              email: client.email,
              phone: client.phone || "",
              address: client.address || "",
              business_id: client.business_id,
            }}
            onSubmit={handleUpdateClient}
            submitButtonText="Save Changes"
            isSubmitting={isEditSubmitting}
          />
        </CustomModal>
        <CustomModal
          heading={`New Invoice for ${client.name}`}
          description="Create a new invoice for this client"
          openBtnLabel="Invoice"
          btnVariant="primary"
          btnIcon={PlusIcon}
        >
          <InvoiceByBusinessClient
            company_id={client.business_id}
            client={client}
          />
        </CustomModal>
      </div>
    </div>
  );
}
