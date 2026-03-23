import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Plus, Users, KeyRound, ArrowLeft, QrCode } from "lucide-react";
import { useTodayReservations, useVerifyPin } from "@/hooks/useReservations";
import { useVerifyQR } from "@/hooks/useVerifyQR";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRupees } from "@/lib/format";
import { NumericKeypad } from "@/components/NumericKeypad";
import { QRScanner } from "@/components/QRScanner";
import { toast } from "sonner";

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { data: reservations = [] } = useTodayReservations();
  const verify = useVerifyPin();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const reserved = reservations.filter((r) => r.status === "RESERVED").length;
  const collected = reservations.filter((r) => r.status === "COLLECTED").length;

  const handleDigit = (d: string) => {
    if (pin.length >= 3) return;
    const newPin = pin + d;
    setPin(newPin);
    setPinError(false);
    if (newPin.length === 3) {
      verify.mutate(Number(newPin), {
        onSuccess: (data) => {
          setSuccessData(data);
          setPin("");
          setTimeout(() => setSuccessData(null), 3000);
        },
        onError: () => {
          setPinError(true);
          setTimeout(() => { setPin(""); setPinError(false); }, 1500);
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="active:scale-95 transition-transform">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Merchant Dashboard</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/merchant/add-balance")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Balance
            </button>
            <button
              onClick={() => navigate("/merchant/customers")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-secondary active:scale-95"
            >
              <Users className="h-3.5 w-3.5" />
              Customers
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 animate-reveal">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left — Reservations */}
          <div className="lg:col-span-3 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="text-xs text-muted-foreground">Reserved</div>
                <div className="text-2xl font-bold amount-display text-foreground">{reserved}</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="text-xs text-muted-foreground">Collected</div>
                <div className="text-2xl font-bold amount-display text-primary">{collected}</div>
              </div>
            </div>

            {/* Today's reservations */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Today's Reservations</h2>
              <div className="space-y-2">
                {reservations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No reservations yet today</p>
                )}
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {(r.customers as any)?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(r.products as any)?.name} · Qty {r.quantity}
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
          </div>

          {/* Right — PIN verification */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Verify PIN</h2>
              </div>

              {/* Success flash */}
              {successData && (
                <div className="mb-4 rounded-xl bg-primary/10 border border-primary/20 p-4 text-center animate-flash-success">
                  <div className="text-lg font-bold text-primary">✓ Collected!</div>
                  <div className="text-sm text-foreground font-medium mt-1">
                    {(successData.customers as any)?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(successData.products as any)?.name} · Qty {successData.quantity}
                  </div>
                </div>
              )}

              {/* PIN display */}
              <div className={`flex justify-center gap-3 mb-6 ${pinError ? "animate-shake" : ""}`}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`flex h-16 w-14 items-center justify-center rounded-xl border-2 text-3xl font-bold pin-display transition-colors ${
                      pinError
                        ? "border-destructive text-destructive"
                        : pin[i]
                          ? "border-primary text-foreground"
                          : "border-border text-muted-foreground/30"
                    }`}
                  >
                    {pin[i] ?? "·"}
                  </div>
                ))}
              </div>

              {pinError && (
                <p className="text-center text-sm font-medium text-destructive mb-4">Invalid PIN</p>
              )}

              <NumericKeypad
                onDigit={handleDigit}
                onBackspace={() => { setPin(p => p.slice(0, -1)); setPinError(false); }}
                disabled={verify.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
