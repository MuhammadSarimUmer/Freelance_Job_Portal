import api from "../axiosInstance";

// === PROJECT CONTRACTS (/api/v1/contracts) ===
export const contractService = {
  // Create a contract (CLIENT only) - requires appID and all required fields
  createContract: (data) => api.post("/contracts", data),

  // Get all contracts for logged-in user (role-based on backend)
  getMyContracts: () => api.get("/contracts"),

  // Get contracts currently open for hiring
  getOpenContracts: () => api.get("/contracts/open"),

  // Get single contract by ID
  getContractById: (id) => api.get(`/contracts/${id}`),

  // Update contract (CLIENT only, contract must be in DRAFT status)
  updateContract: (id, data) => api.put(`/contracts/${id}`, data),

  // Update contract status (CLIENT only)
  updateContractStatus: (id, status) =>
    api.patch(`/contracts/${id}/status`, { status }),

  // Delete contract (CLIENT only)
  deleteContract: (id) => api.delete(`/contracts/${id}`),

  // Add required tech to contract
  addRequiredTech: (contractId, data) =>
    api.post(`/contracts/${contractId}/tech`, data),

  // Assign a developer to a contract
  assignDeveloper: (contractId, data) =>
    api.post(`/contracts/${contractId}/team`, data),

  // Send an invitation to a developer for a contract
  inviteDeveloper: (contractId, data) =>
    api.post(`/contracts/${contractId}/invitations`, data),
};

export const proposalService = {
  createProposal: (contractId, data) =>
    api.post(`/contracts/${contractId}/proposals`, data),

  getContractProposals: (contractId) =>
    api.get(`/contracts/${contractId}/proposals`),

  acceptProposal: (contractId, proposalId) =>
    api.patch(`/contracts/${contractId}/proposals/${proposalId}/accept`),

  declineProposal: (contractId, proposalId, data = {}) =>
    api.patch(`/contracts/${contractId}/proposals/${proposalId}/decline`, data),

  getMyProposals: () => api.get("/proposals/me"),

  acceptInvitation: (proposalId) =>
    api.patch(`/proposals/${proposalId}/accept`),

  declineInvitation: (proposalId, data = {}) =>
    api.patch(`/proposals/${proposalId}/decline`, data),

  withdrawProposal: (proposalId) =>
    api.patch(`/proposals/${proposalId}/withdraw`),
};

// === SOFTWARE APPLICATIONS (/api/v1/applications) ===
// NOTE: This is NOT job proposals — it's the software app/project being worked on.
// A contract must reference an appID from this model.
export const applicationService = {
  // Create a new software application record
  createApplication: (data) => api.post("/applications", data),

  // List all applications
  getApplications: () => api.get("/applications"),

  // Get a specific application
  getApplicationById: (id) => api.get(`/applications/${id}`),

  // Update an application
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),

  // Delete an application
  deleteApplication: (id) => api.delete(`/applications/${id}`),
};
