-- Create PaymentReminders table for scheduled reminders
CREATE TABLE IF NOT EXISTS "PaymentReminders" (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES "Invoices"(id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES "Businesses"(id) ON DELETE CASCADE,
  
  -- Schedule
  reminder_type VARCHAR(30) NOT NULL CHECK (reminder_type IN ('before_due', 'on_due', 'after_due', 'custom')),
  days_offset INTEGER NOT NULL DEFAULT 0, -- Negative = before due, Positive = after due
  scheduled_date DATE NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'skipped')),
  sent_at TIMESTAMPTZ,
  
  -- Email tracking
  email_id TEXT,
  email_opened BOOLEAN DEFAULT false,
  email_opened_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding due reminders
CREATE INDEX idx_reminders_scheduled ON "PaymentReminders"(scheduled_date) WHERE status = 'pending';
CREATE INDEX idx_reminders_invoice ON "PaymentReminders"(invoice_id);

-- Business reminder settings
CREATE TABLE IF NOT EXISTS "ReminderSettings" (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL UNIQUE REFERENCES "Businesses"(id) ON DELETE CASCADE,
  
  -- Enable/disable
  reminders_enabled BOOLEAN DEFAULT true,
  
  -- Default schedule (days relative to due date)
  remind_before_days INTEGER[] DEFAULT ARRAY[3], -- 3 days before
  remind_on_due BOOLEAN DEFAULT true,
  remind_after_days INTEGER[] DEFAULT ARRAY[3, 7, 14], -- 3, 7, 14 days after
  
  -- Email customization
  before_due_subject TEXT DEFAULT 'Friendly Reminder: Invoice {{invoice_number}} due in {{days}} days',
  before_due_message TEXT,
  on_due_subject TEXT DEFAULT 'Payment Due Today: Invoice {{invoice_number}}',
  on_due_message TEXT,
  after_due_subject TEXT DEFAULT 'Overdue: Invoice {{invoice_number}} was due {{days}} days ago',
  after_due_message TEXT,
  
  -- Limits
  max_reminders_per_invoice INTEGER DEFAULT 5,
  stop_on_payment BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE "PaymentReminders" IS 'Scheduled payment reminder emails';
COMMENT ON TABLE "ReminderSettings" IS 'Business-level reminder preferences';
