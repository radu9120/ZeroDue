import { describe, it, expect, vi } from "vitest";
import { GET as whoami } from "@/app/api/whoami/route";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

describe("Authentication API Routes", () => {
  describe("GET /api/whoami", () => {
    it("should return 401 if user is not authenticated", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const response = await whoami();
      expect(response.status).toBe(401);
      
      const text = await response.text();
      expect(text).toBe("Unauthorized");
    });

    it("should return user id if authenticated", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any);

      const response = await whoami();
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({ userId: "user-123" });
    });

    it("should handle different user ids", async () => {
      const { auth } = await import("@/lib/auth");
      
      // Test with different user ID
      vi.mocked(auth).mockResolvedValue({ userId: "different-user-456" } as any);
      const response = await whoami();
      const data = await response.json();
      
      expect(data.userId).toBe("different-user-456");
    });
  });
});
