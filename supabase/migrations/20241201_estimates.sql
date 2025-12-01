-- Create Estimates/Quotes table
CREATE TABLE IF NOT EXISTS "Estimates" (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES "Businesses"(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES "Clients"(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  
  -- Estimate details
  estimate_number VARCHAR(50) NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  
  -- Financial
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(5,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE, -- Expiry date for the quote
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted')),
  
  -- Conversion tracking
  converted_to_invoice_id INTEGER REFERENCES "Invoices"(id),
  converted_at TIMESTAMPTZ,
  
  -- Client response
  client_response_at TIMESTAMPTZ,
  client_notes TEXT, -- Notes from client when accepting/rejecting
  
  -- Public access
  public_token VARCHAR(64) UNIQUE,
  
  -- Email tracking
  email_id TEXT,
  email_sent_at TIMESTAMPTZ,
  email_opened BOOLEAN DEFAULT false,
  email_opened_at TIMESTAMPTZ,
  
  -- Template
  estimate_template TEXT DEFAULT 'modern',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_estimates_business ON "Estimates"(business_id);
CREATE INDEX idx_estimates_client ON "Estimates"(client_id);
CREATE INDEX idx_estimates_status ON "Estimates"(status);
CREATE INDEX idx_estimates_token ON "Estimates"(public_token) WHERE public_token IS NOT NULL;

COMMENT ON TABLE "Estimates" IS 'Stores quotes/estimates that can be converted to invoices';
