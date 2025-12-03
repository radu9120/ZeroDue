import { describe, it, expect } from "vitest";
import {
  billToSchema,
  companySchema,
  formSchema,
} from "@/schemas/invoiceSchema";

describe("Invoice Schema Validation", () => {
  describe("billToSchema (Client)", () => {
    it("should validate a valid client", () => {
      const validClient = {
        name: "John Doe",
        email: "john@example.com",
        address: "123 Main St",
        phone: "+1234567890",
        business_id: 1,
      };
      const result = billToSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidClient = {
        name: "John Doe",
        email: "invalid-email",
        address: "123 Main St",
        business_id: 1,
      };
      const result = billToSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it("should reject name too short", () => {
      const invalidClient = {
        name: "Jo",
        email: "john@example.com",
        address: "123 Main St",
        business_id: 1,
      };
      const result = billToSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it("should handle NaN client_id gracefully", () => {
      const clientWithNaN = {
        id: undefined,
        name: "John Doe",
        email: "john@example.com",
        address: "123 Main St",
        business_id: 1,
      };
      const result = billToSchema.safeParse(clientWithNaN);
      expect(result.success).toBe(true);
    });
  });

  describe("companySchema (Business)", () => {
    it("should validate a valid company", () => {
      const validCompany = {
        name: "Acme Corp",
        email: "info@acme.com",
        address: "456 Business Ave",
        currency: "USD",
        profile_type: "company",
      };
      const result = companySchema.safeParse(validCompany);
      expect(result.success).toBe(true);
    });

    it("should reject invalid currency code", () => {
      const invalidCompany = {
        name: "Acme Corp",
        email: "info@acme.com",
        address: "456 Business Ave",
        currency: "INVALID",
        profile_type: "company",
      };
      const result = companySchema.safeParse(invalidCompany);
      expect(result.success).toBe(false);
    });

    it("should normalize currency to uppercase", () => {
      const company = {
        name: "Acme Corp",
        email: "info@acme.com",
        address: "456 Business Ave",
        currency: "usd",
        profile_type: "company",
      };
      const result = companySchema.safeParse(company);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("USD");
      }
    });
  });

  describe("formSchema (Invoice)", () => {
    const validInvoice = {
      invoice_number: "INV001",
      company_details: {
        name: "Acme Corp",
        email: "info@acme.com",
        address: "456 Business Ave",
        currency: "USD",
        profile_type: "company" as const,
      },
      bill_to: {
        name: "John Doe",
        email: "john@example.com",
        address: "123 Main St",
        business_id: 1,
      },
      issue_date: new Date(),
      due_date: new Date(),
      items: [
        {
          description: "Web Development",
          unit_price: 100,
          quantity: 10,
          amount: 1000,
        },
      ],
      subtotal: 1000,
      discount: 0,
      shipping: 0,
      total: 1000,
      currency: "USD",
      client_id: 1,
      business_id: 1,
    };

    it("should validate a valid invoice", () => {
      const result = formSchema.safeParse(validInvoice);
      expect(result.success).toBe(true);
    });

    it("should reject missing client_id", () => {
      const invalidInvoice = { ...validInvoice, client_id: undefined };
      const result = formSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });

    it("should reject empty client_id string", () => {
      const invalidInvoice = { ...validInvoice, client_id: "" };
      const result = formSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });

    it("should reject negative total", () => {
      const invalidInvoice = { ...validInvoice, total: -100 };
      const result = formSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });
  });
});
