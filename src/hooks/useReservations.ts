import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generatePin, getEndOfDay, todayDate } from "@/lib/format";

export function useTodayReservations(customerId?: string) {
  return useQuery({
    queryKey: ["reservations-today", customerId],
    queryFn: async () => {
      let q = supabase
        .from("reservations")
        .select("*, customers(name, phone), products(name, unit)")
        .eq("reservation_date", todayDate())
        .order("created_at", { ascending: false });

      if (customerId) q = q.eq("customer_id", customerId);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useReservationHistory(customerId: string) {
  return useQuery({
    queryKey: ["reservation-history", customerId],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("reservations")
        .select("*, products(name, unit)")
        .eq("customer_id", customerId)
        .gte("reservation_date", sevenDaysAgo.toISOString().split("T")[0])
        .order("reservation_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useReserveProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      productId,
      pricePerUnit,
      quantity,
    }: {
      customerId: string;
      productId: string;
      pricePerUnit: number;
      quantity: number;
    }) => {
      const totalAmount = pricePerUnit * quantity;

      // Check balance
      const { data: bal } = await supabase
        .from("customer_wallet_balance")
        .select("balance")
        .eq("customer_id", customerId)
        .maybeSingle();

      const balance = Number(bal?.balance ?? 0);
      if (balance < totalAmount) {
        throw new Error("LOW_BALANCE");
      }

      const pin = generatePin();
      const pinExpiry = getEndOfDay();

      // Insert reservation
      const { data: reservation, error: rErr } = await supabase
        .from("reservations")
        .insert({
          customer_id: customerId,
          product_id: productId,
          quantity,
          total_amount: totalAmount,
          reservation_date: todayDate(),
          proxy_pin: pin,
          pin_expiry: pinExpiry,
        })
        .select()
        .single();
      if (rErr) throw rErr;

      // Debit wallet
      const { error: wErr } = await supabase
        .from("wallet_ledger")
        .insert({
          customer_id: customerId,
          type: "DEBIT",
          amount: totalAmount,
          description: "Reservation",
          reference_id: reservation.id,
        });
      if (wErr) throw wErr;

      return reservation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet-balance"] });
      qc.invalidateQueries({ queryKey: ["reservations-today"] });
      qc.invalidateQueries({ queryKey: ["customers-with-balance"] });
    },
  });
}

export function useVerifyPin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (pin: number) => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, customers(name, phone), products(name, unit)")
        .eq("proxy_pin", pin)
        .eq("status", "RESERVED")
        .gt("pin_expiry", new Date().toISOString())
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("INVALID_PIN");

      const { error: uErr } = await supabase
        .from("reservations")
        .update({ status: "COLLECTED", collected_at: new Date().toISOString() })
        .eq("id", data.id);
      if (uErr) throw uErr;

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations-today"] });
    },
  });
}
