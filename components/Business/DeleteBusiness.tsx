"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { deleteBusiness } from "@/lib/actions/business.actions";
import { Button } from "@/components/ui/button";

interface DeleteBusinessProps {
  businessId: number;
  businessName?: string | null;
  closeModal?: () => void;
}

export default function DeleteBusiness({
  businessId,
  businessName,
  closeModal,
}: DeleteBusinessProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resolvedName = useMemo(() => {
    if (typeof businessName === "string" && businessName.trim().length > 0) {
      return businessName.trim();
    }
    return "this business";
  }, [businessName]);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteBusiness(businessId);
      if (!result.ok) {
        setError(result.error || "Failed to delete business. Try again.");
        return;
      }

      if (typeof window !== "undefined") {
        try {
          const activeId = window.localStorage.getItem("activeBusinessId");
          if (activeId === String(businessId)) {
            window.localStorage.removeItem("activeBusinessId");
            window.localStorage.removeItem("activeBusinessName");
          }
        } catch (_) {
          // ignore storage failures
        }
      }

      closeModal?.();
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Permanently delete {resolvedName}
        </p>
        <p className="mt-2 leading-relaxed">
          This action will remove the business, its invoices, clients, and
          activity history. Deleted data cannot be recovered.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3 gap-3">
        <Button
          variant="secondary"
          onClick={closeModal}
          disabled={isPending}
          className="sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isPending}
          className="bg-red-600 hover:bg-red-700 text-white sm:w-auto"
        >
          <span className="flex items-center gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isPending ? "Deleting..." : "Delete business"}
          </span>
        </Button>
      </div>
    </div>
  );
}
