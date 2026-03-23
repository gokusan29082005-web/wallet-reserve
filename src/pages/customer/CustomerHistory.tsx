import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useReservationHistory } from "@/hooks/useReservations";
import { useAuthContext } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRupees } from "@/lib/format";

export default function CustomerHistory() {
  const navigate = useNavigate();
  const { customerId } = useAuthContext();
  const { data: reservations = [], isLoading } = useReservationHistory(customerId ?? "");

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/customer")} className="active:scale-95 transition-transform">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-semibold text-foreground">Reservation History</h1>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-2 animate-reveal">
        {isLoading && <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>}
        {!isLoading && reservations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No reservations in the last 7 days</p>
        )}
        {reservations.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div>
              <div className="text-sm font-medium text-foreground">
                {(r.products as any)?.name ?? "Product"}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(r.reservation_date).toLocaleDateString("en-IN")} · Qty {r.quantity}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium amount-display text-foreground">
                {formatRupees(r.total_amount)}
              </span>
              <StatusBadge status={r.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
