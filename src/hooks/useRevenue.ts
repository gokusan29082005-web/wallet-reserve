import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { todayDate } from "@/lib/format";

export function useRevenueData() {
  return useQuery({
    queryKey: ["revenue-data"],
    queryFn: async () => {
      // Fetch all collected reservations with product info
      const { data, error } = await supabase
        .from("reservations")
        .select("total_amount, reservation_date, status, product_id, products(name, price_per_unit)")
        .eq("status", "COLLECTED")
        .order("reservation_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useRevenueStats() {
  const { data: reservations = [], ...rest } = useRevenueData();
  const today = todayDate();
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = String(now.getFullYear());

  const todayRevenue = reservations
    .filter((r) => r.reservation_date === today)
    .reduce((sum, r) => sum + r.total_amount, 0);

  const monthlyRevenue = reservations
    .filter((r) => r.reservation_date.startsWith(currentMonth))
    .reduce((sum, r) => sum + r.total_amount, 0);

  const yearlyRevenue = reservations
    .filter((r) => r.reservation_date.startsWith(currentYear))
    .reduce((sum, r) => sum + r.total_amount, 0);

  const totalRevenue = reservations.reduce((sum, r) => sum + r.total_amount, 0);

  // Daily revenue for chart (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dailyMap = new Map<string, number>();
  reservations.forEach((r) => {
    if (new Date(r.reservation_date) >= thirtyDaysAgo) {
      dailyMap.set(r.reservation_date, (dailyMap.get(r.reservation_date) || 0) + r.total_amount);
    }
  });
  const dailyRevenue = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount: amount / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Monthly revenue for chart
  const monthlyMap = new Map<string, number>();
  reservations.forEach((r) => {
    const month = r.reservation_date.slice(0, 7);
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + r.total_amount);
  });
  const monthlyChart = Array.from(monthlyMap.entries())
    .map(([month, amount]) => ({ month, amount: amount / 100 }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Product-wise revenue
  const productMap = new Map<string, { name: string; revenue: number; count: number }>();
  reservations.forEach((r) => {
    const name = (r.products as any)?.name || "Unknown";
    const existing = productMap.get(name) || { name, revenue: 0, count: 0 };
    existing.revenue += r.total_amount;
    existing.count += 1;
    productMap.set(name, existing);
  });
  const productRevenue = Array.from(productMap.values());

  return {
    todayRevenue,
    monthlyRevenue,
    yearlyRevenue,
    totalRevenue,
    dailyRevenue,
    monthlyChart,
    productRevenue,
    totalOrders: reservations.length,
    ...rest,
  };
}
