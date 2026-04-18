import api from "../axiosInstance";

export const milestoneService = {
  createMilestone: (data) => api.post("/milestones", data),
  getMilestones: (params) => api.get("/milestones", { params }),
  getMilestoneById: (id) => api.get(`/milestones/${id}`),
  updateMilestone: (id, data) => api.put(`/milestones/${id}`, data),
  updateMilestoneStatus: (id, status) =>
    api.patch(`/milestones/${id}/status`, { status }),
  deleteMilestone: (id) => api.delete(`/milestones/${id}`),
};
