import api from "../axiosInstance";

export const notificationService = {
  getMyNotifications: () => api.get("/notifications"),
  markAllRead: () => api.patch("/notifications/read"),
};
