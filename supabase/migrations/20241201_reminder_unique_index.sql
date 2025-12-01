-- Add unique index to prevent duplicate reminders for same invoice/type/offset
CREATE UNIQUE INDEX IF NOT EXISTS idx_reminders_unique 
ON "PaymentReminders"(invoice_id, reminder_type, days_offset) 
WHERE status = 'pending';

COMMENT ON INDEX idx_reminders_unique IS 'Prevents duplicate pending reminders for the same invoice, type, and day offset';
