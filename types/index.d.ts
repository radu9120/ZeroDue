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
}

interface BusinessType {
  id: number;
  name: string;
  email: string;
  address: string;
  phone?: string;
  vat?: number;
  logo?: url | "";
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
}

interface UserActivityLog {
  user_id: string;
  business_id?: number;
  action:
    | "Created invoice"
    | "Updated invoice content"
    | "Updated invoice status"
    | "Sent invoice"
    | "Invoice email delivered"
    | "Invoice email opened"
    | "Invoice email clicked"
    | "Invoice email bounced"
    | "Invoice email marked as spam"
    | "Created Business instance"
    | "Updated business details"
    | "Created Client instance"
    | "Updated Client instance";
  target_type: "invoice" | "business" | "client";
  target_name?: string;
  target_id?: string; // This should match your database column
  metadata?: { from?: string; to?: string; email_id?: string; link?: string };
  created_at?: string;
}

interface GetBusinessActivityProps {
  business_id: number;
  limit?: number;
}
