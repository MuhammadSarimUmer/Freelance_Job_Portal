import api from "../axiosInstance";

export const bugService = {
  createBug: (data) => api.post("/bugs", data),
  getBugs: (params) => api.get("/bugs", { params }),
  updateBug: (bugId, data) => api.put(`/bugs/${bugId}`, data),
  updateBugStatus: (bugId, status) =>
    api.patch(`/bugs/${bugId}/status`, { status }),
  deleteBug: (bugId) => api.delete(`/bugs/${bugId}`),
};
