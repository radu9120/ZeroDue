"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { companySchema } from "@/schemas/invoiceSchema"; // Adjust path as needed
import BusinessForm from "./BusinessForm"; // Adjust path as needed
import {
  createBusiness as createBusinessAction,
  type CreateBusinessResult,
} from "@/lib/actions/business.actions"; // Adjust path
import { useState } from "react";
import { uploadFileAndGetUrl } from "@/lib/actions/logo.action"; // Adjust path

interface CreateBusinessProps {
  closeModal?: () => void; // Optional prop to close the modal
  onSuccess?: () => void; // Optional generic success callback
}

export const CreateBusiness = ({
  closeModal,
  onSuccess,
}: CreateBusinessProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      phone: "",
      vat: undefined,
      currency: "GBP",
      logo: "", // Initialize as empty string
    },
  });

  const handleCreateSubmit = async (values: z.infer<typeof companySchema>) => {
    setIsSubmitting(true);
    try {
      let logoUrl: string = "";

      if (selectedFile) {
        logoUrl = await uploadFileAndGetUrl(selectedFile);
      }
      // No need to check values.logo here for create, as it's for new entities

      const finalValues = {
        ...values,
        logo: logoUrl,
      };

      const result: CreateBusinessResult =
        await createBusinessAction(finalValues);

      if (result.ok) {
        console.log("Success, created business:", result.business);
        window.location.reload(); // Refresh page data

        if (onSuccess) {
          // Call generic onSuccess if provided
          onSuccess();
        }

        if (closeModal) {
          // Close the modal
          closeModal();
        }
      } else {
        console.error("Failed to create business:", result.error);
        const baseMsg = result.transient
          ? "Network issue prevented creating the business. Please check your connection and retry."
          : result.error || "Failed to create business.";
        form.setError("root", { message: baseMsg });
      }
    } catch (error: any) {
      console.error("Error during business creation:", error);
      form.setError("root", {
        message: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BusinessForm
      form={form}
      onSubmit={handleCreateSubmit}
      submitButtonText="Create Business"
      onFileChange={setSelectedFile}
      isSubmitting={isSubmitting} // Pass submitting state to the form
      // If BusinessForm has an onCancel that should also close the modal:
      onCancel={closeModal}
    />
  );
};
