-- Add extra_invoice_credits column to Businesses table
-- Run this in Supabase SQL Editor

ALTER TABLE "Businesses" 
ADD COLUMN IF NOT EXISTS "extra_invoice_credits" INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN "Businesses"."extra_invoice_credits" IS 'Number of extra invoice credits purchased for this business';
