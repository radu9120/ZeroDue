-- Create Expenses table for expense tracking
CREATE TABLE IF NOT EXISTS "Expenses" (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES "Businesses"(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  
  -- Expense details
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  
  -- Categorization
  category VARCHAR(50) NOT NULL DEFAULT 'other',
  -- Categories: travel, meals, office, software, equipment, marketing, utilities, rent, insurance, professional_services, other
  
  -- Date and vendor
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor TEXT, -- Who was paid
  
  -- Receipt
  receipt_url TEXT, -- URL to uploaded receipt image
  receipt_filename TEXT,
  
  -- Optional linking
  client_id INTEGER REFERENCES "Clients"(id) ON DELETE SET NULL,
  invoice_id INTEGER REFERENCES "Invoices"(id) ON DELETE SET NULL, -- If billable to client
  project_name TEXT, -- Optional project reference
  
  -- Billing
  is_billable BOOLEAN DEFAULT false,
  is_billed BOOLEAN DEFAULT false, -- Has been added to an invoice
  
  -- Tax
  tax_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  is_tax_deductible BOOLEAN DEFAULT true,
  
  -- Payment info
  payment_method VARCHAR(30), -- cash, card, bank_transfer, etc.
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_expenses_business ON "Expenses"(business_id);
CREATE INDEX idx_expenses_date ON "Expenses"(expense_date);
CREATE INDEX idx_expenses_category ON "Expenses"(category);
CREATE INDEX idx_expenses_client ON "Expenses"(client_id) WHERE client_id IS NOT NULL;

-- Create ExpenseCategories reference table
CREATE TABLE IF NOT EXISTS "ExpenseCategories" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_default BOOLEAN DEFAULT false
);

-- Insert default categories
INSERT INTO "ExpenseCategories" (name, icon, color, is_default) VALUES
  ('travel', 'plane', 'blue', true),
  ('meals', 'utensils', 'orange', true),
  ('office', 'briefcase', 'gray', true),
  ('software', 'laptop', 'purple', true),
  ('equipment', 'wrench', 'slate', true),
  ('marketing', 'megaphone', 'pink', true),
  ('utilities', 'zap', 'yellow', true),
  ('rent', 'home', 'green', true),
  ('insurance', 'shield', 'cyan', true),
  ('professional_services', 'users', 'indigo', true),
  ('other', 'folder', 'gray', true)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE "Expenses" IS 'Tracks business expenses for profit/loss calculation';
