import api from "../axiosInstance";

export const escrowService = {
  depositToEscrow: (data) => api.post("/escrow/deposit", data),
  releaseEscrow: (escrowId) => api.post(`/escrow/${escrowId}/release`),
  refundEscrow: (escrowId) => api.post(`/escrow/${escrowId}/refund`),
  getEscrowHistory: () => api.get("/escrow/history"),
};
