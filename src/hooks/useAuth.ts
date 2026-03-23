import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "customer" | "merchant";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  customerId: string | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    customerId: null,
    loading: true,
  });

  const fetchRoleAndCustomer = useCallback(async (userId: string) => {
    const [{ data: roles }, { data: custData }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.rpc("get_customer_id_for_user", { _user_id: userId }),
    ]);

    const role: UserRole = roles?.some((r: any) => r.role === "merchant")
      ? "merchant"
      : "customer";

    return { role, customerId: custData as string | null };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setState((prev) => ({ ...prev, user: session.user, session, loading: true }));
          try {
            const { role, customerId } = await fetchRoleAndCustomer(session.user.id);
            setState({ user: session.user, session, role, customerId, loading: false });
          } catch (err) {
            console.error("Failed to fetch role:", err);
            setState({ user: session.user, session, role: "customer", customerId: null, loading: false });
          }
        } else {
          setState({ user: null, session: null, role: null, customerId: null, loading: false });
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const { role, customerId } = await fetchRoleAndCustomer(session.user.id);
          setState({ user: session.user, session, role, customerId, loading: false });
        } catch (err) {
          console.error("Failed to fetch role:", err);
          setState({ user: session.user, session, role: "customer", customerId: null, loading: false });
        }
      } else {
        setState({ user: null, session: null, role: null, customerId: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRoleAndCustomer]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signOut };
}
