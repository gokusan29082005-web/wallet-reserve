import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
    } else if (role === "merchant") {
      navigate("/merchant", { replace: true });
    } else {
      navigate("/customer", { replace: true });
    }
  }, [user, role, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Index;
