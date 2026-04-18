import api from "../axiosInstance";

export const messageService = {
  sendMessage: (data) => api.post("/messages", data),
  getMessages: (contractID, params = {}) => api.get(`/messages/${contractID}`, { params }),
  markAsRead: (contractID) => api.patch(`/messages/${contractID}/read`),
};
