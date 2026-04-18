import api from "../axiosInstance";

export const disputeService = {
  raiseDispute: (data) => api.post("/disputes", data),
  getDisputesForContract: (contractID) => api.get(`/disputes/contract/${contractID}`),
  resolveDispute: (disputeId, data) => api.patch(`/disputes/${disputeId}`, data),
};
