import api from "../axiosInstance";

// Skills are managed under /api/v1/technologies (not /developers/me/skills)
export const skillsService = {
  // GET all available technologies/skills
  getAllTechnologies: () => api.get("/technologies"),

  // POST add a skill to logged-in developer's profile
  addSkill: (data) => api.post("/technologies/skills", data),

  // PUT update a developer's specific skill
  updateSkill: (techID, data) => api.put(`/technologies/skills/${techID}`, data),

  // DELETE remove a skill from developer's profile
  removeSkill: (techID) => api.delete(`/technologies/skills/${techID}`),
};
