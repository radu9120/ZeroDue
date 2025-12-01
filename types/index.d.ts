interface Company {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  vat?: number;
  logo?: string;
  created_at: string;
  author: string;
}

interface DashboardBusinessStats {
  id: number;
  name: string;
  totalinvoices: number;
  totalrevenue: number;
  totalclients: number;
  created_on: string;
  profile_type?: "company" | "freelancer" | "exploring";
  logo?: string | null;
}

interface GetAllClientsParams {
  limit?: number;
  page?: number;
  searchTerm?: string;
  business_id: number;
}

interface GetClientParam {
  client_id: number;
}

interface SearchParams {
  business_id: number;
  searchTerm?: string;
  client_id?: string | number;
}

interface ClientType {
  id: number;
  name: string;
  email: string;
  address: string;
  phone?: string;
  business_id: number;
  logo_url?: string | null;
  logo?: string | null;
  invoice_count?: number;
  invoice_total?: number;
  invoice_currency?: string | null;
}

interface BusinessType {
  id: number;
  name: string;
  email: string;
  address: string;
  phone?: string;
  vat?: string | null;
  tax_label?: string;
  logo?: url | "";
  currency?: string | null;
  profile_type?: "company" | "freelancer" | "exploring";
  extra_invoice_credits?: number;
}

interface NewInvoicePageProps {
  //modified this to silence an error about searchParams being a Promise
  searchParams: Promise<{
    business_id?: string;
    client_id?: string;
    from?: string;
  }>;
}

interface BusinessStatistics {
  statistic: {
    total_invoices: number;
    total_paid_amount: string;
    total_overdue_invoices: number;
    total_clients: number;
    total_paid_invoices: number;
    total_pending_invoices: number;
    total_paid_amount_current_month: string;
  };
}

interface BusinessDashboardPageProps {
  business_id: number;
  name?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
  filter?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  tax: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  bill_to: ClientType;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  createdDate: string;
  description: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  notes: string;
}

export interface InvoiceListItem {
  id: number;
  items: any[] | string | object;
  bill_to: any;
  company_details: any;
  invoice_number: string;
  description?: string;
  issue_date?: string;
  due_date: string;
  status: string;
  currency?: string;
  subtotal?: number;
  discount?: number;
  shipping?: number;
  total: string;
  notes?: string;
  bank_details?: string;
  public_token?: string;
  // Email tracking (optional fields; may be null if not sent yet)
  email_id?: string | null;
  email_sent_at?: string | null;
  email_delivered?: boolean | null;
  email_delivered_at?: string | null;
  email_opened?: boolean | null;
  email_opened_at?: string | null;
  email_open_count?: number | null;
  email_clicked?: boolean | null;
  email_clicked_at?: string | null;
  email_click_count?: number | null;
  email_bounced?: boolean | null;
  email_bounced_at?: string | null;
  email_complained?: boolean | null;
  email_complained_at?: string | null;
  invoice_template?: string;
}

interface UserActivityLog {
  user_id: string;
  business_id?: number;
  action:
    | "Created invoice"
    | "Updated invoice content"
    | "Updated invoice status"
    | "Deleted invoice"
    | "Sent invoice"
    | "Invoice email delivered"
    | "Invoice email opened"
    | "Invoice email clicked"
    | "Invoice email bounced"
    | "Invoice email marked as spam"
    | "Created Business instance"
    | "Updated business details"
    | "Created Client instance"
    | "Updated Client instance"
    | "Created estimate"
    | "Sent estimate"
    | "Estimate accepted"
    | "Estimate rejected"
    | "Converted estimate to invoice"
    | "Created recurring invoice"
    | "Paused recurring invoice"
    | "Generated recurring invoice"
    | "Created expense"
    | "Recorded payment";
  target_type:
    | "invoice"
    | "business"
    | "client"
    | "estimate"
    | "recurring"
    | "expense"
    | "payment";
  target_name?: string;
  target_id?: string; // This should match your database column
  metadata?: { from?: string; to?: string; email_id?: string; link?: string };
  created_at?: string;
}

// ============ RECURRING INVOICES ============
export interface RecurringInvoice {
  id: number;
  business_id: number;
  client_id: number;
  author: string;
  invoice_template?: string;
  description?: string;
  items: any[];
  notes?: string;
  bank_details?: string;
  currency: string;
  discount?: number;
  shipping?: number;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
  start_date: string;
  end_date?: string;
  next_invoice_date: string;
  day_of_month?: number;
  day_of_week?: number;
  payment_terms: number;
  auto_send: boolean;
  status: "active" | "paused" | "completed" | "cancelled";
  invoices_generated: number;
  last_invoice_id?: number;
  last_generated_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: ClientType;
  business?: BusinessType;
}

// ============ ESTIMATES/QUOTES ============
export interface Estimate {
  id: number;
  business_id: number;
  client_id: number;
  author: string;
  estimate_number: string;
  description?: string;
  items: any[];
  notes?: string;
  currency: string;
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
  issue_date: string;
  valid_until?: string;
  status:
    | "draft"
    | "sent"
    | "viewed"
    | "accepted"
    | "rejected"
    | "expired"
    | "converted";
  converted_to_invoice_id?: number;
  converted_at?: string;
  client_response_at?: string;
  client_notes?: string;
  public_token?: string;
  email_id?: string;
  email_sent_at?: string;
  email_opened?: boolean;
  email_opened_at?: string;
  estimate_template?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: ClientType;
  business?: BusinessType;
}

// ============ EXPENSES ============
export interface Expense {
  id: number;
  business_id: number;
  author: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  expense_date: string;
  vendor?: string;
  receipt_url?: string;
  receipt_filename?: string;
  client_id?: number;
  invoice_id?: number;
  project_name?: string;
  is_billable: boolean;
  is_billed: boolean;
  tax_amount?: number;
  tax_rate?: number;
  is_tax_deductible: boolean;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: ClientType;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  is_default: boolean;
}

// ============ INVOICE PAYMENTS ============
export interface InvoicePayment {
  id: number;
  invoice_id: number;
  business_id: number;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: string;
  transaction_id?: string;
  reference_number?: string;
  notes?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  created_at: string;
  created_by: string;
}

// ============ PAYMENT REMINDERS ============
export interface PaymentReminder {
  id: number;
  invoice_id: number;
  business_id: number;
  reminder_type: "before_due" | "on_due" | "after_due" | "custom";
  days_offset: number;
  scheduled_date: string;
  status: "pending" | "sent" | "cancelled" | "skipped";
  sent_at?: string;
  email_id?: string;
  email_opened?: boolean;
  email_opened_at?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

export interface ReminderSettings {
  id: number;
  business_id: number;
  reminders_enabled: boolean;
  remind_before_days: number[];
  remind_on_due: boolean;
  remind_after_days: number[];
  before_due_subject?: string;
  before_due_message?: string;
  on_due_subject?: string;
  on_due_message?: string;
  after_due_subject?: string;
  after_due_message?: string;
  max_reminders_per_invoice: number;
  stop_on_payment: boolean;
  created_at: string;
  updated_at: string;
}

interface GetBusinessActivityProps {
  business_id: number;
  limit?: number;
}
