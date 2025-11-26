"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import React from "react";
import { Textarea } from "../ui/textarea";
import { Plus } from "lucide-react";
import { billToSchema } from "@/schemas/invoiceSchema";
import { createClient, updateClient } from "@/lib/actions/client.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ClientFormProps {
  business_id: number;
  defaultValues?: {
    id?: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    business_id: number;
  };
  onSubmit?: (values: z.infer<typeof billToSchema>) => Promise<void>;
  submitButtonText?: string;
  isSubmitting?: boolean;
  closeModal?: () => void; // injected by CustomModal
  redirectAfterSubmit?: string; // URL to redirect to after successful submit
}

export const ClientForm = ({
  business_id,
  defaultValues,
  onSubmit,
  submitButtonText = "Save Client",
  isSubmitting = false,
  closeModal,
  redirectAfterSubmit,
}: ClientFormProps) => {
  const router = useRouter();
  const [localSubmitting, setLocalSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof billToSchema>>({
    resolver: zodResolver(billToSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      address: "",
      phone: "",
      business_id: business_id,
    },
  });

  const pending = isSubmitting || localSubmitting;

  const handleSubmit = async (values: z.infer<typeof billToSchema>) => {
    try {
      if (onSubmit) {
        await onSubmit(values);
        toast.success("Client updated successfully");
        closeModal?.();
        if (redirectAfterSubmit) {
          router.push(redirectAfterSubmit);
        } else {
          router.refresh();
        }
        return;
      }

      setLocalSubmitting(true);

      // If we have an ID in defaultValues, it's an edit operation
      if (defaultValues?.id) {
        const dataToUpdate = { ...values, id: defaultValues.id };
        const updatedClient = await updateClient(dataToUpdate);
        if (updatedClient) {
          toast.success("Client updated successfully");
          closeModal?.();
          if (redirectAfterSubmit) {
            router.push(redirectAfterSubmit);
          } else {
            router.refresh();
          }
        } else {
          toast.error("Failed to update client");
        }
      } else {
        // Create new client
        const client = await createClient(values);
        if (client) {
          toast.success("Client added successfully");
          closeModal?.();
          if (redirectAfterSubmit) {
            router.push(redirectAfterSubmit);
          } else {
            router.refresh();
          }
        } else {
          toast.error("Failed to create client");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Error: ${message}`);
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full mt-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary-text dark:text-slate-300">
                  Company/Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Company/Name"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary-text dark:text-slate-300">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-secondary-text dark:text-slate-300">
                Phone
              </FormLabel>
              <FormControl>
                <Input placeholder="Phone" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-secondary-text dark:text-slate-300">
                Address
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Address"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="py-6">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="neutralOutline"
              className="flex-1"
              disabled={pending}
              onClick={() => {
                if (closeModal) {
                  closeModal();
                } else if (redirectAfterSubmit) {
                  router.push(redirectAfterSubmit);
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="neutral"
              className="flex-1"
              disabled={!form.formState.isValid || pending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {pending ? "Saving..." : submitButtonText}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
