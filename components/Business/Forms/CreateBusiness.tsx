"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { companySchema } from "@/schemas/invoiceSchema"; // Adjust path as needed
import BusinessForm from "./BusinessForm"; // Adjust path as needed
import {
  createBusiness as createBusinessAction,
  type CreateBusinessResult,
} from "@/lib/actions/business.actions"; // Adjust path
import { uploadFileAndGetUrl } from "@/lib/actions/logo.action"; // Adjust path

interface CreateBusinessProps {
  closeModal?: () => void; // Optional prop to close the modal
  onSuccess?: () => void; // Optional generic success callback
  mode?: "company" | "freelancer" | "exploring";
}

export const CreateBusiness = ({
  closeModal,
  onSuccess,
  mode = "company",
}: CreateBusinessProps) => {
  type BusinessFormValues = z.infer<typeof companySchema>;
  type ProfileType = BusinessFormValues["profile_type"];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state

  const resolvedProfileType = useMemo<ProfileType>(() => {
    if (mode === "freelancer" || mode === "exploring") {
      return mode;
    }
    return "company";
  }, [mode]);

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      phone: "",
      vat: "",
      tax_label: mode === "company" ? "VAT" : "Tax number",
      currency: "GBP",
      logo: "",
      profile_type: resolvedProfileType,
    },
  });

  useEffect(() => {
    form.setValue("profile_type", resolvedProfileType);
  }, [form, resolvedProfileType]);

  const handleCreateSubmit = async (values: z.infer<typeof companySchema>) => {
    setIsSubmitting(true);
    try {
      let logoUrl: string = "";

      if (selectedFile) {
        logoUrl = await uploadFileAndGetUrl(selectedFile);
      }
      // No need to check values.logo here for create, as it's for new entities

      const finalValues: BusinessFormValues = {
        ...values,
        profile_type: resolvedProfileType,
        logo: logoUrl,
      };

      const result: CreateBusinessResult =
        await createBusinessAction(finalValues);

      if (result.ok) {
        console.log("Success, created business:", result.business);

        if (onSuccess) {
          // Call generic onSuccess if provided
          onSuccess();
        } else {
          window.location.reload(); // Refresh page data
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
      mode={mode}
    />
  );
};
