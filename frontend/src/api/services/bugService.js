import api from "../axiosInstance";

export const bugService = {
  reportBug: (contractId, data) =>
    api.post(`/contracts/${contractId}/bugs`, data),
  getBugsByContract: (contractId) => api.get(`/contracts/${contractId}/bugs`),
  updateBug: (bugId, data) => api.put(`/bugs/${bugId}`, data),
  updateBugStatus: (bugId, status) =>
    api.patch(`/bugs/${bugId}/status`, { status }),
  deleteBug: (bugId) => api.delete(`/bugs/${bugId}`),
};
