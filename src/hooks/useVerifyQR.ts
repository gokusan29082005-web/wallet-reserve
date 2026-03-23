import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useVerifyQR() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (qrData: string) => {
      // Parse DAIRYPAY:reservationId:pin
      const parts = qrData.split(":");
      if (parts.length !== 3 || parts[0] !== "DAIRYPAY") {
        throw new Error("INVALID_QR");
      }

      const reservationId = parts[1];
      const pin = Number(parts[2]);

      const { data, error } = await supabase
        .from("reservations")
        .select("*, customers(name, phone), products(name, unit)")
        .eq("id", reservationId)
        .eq("proxy_pin", pin)
        .eq("status", "RESERVED")
        .gt("pin_expiry", new Date().toISOString())
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("INVALID_QR");

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
