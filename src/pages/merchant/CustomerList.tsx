import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useCustomersWithBalance } from "@/hooks/useCustomers";
import { formatRupees } from "@/lib/format";

export default function CustomerList() {
  const navigate = useNavigate();
  const { data: customers = [], isLoading } = useCustomersWithBalance();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/merchant")} className="active:scale-95 transition-transform">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-semibold text-foreground">Customers</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto animate-reveal">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Balance</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Loading…</td></tr>
              )}
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3 text-right amount-display font-medium text-foreground">
                    {formatRupees(c.balance)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate("/merchant/add-balance")}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 active:scale-95"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
