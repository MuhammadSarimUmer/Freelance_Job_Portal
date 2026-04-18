/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext();

const getRoleFromUser = (user) => {
  if (user?.developer) return "DEVELOPER";
  if (user?.client) return "CLIENT";
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const refreshTimeoutRef = useRef(null);

  const decodeTokenPayload = (jwtToken) => {
    try {
      const [, payload] = jwtToken.split(".");
      if (!payload) return null;
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  };

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Failed to logout", error);
    }
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  }, []);

  const scheduleRefresh = useCallback((jwtToken) => {
    if (!jwtToken) return;
    const payload = decodeTokenPayload(jwtToken);
    if (!payload?.exp) return;

    const refreshAt = payload.exp * 1000 - 5 * 60 * 1000;
    const delay = refreshAt - Date.now();

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const doRefresh = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        if (data?.token) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          scheduleRefresh(data.token);
        }
      } catch (error) {
        console.error("Failed to refresh token", error);
        logout();
      }
    };

    refreshTimeoutRef.current = setTimeout(doRefresh, delay <= 0 ? 0 : delay);
  }, [logout]);

  // Run ONCE on mount only — reads token from localStorage directly
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        const userWithRole = { ...data.user, role: getRoleFromUser(data.user) };
        setUser(userWithRole);
        scheduleRefresh(storedToken);
      } catch (error) {
        console.error("Failed to restore session", error);
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false); // ← always runs, no matter what
      }
    };

    initAuth();
  }, []); // ← empty array: runs ONCE on mount only

  const refreshMe = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return null;
    try {
      const { data } = await api.get("/auth/me");
      const userWithRole = { ...data.user, role: getRoleFromUser(data.user) };
      setUser(userWithRole);
      return userWithRole;
    } catch (error) {
      console.error("Failed to refresh /auth/me", error);
      logout();
      return null;
    }
  }, [logout]);

  const loginContext = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    localStorage.setItem("token", data.token);
    scheduleRefresh(data.token);
    const userWithRole = { ...data.user, role: getRoleFromUser(data.user) };
    setUser(userWithRole);
    return { ...data, user: userWithRole };
  };

  const registerContext = async (formData, role) => {
    const headers = formData instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};

    if (formData instanceof FormData) {
      formData.append("role", role.toUpperCase());
    } else {
      formData.role = role.toUpperCase();
    }

    const { data } = await api.post("/auth/register", formData, { headers });
    const userWithRole = data.user ? { ...data.user, role: role.toUpperCase() } : null;

    if (data.token) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
      scheduleRefresh(data.token);
      setUser(userWithRole);
    } else {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
    }

    return { ...data, user: userWithRole };
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, refreshMe, login: loginContext, register: registerContext, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);