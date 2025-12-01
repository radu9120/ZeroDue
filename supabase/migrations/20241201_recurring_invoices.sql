-- Create RecurringInvoices table for automatic invoice generation
CREATE TABLE IF NOT EXISTS "RecurringInvoices" (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES "Businesses"(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES "Clients"(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  
  -- Invoice template data
  invoice_template TEXT,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  bank_details TEXT,
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  discount DECIMAL(5,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  
  -- Recurrence settings
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE, -- NULL means forever
  next_invoice_date DATE NOT NULL,
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31), -- For monthly: which day
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- For weekly: 0=Sunday
  
  -- Payment terms
  payment_terms INTEGER NOT NULL DEFAULT 30, -- Days until due
  auto_send BOOLEAN DEFAULT false, -- Auto-send when generated
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  invoices_generated INTEGER DEFAULT 0,
  last_invoice_id INTEGER REFERENCES "Invoices"(id),
  last_generated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding due recurring invoices
CREATE INDEX idx_recurring_next_date ON "RecurringInvoices"(next_invoice_date) WHERE status = 'active';
CREATE INDEX idx_recurring_business ON "RecurringInvoices"(business_id);

COMMENT ON TABLE "RecurringInvoices" IS 'Stores recurring invoice templates that auto-generate invoices on schedule';
