import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
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
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/customer" element={<ProtectedRoute><CustomerHome /></ProtectedRoute>} />
            <Route path="/customer/success" element={<ProtectedRoute><ReservationSuccess /></ProtectedRoute>} />
            <Route path="/customer/history" element={<ProtectedRoute><CustomerHistory /></ProtectedRoute>} />
            <Route path="/customer/reserves" element={<ProtectedRoute><CustomerReserves /></ProtectedRoute>} />
            <Route path="/merchant" element={<ProtectedRoute requiredRole="merchant"><MerchantDashboard /></ProtectedRoute>} />
            <Route path="/merchant/add-balance" element={<ProtectedRoute requiredRole="merchant"><AddBalance /></ProtectedRoute>} />
            <Route path="/merchant/customers" element={<ProtectedRoute requiredRole="merchant"><CustomerList /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
