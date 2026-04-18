import api from "../axiosInstance";

export const reviewService = {
  createReview: (data) => api.post("/reviews", data),
  getReviewsForUser: (userId) => api.get(`/reviews/user/${userId}`),
  getMyReviews: () => api.get("/reviews/me"),
};
