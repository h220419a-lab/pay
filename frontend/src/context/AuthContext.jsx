import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

const storageKey = "paynow-store-auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : { token: "", user: null };
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(auth));
  }, [auth]);

  const login = (payload) => setAuth(payload);
  const logout = () => setAuth({ token: "", user: null });

  return (
    <AuthContext.Provider value={{ ...auth, isAuthenticated: Boolean(auth.token), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
