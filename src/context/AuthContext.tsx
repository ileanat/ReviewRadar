//@ts-nocheck

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, check if user is logged in
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("http://localhost:8000/api/auth/me", {
          credentials: "include",
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, []);

  const login = async (emailOrUsername, password) => {
    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    setUser(data.user);
  };

  const register = async (username, email, password) => {
    const res = await fetch("http://localhost:8000/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
  
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Register failed");
  
    setUser(data.user);
  };
  
  const logout = async () => {
    await fetch("http://localhost:8000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
