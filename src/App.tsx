import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import CustomerHome from "./pages/customer/CustomerHome";
import ReservationSuccess from "./pages/customer/ReservationSuccess";
import CustomerHistory from "./pages/customer/CustomerHistory";
import CustomerReserves from "./pages/customer/CustomerReserves";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import AddBalance from "./pages/merchant/AddBalance";
import CustomerList from "./pages/merchant/CustomerList";
import ProductManagement from "./pages/merchant/ProductManagement";
import RevenueDashboard from "./pages/merchant/RevenueDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "merchant" | "customer";
}) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  
  if (requiredRole === "merchant" && role !== "merchant") {
    return <Navigate to="/customer" replace />;
  }
  
  if (requiredRole === "customer" && role !== "customer") {
    return <Navigate to="/merchant" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={role === "merchant" ? "/merchant" : "/customer"}
              replace
            />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/auth"
        element={
          user ? (
            <Navigate
              to={role === "merchant" ? "/merchant" : "/customer"}
              replace
            />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route
        path="/customer"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/success"
        element={
          <ProtectedRoute requiredRole="customer">
            <ReservationSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/reserves"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerReserves />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/history"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merchant"
        element={
          <ProtectedRoute requiredRole="merchant">
            <MerchantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merchant/add-balance"
        element={
          <ProtectedRoute requiredRole="merchant">
            <AddBalance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merchant/customers"
        element={
          <ProtectedRoute requiredRole="merchant">
            <CustomerList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merchant/products"
        element={
          <ProtectedRoute requiredRole="merchant">
            <ProductManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merchant/revenue"
        element={
          <ProtectedRoute requiredRole="merchant">
            <RevenueDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
