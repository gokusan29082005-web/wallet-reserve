import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Clock, ShoppingBag } from "lucide-react";
import { useCustomerBalance } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { useReserveProduct } from "@/hooks/useReservations";
import { formatRupees } from "@/lib/format";
import { toast } from "sonner";

const CUSTOMER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export default function CustomerHome() {
  const navigate = useNavigate();
  const { data: balance = 0, isLoading: balLoading } = useCustomerBalance(CUSTOMER_ID);
  const { data: products = [] } = useProducts();
  const reserve = useReserveProduct();
  const [reserving, setReserving] = useState<string | null>(null);

  const handleReserve = async (productId: string, price: number) => {
    setReserving(productId);
    try {
      const result = await reserve.mutateAsync({
        customerId: CUSTOMER_ID,
        productId,
        pricePerUnit: price,
        quantity: 1,
      });
      navigate("/customer/success", { state: { reservation: result } });
    } catch (e: any) {
      if (e.message === "LOW_BALANCE") {
        toast.error("Insufficient balance! Ask your shopkeeper to top up.");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setReserving(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">DairyPay</span>
        </div>
        <button
          onClick={() => navigate("/customer/history")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <Clock className="h-4 w-4" />
          History
        </button>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto animate-reveal">
        {/* Balance Card */}
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Wallet className="h-4 w-4" />
            Wallet Balance
          </div>
          <div className="mt-2 text-4xl font-bold amount-display">
            {balLoading ? "..." : formatRupees(balance)}
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Today's Products</h2>
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-foreground">{p.name}</div>
                    <div className="text-sm text-muted-foreground">per {p.unit}</div>
                  </div>
                  <div className="text-xl font-bold amount-display text-foreground">
                    {formatRupees(p.price_per_unit)}
                  </div>
                </div>
                <button
                  disabled={reserving === p.id}
                  onClick={() => handleReserve(p.id, p.price_per_unit)}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                  {reserving === p.id ? "Reserving..." : "Reserve Now"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
