import api from "../axiosInstance";

export const statsService = {
  getDashboardStats: () => api.get("/stats/dashboard"),
};
