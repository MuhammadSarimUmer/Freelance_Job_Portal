import api from "../axiosInstance";

export const milestoneService = {
  createMilestone: (contractId, data) =>
    api.post(`/contracts/${contractId}/milestones`, data),
  getMilestonesByContract: (contractId) =>
    api.get(`/contracts/${contractId}/milestones`),
  getMilestoneById: (id) => api.get(`/milestones/${id}`),
  updateMilestone: (id, data) => api.put(`/milestones/${id}`, data),
  updateMilestoneStatus: (id, status) =>
    api.patch(`/milestones/${id}/status`, { status }),
  deleteMilestone: (id) => api.delete(`/milestones/${id}`),
};
