import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onUnauthorized } from "../lib/api";
import { restoreSession, signIn, signOut } from "../services/authService";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  /** Faux tant que la session gardée dans l'onglet n'a pas été vérifiée auprès du serveur. */
  ready: boolean;
  /** Vrai quand le serveur a refusé le jeton en cours de route (session expirée, compte suspendu). */
  expired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Remplace l'utilisateur affiché après une modification de profil. */
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void restoreSession().then((restored) => {
      if (cancelled) return;
      setUser(restored);
      setReady(true);
    });
    // Jeton refusé en cours de route (expiré, compte désactivé) : retour à l'état « déconnecté ».
    const unsubscribe = onUnauthorized(() => {
      setUser(null);
      setExpired(true);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await signIn(email, password));
    setExpired(false);
  }, []);

  const logout = useCallback(() => {
    signOut();
    setUser(null);
    setExpired(false);
  }, []);

  const value = useMemo(() => ({ user, ready, expired, login, logout, setUser }), [user, ready, expired, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>.");
  return context;
}
