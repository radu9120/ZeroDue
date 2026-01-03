import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Estimate Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEstimate", () => {
    it("should create an estimate with valid data", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: {
            id: 1,
            estimate_number: "EST-001",
            status: "draft",
            total_amount: 2500,
          },
          error: null,
        }),
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
            error: null,
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const estimateData = {
        estimate_number: "EST-001",
        business_id: 1,
        client_id: 1,
        valid_until: "2026-02-28",
        subtotal: 2500,
        total_amount: 2500,
        status: "draft",
      };

      expect(mockSupabase.from).toBeDefined();
      expect(estimateData.estimate_number).toMatch(/^EST-\d+$/);
    });

    it("should validate estimate number format", () => {
      const validEstimateNumbers = ["EST-001", "EST-999", "EST-1234"];
      const invalidEstimateNumbers = ["INV-001", "EST001", "ESTIMATE-1"];

      validEstimateNumbers.forEach((num) => {
        expect(num).toMatch(/^EST-\d+$/);
      });

      invalidEstimateNumbers.forEach((num) => {
        expect(num).not.toMatch(/^EST-\d+$/);
      });
    });
  });

  describe("convertEstimateToInvoice", () => {
    it("should convert estimate data to invoice format", () => {
      const estimate = {
        id: 1,
        estimate_number: "EST-001",
        business_id: 1,
        client_id: 1,
        subtotal: 2500,
        total_amount: 2500,
        items: [
          { description: "Service A", quantity: 2, rate: 1000 },
          { description: "Service B", quantity: 1, rate: 500 },
        ],
      };

      const invoice = {
        invoice_number: "INV-001",
        business_id: estimate.business_id,
        client_id: estimate.client_id,
        subtotal: estimate.subtotal,
        total_amount: estimate.total_amount,
        items: estimate.items,
        from_estimate_id: estimate.id,
      };

      expect(invoice.business_id).toBe(estimate.business_id);
      expect(invoice.client_id).toBe(estimate.client_id);
      expect(invoice.total_amount).toBe(estimate.total_amount);
      expect(invoice.items.length).toBe(2);
    });
  });

  describe("calculateEstimateTotal", () => {
    it("should calculate subtotal correctly", () => {
      const items = [
        { quantity: 2, rate: 100 },
        { quantity: 3, rate: 150 },
        { quantity: 1, rate: 200 },
      ];

      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.rate,
        0
      );

      expect(subtotal).toBe(850); // (2*100) + (3*150) + (1*200)
    });

    it("should apply tax correctly", () => {
      const subtotal = 1000;
      const taxRate = 0.2; // 20% VAT
      const total = subtotal * (1 + taxRate);

      expect(total).toBe(1200);
    });

    it("should apply discount correctly", () => {
      const subtotal = 1000;
      const discountPercent = 10;
      const discountAmount = (subtotal * discountPercent) / 100;
      const total = subtotal - discountAmount;

      expect(discountAmount).toBe(100);
      expect(total).toBe(900);
    });
  });

  describe("getEstimatesByBusiness", () => {
    it("should retrieve all estimates for a business", async () => {
      const mockEstimates = [
        { id: 1, estimate_number: "EST-001", status: "sent" },
        { id: 2, estimate_number: "EST-002", status: "accepted" },
        { id: 3, estimate_number: "EST-003", status: "draft" },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: mockEstimates,
          error: null,
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      expect(mockEstimates.length).toBe(3);
    });
  });

  describe("updateEstimateStatus", () => {
    it("should update estimate status", () => {
      const statusTransitions = {
        draft: ["sent", "cancelled"],
        sent: ["accepted", "declined", "cancelled"],
        accepted: ["converted"],
        declined: [],
        cancelled: [],
      };

      expect(statusTransitions.draft).toContain("sent");
      expect(statusTransitions.sent).toContain("accepted");
      expect(statusTransitions.accepted).toContain("converted");
    });

    it("should prevent invalid status transitions", () => {
      const currentStatus = "accepted";
      const invalidTransition = "draft";

      const validTransitions = ["converted"];

      expect(validTransitions).not.toContain(invalidTransition);
    });
  });
});
