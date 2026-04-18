import api from "../axiosInstance";

export const messageService = {
  sendMessage: (data) => api.post("/messages", data),
  getMessages: (contractID) => api.get(`/messages/${contractID}`),
  markAsRead: (contractID) => api.patch(`/messages/${contractID}/read`),
};
