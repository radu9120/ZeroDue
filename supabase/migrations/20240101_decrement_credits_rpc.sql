-- Atomic function to decrement invoice credits
-- Prevents race conditions when multiple requests try to use credits simultaneously
-- Security: includes ownership check and restricted to authenticated users only

CREATE OR REPLACE FUNCTION decrement_invoice_credits(business_id_param BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  credits_remaining INT;
BEGIN
  -- Lock the row, decrement, and verify ownership in a single atomic operation
  UPDATE "Businesses"
  SET extra_invoice_credits = extra_invoice_credits - 1
  WHERE id = business_id_param
    AND author = auth.uid()::text  -- Ownership check
    AND extra_invoice_credits > 0
  RETURNING extra_invoice_credits INTO credits_remaining;
  
  -- Return true if we successfully decremented (row was found, owned by user, and had credits)
  RETURN FOUND;
END;
$$;

-- Revoke from anon, grant only to authenticated
REVOKE EXECUTE ON FUNCTION decrement_invoice_credits(BIGINT) FROM anon;
GRANT EXECUTE ON FUNCTION decrement_invoice_credits(BIGINT) TO authenticated;
