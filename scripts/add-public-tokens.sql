-- Add public_token column to Invoices table
ALTER TABLE "Invoices" 
ADD COLUMN IF NOT EXISTS "public_token" TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_public_token ON "Invoices"("public_token");

-- Generate tokens for existing invoices (random 32-character tokens)
UPDATE "Invoices"
SET "public_token" = encode(gen_random_bytes(16), 'hex')
WHERE "public_token" IS NULL;
