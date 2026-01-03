import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listInvoices } from "@/app/api/invoices/list/route";
import { DELETE as deleteInvoice } from "@/app/api/invoices/[id]/route";

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/actions/invoice.actions", () => ({
  getInvoicesList: vi.fn(),
}));

vi.mock("@/lib/actions/userActivity.actions", () => ({
  createActivity: vi.fn(),
}));

describe("Invoice API Routes", () => {
  describe("GET /api/invoices/list", () => {
    it("should return 400 if business_id is missing", async () => {
      const request = new Request("http://localhost:3000/api/invoices/list");
      const response = await listInvoices(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing business_id");
    });

    it("should return 400 if business_id is invalid", async () => {
      const request = new Request(
        "http://localhost:3000/api/invoices/list?business_id=invalid"
      );
      const response = await listInvoices(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing business_id");
    });

    it("should return invoices list with valid business_id", async () => {
      const { getInvoicesList } = await import(
        "@/lib/actions/invoice.actions"
      );
      const mockInvoices = [
        { id: 1, invoice_number: "INV-001", total: 1000 },
        { id: 2, invoice_number: "INV-002", total: 2000 },
      ];

      vi.mocked(getInvoicesList).mockResolvedValue(mockInvoices as any);

      const request = new Request(
        "http://localhost:3000/api/invoices/list?business_id=1&page=1&limit=5"
      );
      const response = await listInvoices(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invoices).toEqual(mockInvoices);
      expect(getInvoicesList).toHaveBeenCalledWith({
        business_id: 1,
        page: 1,
        limit: 5,
        searchTerm: "",
        filter: "",
      });
    });

    it("should handle search and filter parameters", async () => {
      const { getInvoicesList } = await import(
        "@/lib/actions/invoice.actions"
      );
      vi.mocked(getInvoicesList).mockResolvedValue([] as any);

      const request = new Request(
        "http://localhost:3000/api/invoices/list?business_id=1&searchTerm=test&filter=paid"
      );
      await listInvoices(request);

      expect(getInvoicesList).toHaveBeenCalledWith({
        business_id: 1,
        page: 1,
        limit: 5,
        searchTerm: "test",
        filter: "paid",
      });
    });

    it("should return 500 on server error", async () => {
      const { getInvoicesList } = await import(
        "@/lib/actions/invoice.actions"
      );
      vi.mocked(getInvoicesList).mockRejectedValue(
        new Error("Database error")
      );

      const request = new Request(
        "http://localhost:3000/api/invoices/list?business_id=1"
      );
      const response = await listInvoices(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to load invoices");
    });
  });

  describe("DELETE /api/invoices/[id]", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should return 401 if user is not authenticated", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const request = new Request(
        "http://localhost:3000/api/invoices/1",
        { method: "DELETE" }
      );
      const response = await deleteInvoice(request, {
        params: Promise.resolve({ id: "1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 for invalid invoice id", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);

      const request = new Request(
        "http://localhost:3000/api/invoices/invalid",
        { method: "DELETE" }
      );
      const response = await deleteInvoice(request, {
        params: Promise.resolve({ id: "invalid" }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid invoice id");
    });

    it("should return 404 if invoice not found", async () => {
      const { auth } = await import("@/lib/auth");
      const { createClient } = await import("@/lib/supabase/server");

      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found" },
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new Request(
        "http://localhost:3000/api/invoices/999",
        { method: "DELETE" }
      );
      const response = await deleteInvoice(request, {
        params: Promise.resolve({ id: "999" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Invoice not found");
    });

    it("should return 403 if user does not own the invoice", async () => {
      const { auth } = await import("@/lib/auth");
      const { createClient } = await import("@/lib/supabase/server");

      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  author: "differentUser",
                  invoice_number: "INV-001",
                  business_id: 1,
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new Request(
        "http://localhost:3000/api/invoices/1",
        { method: "DELETE" }
      );
      const response = await deleteInvoice(request, {
        params: Promise.resolve({ id: "1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });

    it("should successfully delete invoice", async () => {
      const { auth } = await import("@/lib/auth");
      const { createClient } = await import("@/lib/supabase/server");
      const { createActivity } = await import(
        "@/lib/actions/userActivity.actions"
      );

      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);
      vi.mocked(createActivity).mockResolvedValue(undefined);

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "Invoices") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      author: "user123",
                      invoice_number: "INV-001",
                      business_id: 1,
                    },
                    error: null,
                  }),
                }),
              }),
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            };
          }
          return {};
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new Request(
        "http://localhost:3000/api/invoices/1",
        { method: "DELETE" }
      );
      const response = await deleteInvoice(request, {
        params: Promise.resolve({ id: "1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(createActivity).toHaveBeenCalledWith({
        user_id: "user123",
        business_id: 1,
        action: "Deleted invoice",
        target_type: "invoice",
        target_name: "INV-001",
      });
    });
  });
});
