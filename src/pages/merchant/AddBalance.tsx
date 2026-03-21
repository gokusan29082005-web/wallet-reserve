import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle2 } from "lucide-react";
import { useCustomersWithBalance } from "@/hooks/useCustomers";
import { useAddBalance } from "@/hooks/useWallet";
import { formatRupees } from "@/lib/format";
import { toast } from "sonner";

const quickAmounts = [10000, 50000, 100000]; // paise

export default function AddBalance() {
  const navigate = useNavigate();
  const { data: customers = [] } = useCustomersWithBalance();
  const addBalance = useAddBalance();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [customInput, setCustomInput] = useState("");
  const [success, setSuccess] = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const selected = customers.find((c) => c.id === selectedId);

  const finalAmount = amount || (Number(customInput) * 100);

  const handleConfirm = async () => {
    if (!selectedId || finalAmount <= 0) return;
    try {
      await addBalance.mutateAsync({ customerId: selectedId, amount: finalAmount });
      setSuccess(true);
      toast.success("Balance added!");
      setTimeout(() => {
        setSuccess(false);
        setAmount(0);
        setCustomInput("");
      }, 2000);
    } catch {
      toast.error("Failed to add balance");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/merchant")} className="active:scale-95 transition-transform">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-semibold text-foreground">Add Balance</h1>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6 animate-reveal">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Customer list */}
        {!selectedId && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30 active:scale-[0.98]"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </div>
                <span className="text-sm font-medium amount-display text-foreground">
                  {formatRupees(c.balance)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Selected customer */}
        {selected && (
          <>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-foreground">{selected.name}</div>
                  <div className="text-xs text-muted-foreground">{selected.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Balance</div>
                  <div className="text-lg font-bold amount-display text-foreground">
                    {formatRupees(selected.balance)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Change customer
              </button>
            </div>

            {/* Quick amounts */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Quick Amount</label>
              <div className="flex gap-2 mt-2">
                {quickAmounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomInput(""); }}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                      amount === a
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                  >
                    {formatRupees(a)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom input */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Or enter custom (₹)</label>
              <input
                type="number"
                value={customInput}
                onChange={(e) => { setCustomInput(e.target.value); setAmount(0); }}
                placeholder="Enter amount in ₹"
                className="mt-2 w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Confirm */}
            {success ? (
              <div className="flex items-center justify-center gap-2 text-primary py-3">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Added {formatRupees(finalAmount)}</span>
              </div>
            ) : (
              <button
                disabled={finalAmount <= 0 || addBalance.isPending}
                onClick={handleConfirm}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {addBalance.isPending ? "Adding..." : `Add ${formatRupees(finalAmount)}`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
