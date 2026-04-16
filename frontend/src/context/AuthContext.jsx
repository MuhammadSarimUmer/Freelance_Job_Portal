/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
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

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
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

  const loginContext = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    localStorage.setItem("token", data.token);
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
    setToken(data.token);
    localStorage.setItem("token", data.token);
    // After register, the role is passed explicitly (backend returns user without developer/client populated)
    const userWithRole = { ...data.user, role: role.toUpperCase() };
    setUser(userWithRole);
    return { ...data, user: userWithRole };
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, refreshMe, login: loginContext, register: registerContext, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
