import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
  loyaltyPoints: number;
  createdAt: string;
  email?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("eatbf_admin_token");
    const storedUser = localStorage.getItem("eatbf_admin_user");
    if (!stored || !storedUser) return;

    try {
      const parsed = JSON.parse(storedUser) as User;
      if (!parsed || typeof parsed !== "object" || !parsed.id || !parsed.role) {
        throw new Error("Invalid stored user");
      }
      setTokenState(stored);
      setUser(parsed);
      setAuthTokenGetter(() => stored);
    } catch {
      localStorage.removeItem("eatbf_admin_token");
      localStorage.removeItem("eatbf_admin_user");
      setAuthTokenGetter(null);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setTokenState(newToken);
    setUser(newUser);
    setAuthTokenGetter(() => newToken);
    localStorage.setItem("eatbf_admin_token", newToken);
    localStorage.setItem("eatbf_admin_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setTokenState(null);
    setUser(null);
    setAuthTokenGetter(null);
    localStorage.removeItem("eatbf_admin_token");
    localStorage.removeItem("eatbf_admin_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
