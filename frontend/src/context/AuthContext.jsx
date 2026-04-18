/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext();

// Helper: extract role from user object returned by backend
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

  const logout = async () => {
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
  };

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

  const scheduleRefresh = (jwtToken) => {
    if (!jwtToken) return;

    const payload = decodeTokenPayload(jwtToken);
    if (!payload?.exp) return;

    const refreshAt = payload.exp * 1000 - 5 * 60 * 1000;
    const delay = refreshAt - Date.now();

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    if (delay <= 0) {
      refreshTimeoutRef.current = setTimeout(() => handleRefreshToken(), 0);
      return;
    }

    refreshTimeoutRef.current = setTimeout(() => handleRefreshToken(), delay);
  };

  const handleRefreshToken = async () => {
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

  const refreshMe = async () => {
    if (!token) return null;
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
  };

  useEffect(() => {
    const initAuth = async () => {
      await refreshMe();
      setLoading(false);
    };
    initAuth();
  }, [token]);

  useEffect(() => {
    if (token) {
      scheduleRefresh(token);
    }
  }, [token]);

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
    <AuthContext.Provider value={{ user, token, loading, refreshMe, login: loginContext, register: registerContext, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
