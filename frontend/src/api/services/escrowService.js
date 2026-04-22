import api from "../axiosInstance";

export const escrowService = {
  initiatePayment: (data) => api.post("/escrow/deposit", data),
  verifyPayment: (beacon, force = false) => api.get("/escrow/verify-payment", { params: { beacon, ...(force ? { force: "true" } : {}) } }),
  releaseEscrow: (escrowId) => api.post("/escrow/release", { escrowID: escrowId }),
  refundEscrow: (escrowId) => api.post("/escrow/refund", { escrowID: escrowId }),
  getEscrowHistory: () => api.get("/escrow/history"),
  simulateDeposit: (escrowId) => api.post("/escrow/simulate-deposit", { escrowID: escrowId }),
  forceDeposit: (transactionReference) => api.post("/escrow/webhook", { transactionReference, status: "DEPOSITED" }),
  forceRelease: (transactionReference) => api.post("/escrow/webhook", { transactionReference, status: "RELEASED" }),
};
