import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios";
import type { AuthContextType, User } from "../types/types";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
   let mounted = true;

   const loadMe = async () => {
     try {
       const res = await api.get("/api/user/me");
       if (mounted) setUser(res.data.user ?? res.data);
     } catch (err: any) {
       if (err?.response?.status === 401) {
         if (mounted) setUser(null);
       }
     } finally {
       if (mounted) setLoading(false);
     }
   };

   loadMe();

   return () => {
     mounted = false;
   };
 }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
