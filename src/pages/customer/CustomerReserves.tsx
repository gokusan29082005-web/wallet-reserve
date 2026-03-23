import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useTodayReservations } from "@/hooks/useReservations";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRupees } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";

const CUSTOMER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export default function CustomerReserves() {
  const navigate = useNavigate();
  const { data: reservations = [], isLoading } = useTodayReservations(CUSTOMER_ID);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyPin = (pin: number, id: string) => {
    navigator.clipboard.writeText(String(pin).padStart(3, "0"));
    setCopiedId(id);
    toast.success("PIN copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/customer")} className="active:scale-95 transition-transform">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-semibold text-foreground">Your Reserves</h1>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-3 animate-reveal">
        {isLoading && <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>}
        {!isLoading && reservations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No reservations today</p>
        )}
        {reservations.map((r) => {
          const pin = String(r.proxy_pin).padStart(3, "0");
          const isExpired = new Date(r.pin_expiry) < new Date();
          const isActive = r.status === "RESERVED" && !isExpired;

          return (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">
                    {(r.products as any)?.name ?? "Product"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Qty {r.quantity} · {formatRupees(r.total_amount)}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {isActive && (
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Your PIN</div>
                    <div className="text-2xl font-bold font-mono tracking-widest text-primary">
                      {pin}
                    </div>
                  </div>
                  <button
                    onClick={() => copyPin(r.proxy_pin, r.id)}
                    className="p-2 rounded-md hover:bg-primary/20 transition-colors active:scale-95"
                  >
                    {copiedId === r.id ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4 text-primary" />
                    )}
                  </button>
                </div>
              )}

              {r.status === "COLLECTED" && (
                <div className="text-xs text-muted-foreground">
                  Collected at {new Date(r.collected_at!).toLocaleTimeString("en-IN")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
