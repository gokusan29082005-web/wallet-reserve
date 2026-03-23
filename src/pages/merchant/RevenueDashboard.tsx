import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, IndianRupee, CalendarDays, BarChart3 } from "lucide-react";
import { useRevenueStats } from "@/hooks/useRevenue";
import { formatRupees } from "@/lib/format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const dailyChartConfig: ChartConfig = {
  amount: { label: "Revenue (₹)", color: "hsl(var(--primary))" },
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
  "hsl(280 65% 60%)",
];

export default function RevenueDashboard() {
  const navigate = useNavigate();
  const {
    todayRevenue,
    monthlyRevenue,
    yearlyRevenue,
    totalRevenue,
    dailyRevenue,
    monthlyChart,
    productRevenue,
    totalOrders,
    isLoading,
  } = useRevenueStats();

  const stats = [
    { label: "Today", value: todayRevenue, icon: CalendarDays },
    { label: "This Month", value: monthlyRevenue, icon: TrendingUp },
    { label: "This Year", value: yearlyRevenue, icon: BarChart3 },
    { label: "All Time", value: totalRevenue, icon: IndianRupee },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <button onClick={() => navigate("/merchant")} className="active:scale-95 transition-transform">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Revenue Dashboard</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6 animate-reveal">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <s.icon className="h-3.5 w-3.5" />
                    {s.label}
                  </div>
                  <div className="text-lg font-bold amount-display text-foreground">
                    {formatRupees(s.value)}
                  </div>
                </div>
              ))}
            </div>

            {/* Orders count */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
              <div className="text-xs text-muted-foreground">Total Collected Orders</div>
              <div className="text-2xl font-bold text-primary">{totalOrders}</div>
            </div>

            {/* Daily revenue chart */}
            {dailyRevenue.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-medium text-foreground mb-3">Daily Revenue (Last 30 Days)</h3>
                <ChartContainer config={dailyChartConfig} className="h-[220px] w-full">
                  <BarChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => v.slice(5)}
                      className="fill-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <ChartTooltip
                      content={<ChartTooltipContent labelFormatter={(v) => `Date: ${v}`} />}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            )}

            {/* Monthly revenue chart */}
            {monthlyChart.length > 1 && (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-medium text-foreground mb-3">Monthly Revenue Trend</h3>
                <ChartContainer config={dailyChartConfig} className="h-[220px] w-full">
                  <BarChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            )}

            {/* Product-wise revenue */}
            {productRevenue.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-medium text-foreground mb-3">Revenue by Product</h3>
                <div className="space-y-2">
                  {productRevenue.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-sm text-foreground">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium amount-display text-foreground">
                          {formatRupees(p.revenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">{p.count} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
