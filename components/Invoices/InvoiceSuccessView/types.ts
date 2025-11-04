export interface InvoiceItemRow {
  description?: string;
  quantity?: number;
  unit_price?: number;
  tax?: number;
  amount?: number;
  [key: string]: unknown;
}

export type BankDetailsDisplay =
  | { type: "empty" }
  | { type: "text"; text: string }
  | { type: "list"; entries: { label: string; value: string }[] };

export interface ParsedBillTo {
  name?: string;
  address?: string;
  email?: string;
  [key: string]: unknown;
}

export interface EmailStatusTimelineEntry {
  label: string;
  value: string | null;
}
