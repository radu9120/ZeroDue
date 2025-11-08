import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const phoneType = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || /^\+?[0-9\s-]{7,15}$/.test(val), {
    message: "Invalid phone number",
  });

const itemSchema = z.object({
  description: z.string().min(1, { message: "Item description is required" }),
  unit_price: z.coerce
    .number()
    .min(1, { message: "Price per unit is required" }),
  quantity: z.coerce.number().min(1, { message: "Quantity is required" }),
  tax: z.coerce.number().optional(),
  amount: z.coerce.number().min(1, { message: "Ammount is required" }),
});

export const billToSchema = z.object({
  id: z.coerce.number().optional(),
  name: z
    .string()
    .min(3, { message: "Name must be between 3 and 100 characters" })
    .max(100, { message: "Name must be between 3 and 100 characters" }),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
  address: z.string().min(1, { message: "Address is required" }),
  phone: phoneType,
  business_id: z.coerce.number().min(1, { message: "Business is required" }),
});

export type CreateClient = z.infer<typeof billToSchema>;

export const companySchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be between 3 and 100 characters" })
    .max(100, { message: "Name must be between 3 and 100 characters" }),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
  address: z.string().min(1, { message: "Quantity is required" }),
  phone: phoneType,
  vat: z.coerce.number().optional(),
  tax_label: z.string().optional(),
  currency: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .refine((val) => /^[A-Z]{3}$/.test(val), {
      message: "Currency must be a 3-letter ISO code",
    }),
  profile_type: z.enum(["company", "freelancer", "exploring"], {
    errorMap: () => ({ message: "Select a valid profile type" }),
  }),
  logo: z.string().optional() || undefined,
});

export type CreateBusiness = z.infer<typeof companySchema>;

export const formSchema = z.object({
  invoice_number: z.string().min(1, { message: "Invoice number is required." }),
  description: z
    .string()
    .min(1, { message: "Invoice description is required." }),
  company_details: companySchema,
  bill_to: billToSchema,
  issue_date: z.coerce.date({ required_error: "Invoice date is required." }),
  due_date: z.coerce.date({ required_error: "Due date is required." }),
  items: z.array(itemSchema).min(1, { message: "Min 1 item is required." }),
  subtotal: z.coerce.number(),
  discount: z.coerce.number().optional(),
  shipping: z.coerce.number().optional(),
  total: z.coerce.number(),
  notes: z.string().optional(),
  bank_details: z.string().optional(),
  currency: z.string().min(1, { message: "Logo is required." }),
  client_id: z.number(),
  business_id: z.number(),
});

export type CreateInvoice = z.infer<typeof formSchema>;
