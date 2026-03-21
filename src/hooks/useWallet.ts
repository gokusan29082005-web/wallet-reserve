import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAddBalance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      amount,
    }: {
      customerId: string;
      amount: number;
    }) => {
      const { error } = await supabase.from("wallet_ledger").insert({
        customer_id: customerId,
        type: "CREDIT",
        amount,
        description: "Cash top-up",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet-balance"] });
      qc.invalidateQueries({ queryKey: ["customers-with-balance"] });
    },
  });
}
