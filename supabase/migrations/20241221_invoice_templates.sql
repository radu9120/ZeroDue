-- Create invoice_templates table for industry-specific templates
CREATE TABLE IF NOT EXISTS "invoice_templates" (
  "id" SERIAL PRIMARY KEY,
  "industry" TEXT NOT NULL,
  "template_name" TEXT NOT NULL,
  "description" TEXT,
  "items" JSONB NOT NULL,
  "subtotal" NUMERIC(10, 2) NOT NULL,
  "tax" NUMERIC(10, 2) DEFAULT 0,
  "total" NUMERIC(10, 2) NOT NULL,
  "notes" TEXT,
  "currency" TEXT DEFAULT 'GBP',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_invoice_templates_industry ON "invoice_templates" ("industry");

-- Enable RLS
ALTER TABLE "invoice_templates" ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read templates (they're public)
CREATE POLICY "Anyone can view invoice templates"
  ON "invoice_templates"
  FOR SELECT
  USING (true);

-- Insert photography invoice template
INSERT INTO "invoice_templates" (industry, template_name, description, items, subtotal, tax, total, notes, currency)
VALUES (
  'photographers',
  'Wedding Photography Package',
  'Full-day wedding coverage with edited photos',
  '[
    {"description": "Full-day wedding coverage (10 hours)", "quantity": 1, "rate": 1200.00, "tax": 0, "amount": 1200.00},
    {"description": "Second shooter", "quantity": 1, "rate": 400.00, "tax": 0, "amount": 400.00},
    {"description": "Photo editing (500 images)", "quantity": 1, "rate": 300.00, "tax": 0, "amount": 300.00},
    {"description": "Online gallery hosting (1 year)", "quantity": 1, "rate": 50.00, "tax": 0, "amount": 50.00},
    {"description": "Usage rights (personal use)", "quantity": 1, "rate": 0.00, "tax": 0, "amount": 0.00}
  ]'::jsonb,
  1950.00,
  390.00,
  2340.00,
  'Payment terms: 50% deposit due at booking, remaining balance due on wedding day. All images delivered within 4 weeks.',
  'GBP'
);

-- Insert plumber invoice template
INSERT INTO "invoice_templates" (industry, template_name, description, items, subtotal, tax, total, notes, currency)
VALUES (
  'plumbers',
  'Emergency Boiler Repair',
  'Emergency call-out and boiler repair',
  '[
    {"description": "Emergency call-out fee", "quantity": 1, "rate": 80.00, "tax": 20, "amount": 80.00},
    {"description": "Labour (2 hours)", "quantity": 2, "rate": 45.00, "tax": 20, "amount": 90.00},
    {"description": "Replacement thermostat", "quantity": 1, "rate": 65.00, "tax": 20, "amount": 65.00},
    {"description": "Replacement pressure valve", "quantity": 1, "rate": 35.00, "tax": 20, "amount": 35.00}
  ]'::jsonb,
  270.00,
  54.00,
  324.00,
  'Payment due on completion. 12-month warranty on parts and labour. Gas Safe registered.',
  'GBP'
);

-- Insert freelancer invoice template
INSERT INTO "invoice_templates" (industry, template_name, description, items, subtotal, tax, total, notes, currency)
VALUES (
  'freelancers',
  'Website Development Project',
  'Custom website design and development',
  '[
    {"description": "Homepage design & development", "quantity": 1, "rate": 800.00, "tax": 20, "amount": 800.00},
    {"description": "About & Services pages", "quantity": 2, "rate": 400.00, "tax": 20, "amount": 800.00},
    {"description": "Contact form integration", "quantity": 1, "rate": 200.00, "tax": 20, "amount": 200.00},
    {"description": "Mobile responsive design", "quantity": 1, "rate": 300.00, "tax": 20, "amount": 300.00},
    {"description": "SEO optimization", "quantity": 1, "rate": 250.00, "tax": 20, "amount": 250.00}
  ]'::jsonb,
  2350.00,
  470.00,
  2820.00,
  'Payment terms: 50% upfront, 50% on completion. Includes 30 days of post-launch support.',
  'GBP'
);

-- Insert contractor invoice template
INSERT INTO "invoice_templates" (industry, template_name, description, items, subtotal, tax, total, notes, currency)
VALUES (
  'contractors',
  'Kitchen Renovation',
  'Complete kitchen renovation project',
  '[
    {"description": "Labour (5 days)", "quantity": 5, "rate": 250.00, "tax": 20, "amount": 1250.00},
    {"description": "Kitchen cabinets", "quantity": 1, "rate": 2500.00, "tax": 20, "amount": 2500.00},
    {"description": "Worktop installation", "quantity": 1, "rate": 800.00, "tax": 20, "amount": 800.00},
    {"description": "Plumbing work", "quantity": 1, "rate": 450.00, "tax": 20, "amount": 450.00},
    {"description": "Electrical work", "quantity": 1, "rate": 350.00, "tax": 20, "amount": 350.00},
    {"description": "Waste disposal", "quantity": 1, "rate": 150.00, "tax": 20, "amount": 150.00}
  ]'::jsonb,
  5500.00,
  1100.00,
  6600.00,
  'Payment schedule: 30% deposit, 40% mid-project, 30% on completion. Materials included. 2-year guarantee.',
  'GBP'
);

-- Insert consultant invoice template
INSERT INTO "invoice_templates" (industry, template_name, description, items, subtotal, tax, total, notes, currency)
VALUES (
  'consultants',
  'Business Strategy Consultation',
  'Strategic planning and business advisory',
  '[
    {"description": "Initial consultation (2 hours)", "quantity": 2, "rate": 150.00, "tax": 20, "amount": 300.00},
    {"description": "Market research and analysis", "quantity": 8, "rate": 120.00, "tax": 20, "amount": 960.00},
    {"description": "Strategy document preparation", "quantity": 6, "rate": 120.00, "tax": 20, "amount": 720.00},
    {"description": "Presentation to stakeholders", "quantity": 3, "rate": 150.00, "tax": 20, "amount": 450.00}
  ]'::jsonb,
  2430.00,
  486.00,
  2916.00,
  'Payment due within 14 days. Retainer agreements available for ongoing consulting.',
  'GBP'
);

-- Insert electrician invoice template
INSERT INTO "invoice_templates" (industry, template_name, description, items, subtotal, tax, total, notes, currency)
VALUES (
  'electricians',
  'Consumer Unit Replacement',
  'Replace old fuse box with modern consumer unit',
  '[
    {"description": "18th Edition consumer unit", "quantity": 1, "rate": 180.00, "tax": 20, "amount": 180.00},
    {"description": "MCBs and RCBOs", "quantity": 10, "rate": 15.00, "tax": 20, "amount": 150.00},
    {"description": "Labour (4 hours)", "quantity": 4, "rate": 45.00, "tax": 20, "amount": 180.00},
    {"description": "EICR certificate", "quantity": 1, "rate": 120.00, "tax": 20, "amount": 120.00}
  ]'::jsonb,
  630.00,
  126.00,
  756.00,
  'All work certified to BS 7671:2018. Part P compliant. Payment due on completion.',
  'GBP'
);

-- Insert designer invoice template
INSERT INTO "invoice_templates" (industry, template_name, description, items, subtotal, tax, total, notes, currency)
VALUES (
  'designers',
  'Brand Identity Design',
  'Complete brand identity package',
  '[
    {"description": "Brand strategy & discovery", "quantity": 1, "rate": 600.00, "tax": 20, "amount": 600.00},
    {"description": "Logo design (3 concepts)", "quantity": 1, "rate": 800.00, "tax": 20, "amount": 800.00},
    {"description": "Brand guidelines document", "quantity": 1, "rate": 400.00, "tax": 20, "amount": 400.00},
    {"description": "Business card design", "quantity": 1, "rate": 150.00, "tax": 20, "amount": 150.00},
    {"description": "Social media templates", "quantity": 5, "rate": 80.00, "tax": 20, "amount": 400.00}
  ]'::jsonb,
  2350.00,
  470.00,
  2820.00,
  'Payment: 50% upfront, 50% on final delivery. Includes 2 rounds of revisions. Source files included.',
  'GBP'
);

-- Insert cleaning invoice template
INSERT INTO "invoice_templates" (industry, template_name, description, items, subtotal, tax, total, notes, currency)
VALUES (
  'cleaning',
  'Office Deep Clean',
  'Commercial office deep cleaning service',
  '[
    {"description": "Office deep clean (1500 sq ft)", "quantity": 1, "rate": 180.00, "tax": 20, "amount": 180.00},
    {"description": "Carpet cleaning", "quantity": 1, "rate": 120.00, "tax": 20, "amount": 120.00},
    {"description": "Window cleaning (internal)", "quantity": 15, "rate": 5.00, "tax": 20, "amount": 75.00},
    {"description": "Kitchen deep clean", "quantity": 1, "rate": 80.00, "tax": 20, "amount": 80.00},
    {"description": "Bathroom sanitization", "quantity": 2, "rate": 40.00, "tax": 20, "amount": 80.00}
  ]'::jsonb,
  535.00,
  107.00,
  642.00,
  'Monthly contract available with 15% discount. All cleaning products included. Payment due within 7 days.',
  'GBP'
);

-- Insert landscaping invoice template
INSERT INTO "invoice_templates" (industry, template_name, description, items, subtotal, tax, total, notes, currency)
VALUES (
  'landscaping',
  'Garden Redesign Project',
  'Complete garden transformation with planting',
  '[
    {"description": "Design consultation", "quantity": 1, "rate": 150.00, "tax": 20, "amount": 150.00},
    {"description": "Ground preparation & leveling", "quantity": 1, "rate": 400.00, "tax": 20, "amount": 400.00},
    {"description": "Turf installation (50 sq m)", "quantity": 50, "rate": 8.00, "tax": 20, "amount": 400.00},
    {"description": "Plants & shrubs", "quantity": 1, "rate": 350.00, "tax": 20, "amount": 350.00},
    {"description": "Labour (3 days)", "quantity": 3, "rate": 200.00, "tax": 20, "amount": 600.00},
    {"description": "Waste removal", "quantity": 1, "rate": 100.00, "tax": 20, "amount": 100.00}
  ]'::jsonb,
  2000.00,
  400.00,
  2400.00,
  'Payment: 30% deposit, balance on completion. 12-month guarantee on plants. Seasonal maintenance packages available.',
  'GBP'
);
