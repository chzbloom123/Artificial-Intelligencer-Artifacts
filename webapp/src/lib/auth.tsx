import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

interface AuthContextType {
  token: string | null;
  email: string | null;
  isLoading: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
  authHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("aier_token"));
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem("aier_email"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get<{ adminId: string; email: string }>("/api/auth/me", {
        Authorization: `Bearer ${token}`,
      }).then((res) => {
        if (res) {
          setEmail(res.email);
        } else {
          setToken(null);
          setEmail(null);
          localStorage.removeItem("aier_token");
          localStorage.removeItem("aier_email");
        }
      }).catch(() => {
        setToken(null);
        setEmail(null);
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newEmail: string) => {
    setToken(newToken);
    setEmail(newEmail);
    localStorage.setItem("aier_token", newToken);
    localStorage.setItem("aier_email", newEmail);
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem("aier_token");
    localStorage.removeItem("aier_email");
  };

  const authHeaders = (): Record<string, string> => token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider value={{ token, email, isLoading, login, logout, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
