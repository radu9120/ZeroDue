import { describe, it, expect } from "vitest";

describe("Date Utilities", () => {
  describe("Date Formatting", () => {
    it("should format date to ISO string", () => {
      const date = new Date("2026-01-15");
      const isoString = date.toISOString();

      expect(isoString).toContain("2026-01-15");
    });

    it("should format date to readable string", () => {
      const date = new Date("2026-01-15");
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const formatted = date.toLocaleDateString("en-US", options);

      expect(formatted).toContain("January");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2026");
    });
  });

  describe("Due Date Calculations", () => {
    it("should calculate due date from today", () => {
      const today = new Date("2026-01-01");
      const daysToAdd = 30;
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      expect(dueDate.getDate()).toBe(31);
      expect(dueDate.getMonth()).toBe(0); // January
    });

    it("should check if invoice is overdue", () => {
      const dueDate = new Date("2026-01-01");
      const today = new Date("2026-01-15");

      const isOverdue = today > dueDate;

      expect(isOverdue).toBe(true);
    });

    it("should check if invoice is due soon", () => {
      const dueDate = new Date("2026-01-10");
      const today = new Date("2026-01-08");
      const daysDifference = Math.floor(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const isDueSoon = daysDifference <= 3 && daysDifference > 0;

      expect(isDueSoon).toBe(true);
      expect(daysDifference).toBe(2);
    });
  });
});

describe("Currency Utilities", () => {
  describe("Currency Formatting", () => {
    it("should format amount in USD", () => {
      const amount = 1234.56;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      expect(formatted).toBe("$1,234.56");
    });

    it("should format amount in GBP", () => {
      const amount = 1234.56;
      const formatted = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(amount);

      expect(formatted).toBe("£1,234.56");
    });

    it("should format amount in EUR", () => {
      const amount = 1234.56;
      const formatted = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(amount);

      expect(formatted).toContain("1.234,56");
      expect(formatted).toContain("€");
    });
  });

  describe("Currency Conversion", () => {
    it("should convert cents to dollars", () => {
      const cents = 12345;
      const dollars = cents / 100;

      expect(dollars).toBe(123.45);
    });

    it("should convert dollars to cents", () => {
      const dollars = 123.45;
      const cents = Math.round(dollars * 100);

      expect(cents).toBe(12345);
    });

    it("should handle rounding correctly", () => {
      const amount = 123.456;
      const rounded = Math.round(amount * 100) / 100;

      expect(rounded).toBe(123.46);
    });
  });
});

describe("Tax Calculations", () => {
  it("should calculate VAT at 20%", () => {
    const subtotal = 1000;
    const vatRate = 0.2;
    const vat = subtotal * vatRate;
    const total = subtotal + vat;

    expect(vat).toBe(200);
    expect(total).toBe(1200);
  });

  it("should calculate sales tax at 8.5%", () => {
    const subtotal = 500;
    const taxRate = 0.085;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    expect(tax).toBe(42.5);
    expect(total).toBe(542.5);
  });

  it("should calculate reverse VAT", () => {
    const totalWithVat = 1200;
    const vatRate = 0.2;
    const subtotal = totalWithVat / (1 + vatRate);
    const vat = totalWithVat - subtotal;

    expect(subtotal).toBe(1000);
    expect(vat).toBe(200);
  });
});

describe("Discount Calculations", () => {
  it("should apply percentage discount", () => {
    const subtotal = 1000;
    const discountPercent = 10;
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discountAmount;

    expect(discountAmount).toBe(100);
    expect(total).toBe(900);
  });

  it("should apply fixed amount discount", () => {
    const subtotal = 1000;
    const discountAmount = 150;
    const total = subtotal - discountAmount;

    expect(total).toBe(850);
  });

  it("should not allow discount greater than subtotal", () => {
    const subtotal = 1000;
    const discountAmount = 1200;
    const total = Math.max(0, subtotal - discountAmount);

    expect(total).toBe(0);
  });
});

describe("Number Formatting", () => {
  it("should format number with commas", () => {
    const number = 1234567.89;
    const formatted = number.toLocaleString("en-US");

    expect(formatted).toBe("1,234,567.89");
  });

  it("should format percentage", () => {
    const value = 0.175;
    const percentage = (value * 100).toFixed(2) + "%";

    expect(percentage).toBe("17.50%");
  });

  it("should round to 2 decimal places", () => {
    const values = [123.456, 789.123, 456.789];
    const rounded = values.map((v) => Math.round(v * 100) / 100);

    expect(rounded).toEqual([123.46, 789.12, 456.79]);
  });
});
