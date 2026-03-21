
-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_per_unit INTEGER NOT NULL,
  unit TEXT DEFAULT 'Litre',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wallet_ledger table
CREATE TABLE public.wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
  amount INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_amount INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('RESERVED', 'COLLECTED', 'MISSED')) DEFAULT 'RESERVED',
  proxy_pin INTEGER NOT NULL,
  pin_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  collected_at TIMESTAMP WITH TIME ZONE
);

-- Create wallet balance view
CREATE VIEW public.customer_wallet_balance AS
SELECT 
  customer_id,
  SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END) as balance
FROM public.wallet_ledger
GROUP BY customer_id;

-- Create indexes
CREATE INDEX idx_customer_phone ON public.customers(phone);
CREATE INDEX idx_reservation_date ON public.reservations(reservation_date);
CREATE INDEX idx_proxy_pin ON public.reservations(proxy_pin);
CREATE INDEX idx_ledger_customer ON public.wallet_ledger(customer_id);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- For MVP demo (no auth), allow all access via anon key
CREATE POLICY "Allow all access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to wallet_ledger" ON public.wallet_ledger FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to reservations" ON public.reservations FOR ALL USING (true) WITH CHECK (true);
