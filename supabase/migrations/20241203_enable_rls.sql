-- ============================================
-- InvoiceFlow RLS Security Migration
-- Created: 2024-12-03
-- ============================================

-- ============================================
-- STEP 1: CREATE USER_PROFILES TABLE
-- ============================================
-- This table maps Clerk auth users to their businesses
-- and stores user preferences

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id text UNIQUE NOT NULL,  -- Clerk user ID (string like 'user_xxx')
  email text,
  full_name text,
  avatar_url text,
  default_business_id bigint REFERENCES public."Businesses"(id) ON DELETE SET NULL,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON public.user_profiles(auth_user_id);

-- Enable RLS on user_profiles itself
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid()::text)
  WITH CHECK (auth_user_id = auth.uid()::text);

-- ============================================
-- STEP 2: POPULATE USER_PROFILES FROM EXISTING DATA
-- ============================================
-- This inserts a profile for each unique author in Businesses table

INSERT INTO public.user_profiles (auth_user_id)
SELECT DISTINCT author FROM public."Businesses" WHERE author IS NOT NULL
ON CONFLICT (auth_user_id) DO NOTHING;

-- ============================================
-- STEP 3: CREATE HELPER FUNCTION
-- ============================================
-- This function checks if a user owns a business (via author column)
-- More efficient than repeated subqueries

CREATE OR REPLACE FUNCTION public.user_owns_business(biz_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."Businesses" 
    WHERE id = biz_id AND author = auth.uid()::text
  );
$$;

GRANT EXECUTE ON FUNCTION public.user_owns_business(bigint) TO authenticated;

-- ============================================
-- BUSINESSES TABLE
-- ============================================
ALTER TABLE public."Businesses" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own businesses"
  ON public."Businesses" FOR SELECT
  TO authenticated
  USING (author = auth.uid()::text);

CREATE POLICY "Users can insert their own business"
  ON public."Businesses" FOR INSERT
  TO authenticated
  WITH CHECK (author = auth.uid()::text);

CREATE POLICY "Users can update their own businesses"
  ON public."Businesses" FOR UPDATE
  TO authenticated
  USING (author = auth.uid()::text)
  WITH CHECK (author = auth.uid()::text);

CREATE POLICY "Users can delete their own businesses"
  ON public."Businesses" FOR DELETE
  TO authenticated
  USING (author = auth.uid()::text);

-- Allow anon to view businesses for public invoice/estimate pages
CREATE POLICY "Anon can view businesses for public pages"
  ON public."Businesses" FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- CLIENTS TABLE (business_id: bigint)
-- ============================================
ALTER TABLE public."Clients" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clients of their businesses"
  ON public."Clients" FOR SELECT
  TO authenticated
  USING (public.user_owns_business(business_id));  -- bigint, no cast needed

CREATE POLICY "Users can insert clients to their businesses"
  ON public."Clients" FOR INSERT
  TO authenticated
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can update clients of their businesses"
  ON public."Clients" FOR UPDATE
  TO authenticated
  USING (public.user_owns_business(business_id))
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can delete clients of their businesses"
  ON public."Clients" FOR DELETE
  TO authenticated
  USING (public.user_owns_business(business_id));

-- Allow anon to view clients for public invoice/estimate pages
CREATE POLICY "Anon can view clients for public pages"
  ON public."Clients" FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- INVOICES TABLE
-- ============================================
ALTER TABLE public."Invoices" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoices of their businesses"
  ON public."Invoices" FOR SELECT
  TO authenticated
  USING (public.user_owns_business(business_id));

CREATE POLICY "Users can insert invoices to their businesses"
  ON public."Invoices" FOR INSERT
  TO authenticated
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can update invoices of their businesses"
  ON public."Invoices" FOR UPDATE
  TO authenticated
  USING (public.user_owns_business(business_id))
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can delete invoices of their businesses"
  ON public."Invoices" FOR DELETE
  TO authenticated
  USING (public.user_owns_business(business_id));

-- Allow public access to invoices via public_token (for shared invoice links)
CREATE POLICY "Anon can view invoices by public token"
  ON public."Invoices" FOR SELECT
  TO anon
  USING (public_token IS NOT NULL);

-- ============================================
-- ESTIMATES TABLE
-- ============================================
ALTER TABLE public."Estimates" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view estimates of their businesses"
  ON public."Estimates" FOR SELECT
  TO authenticated
  USING (public.user_owns_business(business_id));

CREATE POLICY "Users can insert estimates to their businesses"
  ON public."Estimates" FOR INSERT
  TO authenticated
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can update estimates of their businesses"
  ON public."Estimates" FOR UPDATE
  TO authenticated
  USING (public.user_owns_business(business_id))
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can delete estimates of their businesses"
  ON public."Estimates" FOR DELETE
  TO authenticated
  USING (public.user_owns_business(business_id));

-- Allow public access to estimates via public_token
CREATE POLICY "Anon can view estimates by public token"
  ON public."Estimates" FOR SELECT
  TO anon
  USING (public_token IS NOT NULL);

-- Allow anon to update estimate status (for accept/reject)
CREATE POLICY "Anon can respond to estimates by public token"
  ON public."Estimates" FOR UPDATE
  TO anon
  USING (public_token IS NOT NULL)
  WITH CHECK (public_token IS NOT NULL);

-- ============================================
-- EXPENSES TABLE
-- ============================================
ALTER TABLE public."Expenses" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses of their businesses"
  ON public."Expenses" FOR SELECT
  TO authenticated
  USING (public.user_owns_business(business_id));

CREATE POLICY "Users can insert expenses to their businesses"
  ON public."Expenses" FOR INSERT
  TO authenticated
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can update expenses of their businesses"
  ON public."Expenses" FOR UPDATE
  TO authenticated
  USING (public.user_owns_business(business_id))
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can delete expenses of their businesses"
  ON public."Expenses" FOR DELETE
  TO authenticated
  USING (public.user_owns_business(business_id));

-- ============================================
-- EXPENSE CATEGORIES TABLE
-- ============================================
ALTER TABLE public."ExpenseCategories" ENABLE ROW LEVEL SECURITY;

-- Categories can be default (business_id = NULL) or business-specific
CREATE POLICY "Users can view expense categories"
  ON public."ExpenseCategories" FOR SELECT
  TO authenticated
  USING (business_id IS NULL OR public.user_owns_business(business_id));

CREATE POLICY "Users can insert expense categories"
  ON public."ExpenseCategories" FOR INSERT
  TO authenticated
  WITH CHECK (business_id IS NULL OR public.user_owns_business(business_id));

CREATE POLICY "Users can update their expense categories"
  ON public."ExpenseCategories" FOR UPDATE
  TO authenticated
  USING (public.user_owns_business(business_id))
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can delete their expense categories"
  ON public."ExpenseCategories" FOR DELETE
  TO authenticated
  USING (public.user_owns_business(business_id));

-- ============================================
-- INVOICE PAYMENTS TABLE
-- ============================================
ALTER TABLE public."InvoicePayments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their invoices"
  ON public."InvoicePayments" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Invoices" i
      WHERE i.id = invoice_id AND public.user_owns_business(i.business_id)
    )
  );

CREATE POLICY "Users can insert payments for their invoices"
  ON public."InvoicePayments" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Invoices" i
      WHERE i.id = invoice_id AND public.user_owns_business(i.business_id)
    )
  );

CREATE POLICY "Users can update payments for their invoices"
  ON public."InvoicePayments" FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Invoices" i
      WHERE i.id = invoice_id AND public.user_owns_business(i.business_id)
    )
  );

CREATE POLICY "Users can delete payments for their invoices"
  ON public."InvoicePayments" FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Invoices" i
      WHERE i.id = invoice_id AND public.user_owns_business(i.business_id)
    )
  );

-- ============================================
-- PAYMENT REMINDERS TABLE
-- ============================================
ALTER TABLE public."PaymentReminders" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reminders for their invoices"
  ON public."PaymentReminders" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Invoices" i
      WHERE i.id = invoice_id AND public.user_owns_business(i.business_id)
    )
  );

CREATE POLICY "Users can manage reminders for their invoices"
  ON public."PaymentReminders" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Invoices" i
      WHERE i.id = invoice_id AND public.user_owns_business(i.business_id)
    )
  );

-- ============================================
-- REMINDER SETTINGS TABLE
-- ============================================
ALTER TABLE public."ReminderSettings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their reminder settings"
  ON public."ReminderSettings" FOR SELECT
  TO authenticated
  USING (public.user_owns_business(business_id));

CREATE POLICY "Users can manage their reminder settings"
  ON public."ReminderSettings" FOR ALL
  TO authenticated
  USING (public.user_owns_business(business_id))
  WITH CHECK (public.user_owns_business(business_id));

-- ============================================
-- RECURRING INVOICES TABLE
-- ============================================
ALTER TABLE public."RecurringInvoices" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recurring invoices of their businesses"
  ON public."RecurringInvoices" FOR SELECT
  TO authenticated
  USING (public.user_owns_business(business_id));

CREATE POLICY "Users can insert recurring invoices"
  ON public."RecurringInvoices" FOR INSERT
  TO authenticated
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can update recurring invoices"
  ON public."RecurringInvoices" FOR UPDATE
  TO authenticated
  USING (public.user_owns_business(business_id))
  WITH CHECK (public.user_owns_business(business_id));

CREATE POLICY "Users can delete recurring invoices"
  ON public."RecurringInvoices" FOR DELETE
  TO authenticated
  USING (public.user_owns_business(business_id));

-- ============================================
-- USER ACTIVITY LOG TABLE
-- ============================================
ALTER TABLE public."UserActivityLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
  ON public."UserActivityLog" FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()::text 
    OR public.user_owns_business(business_id)
  );

CREATE POLICY "Users can insert their own activity"
  ON public."UserActivityLog" FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- ============================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Businesses" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Clients" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Invoices" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Estimates" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Expenses" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."ExpenseCategories" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."InvoicePayments" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."PaymentReminders" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."ReminderSettings" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."RecurringInvoices" TO authenticated;
GRANT SELECT, INSERT ON public."UserActivityLog" TO authenticated;

-- Grant SELECT on tables needed for public pages (invoice/estimate links)
GRANT SELECT ON public."Invoices" TO anon;
GRANT SELECT, UPDATE ON public."Estimates" TO anon;
GRANT SELECT ON public."Businesses" TO anon;
GRANT SELECT ON public."Clients" TO anon;

-- ============================================
-- TRIGGER: Auto-create user profile on first business
-- ============================================
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (auth_user_id, default_business_id)
  VALUES (NEW.author, NEW.id)
  ON CONFLICT (auth_user_id) 
  DO UPDATE SET 
    default_business_id = COALESCE(user_profiles.default_business_id, NEW.id),
    updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_business_created
  AFTER INSERT ON public."Businesses"
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_profile();

-- ============================================
-- VERIFICATION QUERY (run after to confirm RLS is enabled)
-- ============================================
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
