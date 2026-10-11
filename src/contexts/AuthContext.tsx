import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
interface User {
  id: string;
  email: string;
  name: string;
  role: string | null;
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null),
    [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const loadMember = async (account: SupabaseUser | undefined) => {
      if (!account) {
        if (active) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }
      try {
        const { data } = await supabase
          .from("cms_members")
          .select("role,display_name")
          .eq("user_id", account.id)
          .abortSignal(AbortSignal.timeout(15000))
          .maybeSingle();
        if (active)
          setUser({
            id: account.id,
            email: account.email || "",
            name: data?.display_name || account.user_metadata?.name || "Member",
            role: data?.role || null,
          });
      } catch {
        if (active)
          setUser({
            id: account.id,
            email: account.email || "",
            name: "Member",
            role: null,
          });
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => loadMember(session?.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoading(true);
      queueMicrotask(() => {
        void loadMember(session?.user);
      });
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return !error && !!data.user;
  };
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setUser(null);
  };
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: "Member" } },
    });
    return {
      success: !error,
      message:
        error?.message ||
        "Check your email. A CMS administrator must assign your role before you can edit.",
    };
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within an AuthProvider");
  return value;
};
