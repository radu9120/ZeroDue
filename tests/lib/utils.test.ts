import { describe, it, expect } from "vitest";
import {
  cn,
  normalizeCurrencyCode,
  getCurrencySymbol,
  normalizePlan,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn (classnames merger)", () => {
    it("should merge class names", () => {
      const result = cn("px-4", "py-2", "bg-blue-500");
      expect(result).toContain("px-4");
      expect(result).toContain("py-2");
      expect(result).toContain("bg-blue-500");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toContain("active-class");
    });

    it("should merge conflicting tailwind classes", () => {
      const result = cn("px-4", "px-8");
      expect(result).toBe("px-8");
    });
  });

  describe("normalizeCurrencyCode", () => {
    it("should uppercase currency code", () => {
      expect(normalizeCurrencyCode("usd")).toBe("USD");
      expect(normalizeCurrencyCode("gbp")).toBe("GBP");
      expect(normalizeCurrencyCode("eur")).toBe("EUR");
    });

    it("should handle already uppercase", () => {
      expect(normalizeCurrencyCode("USD")).toBe("USD");
    });

    it("should handle mixed case", () => {
      expect(normalizeCurrencyCode("Usd")).toBe("USD");
    });

    it("should handle null/undefined with default", () => {
      expect(normalizeCurrencyCode(null)).toBe("GBP");
      expect(normalizeCurrencyCode(undefined)).toBe("GBP");
    });

    it("should handle currency aliases", () => {
      expect(normalizeCurrencyCode("BRITISH POUND")).toBe("GBP");
      expect(normalizeCurrencyCode("£")).toBe("GBP");
    });
  });

  describe("getCurrencySymbol", () => {
    it("should return £ for GBP", () => {
      expect(getCurrencySymbol("GBP")).toBe("£");
    });

    it("should return $ for USD", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
    });

    it("should return € for EUR", () => {
      expect(getCurrencySymbol("EUR")).toBe("€");
    });
  });

  describe("normalizePlan", () => {
    it("should return valid plan types unchanged", () => {
      expect(normalizePlan("free_user")).toBe("free_user");
      expect(normalizePlan("professional")).toBe("professional");
      expect(normalizePlan("enterprise")).toBe("enterprise");
    });

    it("should handle backward-compat mappings", () => {
      expect(normalizePlan("free")).toBe("free_user");
      expect(normalizePlan("pro")).toBe("professional");
    });

    it("should default to free_user for unknown values", () => {
      expect(normalizePlan("unknown")).toBe("free_user");
      expect(normalizePlan(null)).toBe("free_user");
      expect(normalizePlan(undefined)).toBe("free_user");
    });
  });
});
