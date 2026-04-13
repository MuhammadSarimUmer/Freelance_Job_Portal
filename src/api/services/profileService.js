import api from "../axiosInstance";

export const profileService = {
  getAllDevelopers: (params) => api.get("/developers", { params }),
  getDeveloperById: (id) => api.get(`/developers/${id}`),
  updateMyDeveloperProfile: (data) => api.put("/developers/me", data),
  getClientById: (id) => api.get(`/clients/${id}`),
  updateMyClientProfile: (data) => api.put("/clients/me", data),
  deleteMyAccount: () => api.delete("/users/me"),
};
