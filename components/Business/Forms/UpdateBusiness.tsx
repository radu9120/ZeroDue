"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { companySchema } from "@/schemas/invoiceSchema";
import BusinessForm from "./BusinessForm";
import { useEffect, useState } from "react";
import { BusinessType } from "@/types";
import {
  getBusinessById,
  updateBusiness,
} from "@/lib/actions/business.actions";
import { useRouter } from "next/navigation";
import {
  deleteFileFromBucket,
  uploadFileAndGetUrl,
  updateFileInBucket,
} from "@/lib/actions/logo.action";
import { CheckCircle } from "lucide-react";

interface UpdateBusinessProps {
  businessId: number;
  closeModal?: () => void;
}

type CompanyFormData = z.infer<typeof companySchema>;

export const UpdateBusiness = ({
  businessId,
  closeModal,
}: UpdateBusinessProps) => {
  const router = useRouter();

  const [business, setBusiness] = useState<BusinessType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  useEffect(() => {
    const fetchBusinessData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedBusiness = await getBusinessById(businessId);
        if (fetchedBusiness) {
          setBusiness(fetchedBusiness);
        } else {
          setError("Business not found.");
        }
      } catch (err) {
        console.error("Failed to fetch business:", err);
        setError("Failed to load business data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId]);

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      phone: "",
      vat: "",
      tax_label: "VAT",
      currency: "GBP",
      logo: "",
      profile_type: "company",
    },
    values: business
      ? {
          name: business.name,
          email: business.email,
          address: business.address,
          phone: business.phone || "",
          vat: business.vat || "",
          tax_label: business.tax_label || "VAT",
          currency: business.currency || "GBP",
          logo: business.logo || "",
          profile_type: business.profile_type || "company",
        }
      : undefined,
    mode: "onChange",
  });

  useEffect(() => {
    if (business) {
      form.reset({
        name: business.name,
        email: business.email,
        address: business.address,
        phone: business.phone || "",
        vat: business.vat || "",
        currency: business.currency || "GBP",
        logo: business.logo || "",
        profile_type: business.profile_type || "company",
      });
    }
  }, [business, form]);

  const handleUpdateSubmit = async (validatedValues: CompanyFormData) => {
    if (!business) {
      setError("Cannot update: Business data not loaded.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const payload: Partial<CompanyFormData> = {};
    let hasMeaningfulChanges = false;

    try {
      // 1. Handle logo change
      if (newLogoFile) {
        console.log("Client: New logo file detected:", newLogoFile.name);
        console.log("Client: Current business logo:", business.logo);

        if (
          business.logo &&
          typeof business.logo === "string" &&
          business.logo.trim() !== ""
        ) {
          // Update existing logo file and get cache-busted URL
          console.log("Client: Updating existing logo file:", business.logo);
          const updatedLogoUrl = await updateFileInBucket(
            business.logo,
            newLogoFile
          );
          console.log(
            "Client: Logo file updated successfully with URL:",
            updatedLogoUrl
          );

          // IMPORTANT: Update form state to reflect the new URL
          form.setValue("logo", updatedLogoUrl);

          // Update database with the cache-busted URL
          payload.logo = updatedLogoUrl;
          hasMeaningfulChanges = true;
        } else {
          // Upload new logo (no existing logo)
          console.log("Client: Uploading new logo file");
          const newLogoUrl = await uploadFileAndGetUrl(newLogoFile);
          console.log("Client: New logo uploaded with URL:", newLogoUrl);

          // Update local state immediately
          setBusiness((prev) => (prev ? { ...prev, logo: newLogoUrl } : null));
          form.setValue("logo", newLogoUrl);

          payload.logo = newLogoUrl;
          hasMeaningfulChanges = true;
        }
      } else if (
        form.formState.dirtyFields.logo &&
        validatedValues.logo === "" &&
        business.logo &&
        typeof business.logo === "string" &&
        business.logo.trim() !== ""
      ) {
        // Delete logo (clearing it)
        console.log("Client: Deleting cleared logo:", business.logo);
        try {
          await deleteFileFromBucket(business.logo);
          console.log("Client: Logo deleted successfully");
        } catch (deleteError) {
          console.warn("Could not delete logo:", deleteError);
        }

        // Update local state
        setBusiness((prev) => (prev ? { ...prev, logo: "" } : null));
        form.setValue("logo", "");

        payload.logo = "";
        hasMeaningfulChanges = true;
      }

      // 2. Handle other fields (EXCLUDING logo field entirely)
      for (const key of Object.keys(validatedValues) as Array<
        keyof CompanyFormData
      >) {
        const typedKey = key as keyof CompanyFormData;

        // SKIP logo field completely - we handled it above
        if (typedKey === "logo") {
          continue;
        }

        const originalValue = business[typedKey as keyof BusinessType];
        if (
          form.formState.dirtyFields[typedKey] &&
          validatedValues[typedKey] !== originalValue
        ) {
          if (typedKey === "vat") {
            const raw = validatedValues.vat;
            const normalized =
              raw === null || raw === undefined
                ? undefined
                : typeof raw === "string"
                  ? raw.trim()
                  : String(raw).trim();
            payload.vat =
              normalized && normalized.length ? normalized : undefined;
          } else {
            // @ts-ignore
            payload[typedKey] = validatedValues[typedKey];
          }
          hasMeaningfulChanges = true;
        }
      }

      // 3. Update database only if there are meaningful changes
      if (hasMeaningfulChanges) {
        console.log("Client: Payload being sent to updateBusiness:", payload);
        const updated = await updateBusiness(business.id, payload);

        if (!updated) {
          setError(
            "Failed to update business. The server did not confirm the update."
          );
          return;
        }
        console.log("Business updated successfully!", updated);
      } else {
        console.log("No meaningful database changes detected.");
      }

      // 4. Reset the file input since we've processed it
      setNewLogoFile(null);

      // 5. Show success and close
      setShowSuccessOverlay(true);
      setTimeout(() => {
        setShowSuccessOverlay(false);
        if (closeModal) closeModal();
        router.refresh();
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`An error occurred: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccessOverlay) {
    return (
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-opacity duration-300 ease-in-out">
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-md p-6 sm:p-10 rounded-xl shadow-2xl text-center transform transition-all duration-300 ease-in-out scale-100 opacity-100 flex flex-col items-center">
          <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-600 mx-auto mb-5" />
          <p className="text-xl sm:text-2xl font-semibold text-slate-700">
            Updated Successfully!
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-secondary-text dark:text-slate-400">
          Loading business data...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 my-4 text-center text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg min-h-[200px] flex flex-col justify-center items-center">
        <p className="font-semibold text-lg">Update Error</p>
        <p className="text-sm mt-1 mb-3">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Acknowledge
        </button>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-slate-400 min-h-[200px] flex items-center justify-center">
        No business data available for update.
      </div>
    );
  }

  return (
    <BusinessForm
      form={form}
      onSubmit={handleUpdateSubmit}
      submitButtonText="Update Business"
      onFileChange={setNewLogoFile}
      existingLogoUrl={business.logo}
      isSubmitting={isSubmitting}
      onCancel={closeModal}
      mode={business.profile_type || "company"}
    />
  );
};
