-- Add tax_label column to Businesses table
ALTER TABLE "Businesses" 
ADD COLUMN IF NOT EXISTS tax_label TEXT DEFAULT 'VAT';

-- Add a comment to the column
COMMENT ON COLUMN "Businesses".tax_label IS 'Tax type label (e.g., VAT, GST, HST, IVA, TVA, etc.)';
