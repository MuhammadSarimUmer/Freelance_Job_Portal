import api from "../axiosInstance";

export const escrowService = {
  depositToEscrow: (data) => api.post("/escrow/deposit", data),
  releaseEscrow: (escrowId) => api.post("/escrow/release", { escrowID: escrowId }),
  refundEscrow: (escrowId) => api.post("/escrow/refund", { escrowID: escrowId }),
  getEscrowHistory: () => api.get("/escrow/history"),
};
