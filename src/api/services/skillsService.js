import api from "../axiosInstance";

export const skillsService = {
  getAllTechnologies: () => api.get("/technologies"),
  addSkill: (data) => api.post("/developers/me/skills", data),
  updateSkill: (skillId, data) =>
    api.put(`/developers/me/skills/${skillId}`, data),
  removeSkill: (skillId) => api.delete(`/developers/me/skills/${skillId}`),
};
