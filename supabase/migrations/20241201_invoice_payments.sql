-- Add partial payment support to Invoices
ALTER TABLE "Invoices" 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_due DECIMAL(12,2) GENERATED ALWAYS AS (
  CASE 
    WHEN total IS NULL THEN 0
    WHEN amount_paid IS NULL THEN CAST(total AS DECIMAL(12,2))
    ELSE CAST(total AS DECIMAL(12,2)) - amount_paid
  END
) STORED,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overpaid', 'refunded'));

-- Create InvoicePayments table to track individual payments
CREATE TABLE IF NOT EXISTS "InvoicePayments" (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES "Invoices"(id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES "Businesses"(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Payment method
  payment_method VARCHAR(30) NOT NULL DEFAULT 'other',
  -- Methods: stripe, paypal, bank_transfer, cash, check, other
  
  -- Reference
  transaction_id TEXT, -- External payment reference
  notes TEXT,
  
  -- For Stripe payments
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Index for finding payments by invoice
CREATE INDEX idx_payments_invoice ON "InvoicePayments"(invoice_id);
CREATE INDEX idx_payments_business ON "InvoicePayments"(business_id);
CREATE INDEX idx_payments_date ON "InvoicePayments"(payment_date);

-- Function to update invoice payment totals
CREATE OR REPLACE FUNCTION update_invoice_payment_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the invoice's amount_paid
  UPDATE "Invoices"
  SET 
    amount_paid = COALESCE((
      SELECT SUM(amount) 
      FROM "InvoicePayments" 
      WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ), 0),
    payment_status = CASE
      WHEN COALESCE((SELECT SUM(amount) FROM "InvoicePayments" WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)), 0) = 0 THEN 'unpaid'
      WHEN COALESCE((SELECT SUM(amount) FROM "InvoicePayments" WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)), 0) >= CAST(total AS DECIMAL) THEN 'paid'
      ELSE 'partial'
    END,
    status = CASE
      WHEN COALESCE((SELECT SUM(amount) FROM "InvoicePayments" WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)), 0) >= CAST(total AS DECIMAL) THEN 'paid'
      ELSE status
    END
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update payment totals
DROP TRIGGER IF EXISTS trigger_update_payment_totals ON "InvoicePayments";
CREATE TRIGGER trigger_update_payment_totals
AFTER INSERT OR UPDATE OR DELETE ON "InvoicePayments"
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_totals();

COMMENT ON TABLE "InvoicePayments" IS 'Tracks individual payments against invoices for partial payment support';
