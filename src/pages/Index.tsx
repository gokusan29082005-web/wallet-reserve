import { useNavigate } from "react-router-dom";
import { ShoppingBag, LayoutDashboard } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-8 animate-reveal">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <ShoppingBag className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">DairyPay</h1>
          <p className="text-sm text-muted-foreground">Prepaid reservations for your daily essentials</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/customer")}
            className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Customer</div>
              <div className="text-sm text-muted-foreground">Reserve products & check balance</div>
            </div>
          </button>

          <button
            onClick={() => navigate("/merchant")}
            className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/20">
              <LayoutDashboard className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Merchant</div>
              <div className="text-sm text-muted-foreground">Dashboard, verify PINs & manage</div>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">Demo — select a role to continue</p>
      </div>
    </div>
  );
};

export default Index;
