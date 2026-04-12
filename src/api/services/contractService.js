import api from "../axiosInstance";

export const contractService = {
  createApplication: (data) => api.post("/applications", data),
  getMyApplications: () => api.get("/applications"),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),
  deleteApplication: (id) => api.delete(`/applications/${id}`),

  createContract: (data) => api.post("/contracts", data),
  getMyContracts: () => api.get("/contracts"),
  getContractById: (id) => api.get(`/contracts/${id}`),
  updateContract: (id, data) => api.put(`/contracts/${id}`, data),
  updateContractStatus: (id, status) =>
    api.patch(`/contracts/${id}/status`, { status }),

  addRequiredTech: (contractId, technologyId) =>
    api.post(`/contracts/${contractId}/tech`, { technologyId }),
  removeRequiredTech: (contractId, techId) =>
    api.delete(`/contracts/${contractId}/tech/${techId}`),

  assignDeveloper: (contractId, data) =>
    api.post(`/contracts/${contractId}/team`, data),
  updateTeamMember: (teamId, data) =>
    api.put(`/contracts/team/${teamId}`, data),
  removeTeamMember: (teamId) => api.delete(`/contracts/team/${teamId}`),
};
