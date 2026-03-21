import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCustomerBalance(customerId: string | undefined) {
  return useQuery({
    queryKey: ["wallet-balance", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_wallet_balance")
        .select("balance")
        .eq("customer_id", customerId!)
        .maybeSingle();
      if (error) throw error;
      return (data?.balance as number) ?? 0;
    },
  });
}

export function useCustomersWithBalance() {
  return useQuery({
    queryKey: ["customers-with-balance"],
    queryFn: async () => {
      const { data: customers, error: cErr } = await supabase
        .from("customers")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (cErr) throw cErr;

      const { data: balances, error: bErr } = await supabase
        .from("customer_wallet_balance")
        .select("*");
      if (bErr) throw bErr;

      const balMap = new Map(balances?.map(b => [b.customer_id, Number(b.balance)]) ?? []);
      return customers.map(c => ({ ...c, balance: balMap.get(c.id) ?? 0 }));
    },
  });
}
