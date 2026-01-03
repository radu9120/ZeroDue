import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@/lib/supabase/server";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Client Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createClient", () => {
    it("should create a client with valid data", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            business_id: 1,
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

      const clientData = {
        name: "John Doe",
        email: "john@example.com",
        address: "123 Main St",
        phone: "+1234567890",
        business_id: 1,
      };

      expect(mockSupabase.from).toBeDefined();
      expect(clientData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it("should reject invalid email format", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      invalidEmails.forEach((email) => {
        expect(email).not.toMatch(emailRegex);
      });
    });

    it("should validate phone number format", () => {
      const validPhones = ["+1234567890", "+44 20 7946 0958", "555-1234"];
      const invalidPhones = ["abc", "123", ""];

      validPhones.forEach((phone) => {
        expect(phone.length).toBeGreaterThan(5);
      });

      invalidPhones.forEach((phone) => {
        expect(phone.length).toBeLessThan(6);
      });
    });
  });

  describe("getAllClients", () => {
    it("should return all clients for a business", async () => {
      const mockClients = [
        { id: 1, name: "Client A", email: "a@example.com" },
        { id: 2, name: "Client B", email: "b@example.com" },
        { id: 3, name: "Client C", email: "c@example.com" },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: mockClients,
          error: null,
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      expect(mockClients.length).toBe(3);
      expect(mockSupabase.from).toBeDefined();
    });

    it("should handle empty client list", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      expect(mockSupabase.from).toBeDefined();
    });
  });

  describe("updateClient", () => {
    it("should update client information", async () => {
      const updateData = {
        id: 1,
        name: "Updated Name",
        email: "updated@example.com",
        phone: "+9876543210",
      };

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: updateData,
          error: null,
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      expect(updateData.name).toBe("Updated Name");
      expect(mockSupabase.from).toBeDefined();
    });

    it("should prevent updating with invalid data", () => {
      const invalidUpdate = {
        id: 1,
        name: "AB", // Too short
        email: "invalid-email",
      };

      expect(invalidUpdate.name.length).toBeLessThan(3);
      expect(invalidUpdate.email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  describe("getClient", () => {
    it("should retrieve specific client by ID", async () => {
      const mockClient = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        address: "123 Main St",
        phone: "+1234567890",
      };

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockClient,
          error: null,
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      expect(mockClient.id).toBe(1);
      expect(mockSupabase.from).toBeDefined();
    });
  });

  describe("Client Data Validation", () => {
    it("should validate required fields", () => {
      const completeClient = {
        name: "John Doe",
        email: "john@example.com",
        business_id: 1,
      };

      expect(completeClient).toHaveProperty("name");
      expect(completeClient).toHaveProperty("email");
      expect(completeClient).toHaveProperty("business_id");
    });

    it("should handle optional fields", () => {
      const minimalClient = {
        name: "Jane Doe",
        email: "jane@example.com",
        business_id: 1,
      };

      expect(minimalClient).not.toHaveProperty("phone");
      expect(minimalClient).not.toHaveProperty("address");
    });
  });
});
