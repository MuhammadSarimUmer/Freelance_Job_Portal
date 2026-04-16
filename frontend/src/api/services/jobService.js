import api from "../axiosInstance";

export const jobService = {
  getPublicJobListings: (params) => api.get("/contracts", { params }),
};
