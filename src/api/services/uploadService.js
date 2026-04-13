import api from "../axiosInstance";

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/uploads/document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
