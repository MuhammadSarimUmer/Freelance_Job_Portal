import api from "../axiosInstance";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
  resendVerification: (email) => api.post("/auth/resend-verification", { email }),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};
