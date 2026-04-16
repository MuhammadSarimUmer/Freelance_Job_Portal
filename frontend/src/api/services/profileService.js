import api from "../axiosInstance";

export const profileService = {
  // GET all developers (with optional filters)
  getAllDevelopers: (params) => api.get("/profiles/developers", { params }),

  // GET developer by ID
  getDeveloperById: (id) => api.get(`/profiles/developers/${id}`),

  // PATCH update logged-in developer's profile (PATCH, not PUT)
  updateMyDeveloperProfile: (data) => api.patch("/profiles/developers/me", data),

  // GET client by ID
  getClientById: (id) => api.get(`/profiles/clients/${id}`),

  // PATCH update logged-in client's profile (PATCH, not PUT)
  updateMyClientProfile: (data) => api.patch("/profiles/clients/me", data),

  // DELETE logged-in user's account
  deleteMyAccount: () => api.delete("/profiles/users/me"),
};
