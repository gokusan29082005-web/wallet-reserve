import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CustomerHome from "./pages/customer/CustomerHome";
import ReservationSuccess from "./pages/customer/ReservationSuccess";
import CustomerHistory from "./pages/customer/CustomerHistory";
import CustomerReserves from "./pages/customer/CustomerReserves";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import AddBalance from "./pages/merchant/AddBalance";
import CustomerList from "./pages/merchant/CustomerList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/customer/success" element={<ReservationSuccess />} />
          <Route path="/customer/history" element={<CustomerHistory />} />
          <Route path="/merchant" element={<MerchantDashboard />} />
          <Route path="/merchant/add-balance" element={<AddBalance />} />
          <Route path="/merchant/customers" element={<CustomerList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
