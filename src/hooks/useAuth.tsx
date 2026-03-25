import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  customerId: string | null;
  role: "customer" | "merchant" | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  customerId: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [role, setRole] = useState<"customer" | "merchant" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch role and customer_id using setTimeout to avoid deadlock
        setTimeout(async () => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);

          const userRole = roles?.[0]?.role ?? "customer";
          setRole(userRole as "customer" | "merchant");

          if (userRole === "customer") {
            const { data } = await supabase.rpc("get_customer_id_for_user", {
              _user_id: session.user.id,
            });
            setCustomerId(data as string);
          }
          setLoading(false);
        }, 0);
      } else {
        setCustomerId(null);
        setRole(null);
        setLoading(false);
      }
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCustomerId(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, customerId, role, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
