
-- Fix the security definer view by recreating with security_invoker
DROP VIEW IF EXISTS public.customer_wallet_balance;
CREATE VIEW public.customer_wallet_balance WITH (security_invoker = on) AS
SELECT 
  customer_id,
  SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END) as balance
FROM public.wallet_ledger
GROUP BY customer_id;
