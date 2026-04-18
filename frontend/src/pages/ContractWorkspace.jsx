import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { contractService } from "../api/services/contractService";
import { milestoneService } from "../api/services/milestoneService";
import { bugService } from "../api/services/bugService";
import { escrowService } from "../api/services/escrowService";
import { useAuth } from "../context/AuthContext";
import EscrowModal from "../components/ui/EscrowModal";
import ContractChat from "../components/ui/ContractChat";
import ReviewModal from "../components/ui/ReviewModal";
import DisputeModal from "../components/ui/DisputeModal";
import { skillsService } from "../api/services/skillsService";
import { reviewService } from "../api/services/reviewService";
import { disputeService } from "../api/services/disputeService";
import { profileService } from "../api/services/profileService";
import { useToast } from "../context/ToastContext";

function ContractWorkspace() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("milestones");
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [escrowMilestoneId, setEscrowMilestoneId] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [isFetchingReview, setIsFetchingReview] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [isLoadingDisputes, setIsLoadingDisputes] = useState(false);
  const [disputeEdits, setDisputeEdits] = useState({});
  const [isSavingDisputeId, setIsSavingDisputeId] = useState(null);
  const [techOptions, setTechOptions] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [removingTechId, setRemovingTechId] = useState(null);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
    milestoneAmount: "",
  });
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
  const [newBug, setNewBug] = useState({ title: "", description: "", severity: "MINOR" });
  const [isCreatingBug, setIsCreatingBug] = useState(false);
  const [updatingBugId, setUpdatingBugId] = useState(null);
  const [deletingBugId, setDeletingBugId] = useState(null);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState(null);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState(null);
  const [refundingEscrowId, setRefundingEscrowId] = useState(null);
  const [developerOptions, setDeveloperOptions] = useState([]);
  const [assignForm, setAssignForm] = useState({
    developerID: "",
    role: "DEVELOPER",
    contributionPercentage: "0",
    paymentShare: "0",
  });
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  useEffect(() => {
    if (!contract?.contractID || !user?.userID) return;
    fetchMyReview();
    fetchDisputes();
  }, [contract?.contractID, user?.userID]);

  useEffect(() => {
    if (user?.role !== "CLIENT") return;
    const fetchDevelopers = async () => {
      try {
        const res = await profileService.getAllDevelopers();
        setDeveloperOptions(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load developers", err);
      }
    };
    fetchDevelopers();
  }, [user?.role]);

  useEffect(() => {
    const next = {};
    disputes.forEach((dispute) => {
      next[dispute.disputeID] = {
        status: dispute.status,
        resolution: dispute.resolution || "",
      };
    });
    setDisputeEdits(next);
  }, [disputes]);

  useEffect(() => {
    const fetchTechOptions = async () => {
      try {
        const res = await skillsService.getAllTechnologies();
        setTechOptions(res.data?.data || []);
      } catch (err) {
        addToast(err?.response?.data?.message || "Failed to load tech options.", "error");
      }
    };
    fetchTechOptions();
  }, [addToast]);

  const fetchContractDetails = async () => {
    try {
      setIsLoading(true);
      setLoadError("");
      const res = await contractService.getContractById(id);
      if (res.data) setContract(res.data.data);
    } catch (err) {
      console.error(err);
      setLoadError(err?.response?.data?.message || "Failed to load contract workspace.");
      setContract(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyReview = async () => {
    if (!contract?.contractID) return;
    setIsFetchingReview(true);
    try {
      const res = await reviewService.getMyReviews();
      const reviews = res.data?.data || [];
      const match = reviews.find((review) => review.contractID === contract.contractID);
      setExistingReview(match || null);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setIsFetchingReview(false);
    }
  };

  const fetchDisputes = async () => {
    if (!contract?.contractID) return;
    setIsLoadingDisputes(true);
    try {
      const res = await disputeService.getDisputesForContract(contract.contractID);
      setDisputes(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load disputes", err);
    } finally {
      setIsLoadingDisputes(false);
    }
  };

  const handleAddRequiredTech = async () => {
    if (!contract?.contractID) return;
    if (!selectedTechId) {
      addToast("Select a technology to add.", "error");
      return;
    }
    const existingIds = (contract.technologies || contract.requiredTechs || [])
      .map((t) => t.techID || t.tech?.techID)
      .filter(Boolean);
    if (existingIds.includes(selectedTechId)) {
      addToast("This technology is already required.", "error");
      return;
    }

    setIsAddingTech(true);
    try {
      await contractService.addRequiredTech(contract.contractID, {
        techID: selectedTechId,
        requiredLevel: "INTERMEDIATE",
        purpose: "Required for project delivery",
      });
      setSelectedTechId("");
      await fetchContractDetails();
      addToast("Technology added.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to add technology.", "error");
    } finally {
      setIsAddingTech(false);
    }
  };

  const handleRemoveRequiredTech = async (techId) => {
    if (!contract?.contractID || !techId) return;
    setRemovingTechId(techId);
    try {
      await contractService.removeRequiredTech(contract.contractID, techId);
      await fetchContractDetails();
      addToast("Technology removed.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to remove technology.", "error");
    } finally {
      setRemovingTechId(null);
    }
  };

  const openEscrowForMilestone = (milestoneId) => {
    if (!milestoneId) {
      addToast("Select a milestone to fund escrow.", "error");
      return;
    }
    setEscrowMilestoneId(milestoneId);
    setEscrowModalOpen(true);
  };

  const handleCreateMilestone = async () => {
    if (!contract?.contractID) return;
    if (!newMilestone.title || !newMilestone.dueDate || !newMilestone.milestoneAmount) {
      addToast("Provide title, due date, and amount.", "error");
      return;
    }

    setIsCreatingMilestone(true);
    try {
      await milestoneService.createMilestone({
        contractID: contract.contractID,
        title: newMilestone.title,
        description: newMilestone.description,
        dueDate: newMilestone.dueDate,
        milestoneAmount: Number(newMilestone.milestoneAmount),
      });
      setNewMilestone({ title: "", description: "", dueDate: "", milestoneAmount: "" });
      await fetchContractDetails();
      addToast("Milestone created.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to create milestone.", "error");
    } finally {
      setIsCreatingMilestone(false);
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId, status) => {
    if (!milestoneId) return;
    setUpdatingMilestoneId(milestoneId);
    try {
      await milestoneService.updateMilestoneStatus(milestoneId, status);
      await fetchContractDetails();
      addToast("Milestone status updated.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update milestone.", "error");
    } finally {
      setUpdatingMilestoneId(null);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!milestoneId) return;
    if (!window.confirm("Delete this milestone?")) return;
    setDeletingMilestoneId(milestoneId);
    try {
      await milestoneService.deleteMilestone(milestoneId);
      await fetchContractDetails();
      addToast("Milestone deleted.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to delete milestone.", "error");
    } finally {
      setDeletingMilestoneId(null);
    }
  };

  const handleReleaseEscrow = async (escrowId) => {
    if (!escrowId) return;
    try {
      await escrowService.releaseEscrow(escrowId);
      await fetchContractDetails();
      addToast("Escrow released.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to release escrow.", "error");
    }
  };

  const handleRefundEscrow = async (escrowId) => {
    if (!escrowId) return;
    setRefundingEscrowId(escrowId);
    try {
      await escrowService.refundEscrow(escrowId);
      await fetchContractDetails();
      addToast("Escrow refunded.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to refund escrow.", "error");
    } finally {
      setRefundingEscrowId(null);
    }
  };

  const handleReportBug = async () => {
    if (!contract?.contractID) return;
    if (!newBug.title) {
      addToast("Bug title is required.", "error");
      return;
    }
    setIsCreatingBug(true);
    try {
      await bugService.createBug({
        contractID: contract.contractID,
        title: newBug.title,
        description: newBug.description,
        severity: newBug.severity,
      });
      setNewBug({ title: "", description: "", severity: "MINOR" });
      await fetchContractDetails();
      addToast("Bug reported.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to report bug.", "error");
    } finally {
      setIsCreatingBug(false);
    }
  };

  const handleUpdateBugStatus = async (bugId, status) => {
    if (!bugId) return;
    setUpdatingBugId(bugId);
    try {
      await bugService.updateBugStatus(bugId, status);
      await fetchContractDetails();
      addToast("Bug status updated.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update bug.", "error");
    } finally {
      setUpdatingBugId(null);
    }
  };

  const handleDeleteBug = async (bugId) => {
    if (!bugId) return;
    if (!window.confirm("Delete this bug report?")) return;
    setDeletingBugId(bugId);
    try {
      await bugService.deleteBug(bugId);
      await fetchContractDetails();
      addToast("Bug deleted.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to delete bug.", "error");
    } finally {
      setDeletingBugId(null);
    }
  };

  const handleAssignDeveloper = async () => {
    if (!contract?.contractID) return;
    if (!assignForm.developerID) {
      addToast("Select a developer to assign.", "error");
      return;
    }
    if (!assignForm.role) {
      addToast("Select a role.", "error");
      return;
    }

    setIsAssigning(true);
    try {
      await contractService.assignDeveloper(contract.contractID, {
        developerID: assignForm.developerID,
        role: assignForm.role,
        contributionPercentage: Number(assignForm.contributionPercentage || 0),
        paymentShare: Number(assignForm.paymentShare || 0),
      });
      addToast("Developer assigned.", "success");
      setAssignForm({ developerID: "", role: "DEVELOPER", contributionPercentage: "0", paymentShare: "0" });
      await fetchContractDetails();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to assign developer.", "error");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleResolveDispute = async (disputeId) => {
    const payload = disputeEdits[disputeId];
    if (!payload?.status) {
      addToast("Select a dispute status.", "error");
      return;
    }
    setIsSavingDisputeId(disputeId);
    try {
      await disputeService.resolveDispute(disputeId, {
        status: payload.status,
        resolution: payload.resolution,
      });
      addToast("Dispute updated.", "success");
      await fetchDisputes();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update dispute.", "error");
    } finally {
      setIsSavingDisputeId(null);
    }
  };

  return (
    <>
      <style>{`
        .workspace-tab {
          padding: 1rem 2rem;
          cursor: pointer;
          font-family: var(--font-headline);
          font-weight: 500;
          color: var(--color-on-surface-variant);
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .workspace-tab.active {
          color: var(--color-on-surface);
          border-bottom: 2px solid var(--color-primary);
        }
        .ambient-card {
          background: var(--color-surface-container-low);
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .neon-btn {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
          color: var(--color-on-primary);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-family: var(--font-headline);
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }
        .neon-btn:hover { opacity: 0.9; }
      `}</style>
      
      <Sidebar activePage="Contracts" role={user?.role?.toLowerCase() || "developer"} />
      
      {escrowModalOpen && (
        <EscrowModal
          milestoneId={escrowMilestoneId}
          onClose={() => setEscrowModalOpen(false)}
        />
      )}

      {reviewModalOpen && contract && (
        <ReviewModal
          contract={contract}
          revieweeOptions={(user?.role === "CLIENT"
            ? (contract.assignments || []).map((assignment) => ({
              value: assignment.developer?.userID,
              label: assignment.developer?.user?.fullName || "Developer",
            }))
            : [{
              value: contract.client?.userID,
              label: contract.client?.user?.fullName || "Client",
            }]
          ).filter((option) => option.value)}
          defaultRevieweeId={user?.role === "DEVELOPER" ? contract.client?.userID : undefined}
          onClose={() => setReviewModalOpen(false)}
          onSubmitted={fetchMyReview}
        />
      )}

      {disputeModalOpen && contract && (
        <DisputeModal
          contractID={contract.contractID}
          onClose={() => setDisputeModalOpen(false)}
          onSubmitted={fetchDisputes}
        />
      )}

      <main className="sidebar-layout-main" style={{ marginLeft: "256px", flex: 1, padding: "calc(96px + 3rem) 3rem 3rem 3rem" }}>
        
        {isLoading ? (
           <p style={{ color: "var(--color-on-surface-variant)" }}>Loading workspace matrix...</p>
        ) : loadError ? (
           <p style={{ color: "var(--color-error)" }}>{loadError}</p>
        ) : !contract ? (
           <p style={{ color: "var(--color-on-surface-variant)" }}>Contract unavailable.</p>
        ) : (
          <div className="anim-fade-in">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "3rem", margin: 0, color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
                  {contract.title}
                </h1>
                <p style={{ color: "var(--color-primary)", marginTop: "0.5rem", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem" }}>
                  Status: {contract.status.replace('_', ' ')} • Budget: ${contract.totalAmount ?? contract.budget ?? 0}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button
                  className="neon-btn"
                  onClick={() => openEscrowForMilestone(contract?.milestones?.[0]?.milestoneID)}
                >
                  Manage Escrow
                </button>
                {contract.status === "COMPLETED" && !existingReview ? (
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(true)}
                    disabled={isFetchingReview}
                    style={{
                      background: "var(--color-surface-container-highest)",
                      color: "var(--color-on-surface)",
                      border: "1px solid var(--color-outline-variant)",
                      borderRadius: 6,
                      padding: "0.7rem 1.2rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-headline)",
                    }}
                  >
                    Leave Review
                  </button>
                ) : null}
                {(() => {
                  const hasDepositedEscrow = contract.milestones?.some(
                    (milestone) => milestone.escrow?.paymentStatus === "DEPOSITED",
                  );
                  const hasOpenDispute = disputes.some((dispute) =>
                    ["OPEN", "UNDER_REVIEW"].includes(dispute.status),
                  );
                  const canRaiseDispute = contract.status === "IN_PROGRESS" && hasDepositedEscrow && !hasOpenDispute;

                  return (
                    <button
                      type="button"
                      onClick={() => setDisputeModalOpen(true)}
                      disabled={!canRaiseDispute || isLoadingDisputes}
                      style={{
                        background: "transparent",
                        color: canRaiseDispute ? "var(--color-on-surface)" : "var(--color-outline)",
                        border: "1px solid var(--color-outline-variant)",
                        borderRadius: 6,
                        padding: "0.7rem 1.2rem",
                        cursor: canRaiseDispute ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-headline)",
                      }}
                    >
                      {hasOpenDispute ? "Dispute Open" : "Raise Dispute"}
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--color-outline-variant)", marginBottom: "3rem" }}>
              {["milestones", "team", "bugs", "messages", "disputes"].map(tab => (
                <div 
                  key={tab}
                  className={`workspace-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>

            {/* Content Pane */}
            <div className="ambient-card">
              {activeTab === "milestones" && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "1rem" }}>Project Milestones</h2>
                  <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.1rem", marginBottom: "0.75rem" }}>
                      Required Tech Stack
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "0.75rem" }}>
                      {(contract.technologies || contract.requiredTechs || []).length > 0 ? (
                        (contract.technologies || contract.requiredTechs || []).map((t) => {
                          const techId = t.techID || t.tech?.techID;
                          const techName = t.tech?.techName || t.techName || techId || "Tech";
                          return (
                            <span
                              key={techId || techName}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                background: "var(--color-surface-container)",
                                padding: "4px 10px",
                                borderRadius: 4,
                              }}
                            >
                              {techName}
                              {user?.role === "CLIENT" ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRequiredTech(techId)}
                                  disabled={removingTechId === techId}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: removingTechId === techId ? "not-allowed" : "pointer",
                                    color: "var(--color-error)",
                                    fontWeight: 700,
                                  }}
                                >
                                  {removingTechId === techId ? "..." : "x"}
                                </button>
                              ) : null}
                            </span>
                          );
                        })
                      ) : (
                        <p style={{ color: "var(--color-on-surface-variant)" }}>No required technologies yet.</p>
                      )}
                    </div>

                    {user?.role === "CLIENT" ? (
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                        <select
                          value={selectedTechId}
                          onChange={(e) => setSelectedTechId(e.target.value)}
                          style={{
                            background: "var(--color-surface)",
                            color: "var(--color-on-surface)",
                            border: "1px solid var(--color-outline-variant)",
                            borderRadius: 4,
                            padding: "6px 10px",
                            minWidth: 220,
                          }}
                        >
                          <option value="">Select technology</option>
                          {techOptions.map((opt) => (
                            <option key={opt.techID} value={opt.techID}>
                              {opt.techName}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleAddRequiredTech}
                          disabled={isAddingTech}
                          style={{
                            background: "var(--color-secondary)",
                            color: "var(--color-on-secondary)",
                            border: "none",
                            borderRadius: 4,
                            padding: "6px 14px",
                            cursor: isAddingTech ? "not-allowed" : "pointer",
                            fontFamily: "var(--font-headline)",
                            fontWeight: 700,
                          }}
                        >
                          {isAddingTech ? "Adding..." : "Add Tech"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {user?.role === "CLIENT" ? (
                    <div style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
                      <h4 style={{ margin: 0, fontFamily: "var(--font-headline)" }}>New Milestone</h4>
                      <input
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Title"
                        style={{ padding: "0.65rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4 }}
                      />
                      <textarea
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        rows={3}
                        style={{ padding: "0.65rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4 }}
                      />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <input
                          type="date"
                          value={newMilestone.dueDate}
                          onChange={(e) => setNewMilestone((prev) => ({ ...prev, dueDate: e.target.value }))}
                          style={{ padding: "0.65rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4 }}
                        />
                        <input
                          type="number"
                          value={newMilestone.milestoneAmount}
                          onChange={(e) => setNewMilestone((prev) => ({ ...prev, milestoneAmount: e.target.value }))}
                          placeholder="Amount"
                          style={{ padding: "0.65rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4 }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateMilestone}
                        disabled={isCreatingMilestone}
                        style={{ background: "var(--color-secondary)", color: "var(--color-on-secondary)", border: "none", borderRadius: 4, padding: "0.6rem 1rem", cursor: isCreatingMilestone ? "not-allowed" : "pointer", fontFamily: "var(--font-headline)" }}
                      >
                        {isCreatingMilestone ? "Creating..." : "Add Milestone"}
                      </button>
                    </div>
                  ) : null}

                  {contract.milestones?.length > 0 ? (
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {contract.milestones.map((m) => {
                        const escrowId = m.escrow?.escrowID;
                        return (
                          <div key={m.milestoneID || m.title} style={{ padding: "1rem", border: "1px solid var(--color-outline-variant)", borderRadius: 6, background: "var(--color-surface-container)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                              <div>
                                <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontWeight: 700 }}>{m.title}</p>
                                <p style={{ margin: "0.35rem 0", color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>{m.description || "No description"}</p>
                                <p style={{ margin: 0, color: "var(--color-outline)", fontSize: "0.75rem" }}>Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "N/A"}</p>
                              </div>
                              <div style={{ minWidth: 160, textAlign: "right" }}>
                                <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontWeight: 700 }}>${Number(m.milestoneAmount || 0)}</p>
                                <select
                                  value={m.status || "PENDING"}
                                  onChange={(e) => handleUpdateMilestoneStatus(m.milestoneID, e.target.value)}
                                  disabled={updatingMilestoneId === m.milestoneID}
                                  style={{ marginTop: "0.5rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4, padding: "4px 8px" }}
                                >
                                  <option value="PENDING">Pending</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="IN_REVIEW">In Review</option>
                                  <option value="COMPLETED">Completed</option>
                                </select>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                              {user?.role === "CLIENT" ? (
                                <button
                                  type="button"
                                  onClick={() => openEscrowForMilestone(m.milestoneID)}
                                  style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)", border: "none", borderRadius: 4, padding: "0.4rem 0.75rem", cursor: "pointer" }}
                                >
                                  Fund Escrow
                                </button>
                              ) : null}
                              {user?.role === "CLIENT" && escrowId ? (
                                <button
                                  type="button"
                                  onClick={() => handleReleaseEscrow(escrowId)}
                                  style={{ background: "transparent", color: "var(--color-secondary)", border: "1px solid var(--color-outline-variant)", borderRadius: 4, padding: "0.4rem 0.75rem", cursor: "pointer" }}
                                >
                                  Release
                                </button>
                              ) : null}
                              {user?.role === "CLIENT" && escrowId && m.escrow?.paymentStatus !== "RELEASED" ? (
                                <button
                                  type="button"
                                  onClick={() => handleRefundEscrow(escrowId)}
                                  disabled={refundingEscrowId === escrowId}
                                  style={{ background: "transparent", color: "var(--color-error)", border: "1px solid var(--color-outline-variant)", borderRadius: 4, padding: "0.4rem 0.75rem", cursor: refundingEscrowId === escrowId ? "not-allowed" : "pointer" }}
                                >
                                  {refundingEscrowId === escrowId ? "Refunding..." : "Refund"}
                                </button>
                              ) : null}
                              {user?.role === "CLIENT" ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMilestone(m.milestoneID)}
                                  disabled={deletingMilestoneId === m.milestoneID}
                                  style={{ background: "none", border: "none", color: "var(--color-error)", cursor: deletingMilestoneId === m.milestoneID ? "not-allowed" : "pointer" }}
                                >
                                  {deletingMilestoneId === m.milestoneID ? "Deleting..." : "Delete"}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>No milestones defined yet.</p>
                  )}
                </div>
              )}

              {activeTab === "team" && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "1rem" }}>Assigned Team</h2>
                  {user?.role === "CLIENT" ? (
                    <div style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
                      <h4 style={{ margin: 0, fontFamily: "var(--font-headline)" }}>Assign Developer</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
                        <select
                          value={assignForm.developerID}
                          onChange={(e) => setAssignForm((prev) => ({ ...prev, developerID: e.target.value }))}
                          style={{ padding: "0.65rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4 }}
                        >
                          <option value="">Select developer</option>
                          {developerOptions.map((dev) => (
                            <option key={dev.developerID} value={dev.developerID}>
                              {dev.user?.fullName || dev.developerID}
                            </option>
                          ))}
                        </select>
                        <select
                          value={assignForm.role}
                          onChange={(e) => setAssignForm((prev) => ({ ...prev, role: e.target.value }))}
                          style={{ padding: "0.65rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4 }}
                        >
                          <option value="LEAD">Lead</option>
                          <option value="DEVELOPER">Developer</option>
                          <option value="REVIEWER">Reviewer</option>
                        </select>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <input
                          type="number"
                          value={assignForm.contributionPercentage}
                          onChange={(e) => setAssignForm((prev) => ({ ...prev, contributionPercentage: e.target.value }))}
                          placeholder="Contribution %"
                          style={{ padding: "0.65rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4 }}
                        />
                        <input
                          type="number"
                          value={assignForm.paymentShare}
                          onChange={(e) => setAssignForm((prev) => ({ ...prev, paymentShare: e.target.value }))}
                          placeholder="Payment %"
                          style={{ padding: "0.65rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4 }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAssignDeveloper}
                        disabled={isAssigning}
                        style={{ background: "var(--color-secondary)", color: "var(--color-on-secondary)", border: "none", borderRadius: 4, padding: "0.6rem 1rem", cursor: isAssigning ? "not-allowed" : "pointer", fontFamily: "var(--font-headline)" }}
                      >
                        {isAssigning ? "Assigning..." : "Assign Developer"}
                      </button>
                    </div>
                  ) : null}
                  {contract.assignments?.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "8px 0", color: "var(--color-on-surface-variant)", fontSize: 13 }}>Developer</th>
                          <th style={{ textAlign: "left", padding: "8px 0", color: "var(--color-on-surface-variant)", fontSize: 13 }}>Role</th>
                          <th style={{ textAlign: "left", padding: "8px 0", color: "var(--color-on-surface-variant)", fontSize: 13 }}>Pay Share</th>
                          {user?.role === "CLIENT" ? <th style={{ padding: "8px 0" }}></th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {contract.assignments.map((a) => (
                          <tr key={a.assignmentID || a.developer?.developerID || a.developer?.userID} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                            <td style={{ padding: "12px 0" }}>{a.developer?.user?.fullName || "Developer"}</td>
                            <td style={{ padding: "12px 0" }}>
                              {user?.role === "CLIENT" ? (
                                <select
                                  defaultValue={a.role}
                                  onChange={async (e) => {
                                    try {
                                      await contractService.updateTeamMember(a.assignmentID, { role: e.target.value });
                                      fetchContractDetails();
                                    } catch (err) {
                                      addToast(err?.response?.data?.message || "Failed to update team member.", "error");
                                    }
                                  }}
                                  style={{ background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4, padding: "4px 8px" }}
                                >
                                  <option value="LEAD">Lead</option>
                                  <option value="DEVELOPER">Developer</option>
                                  <option value="REVIEWER">Reviewer</option>
                                </select>
                              ) : a.role}
                            </td>
                            <td style={{ padding: "12px 0" }}>{a.paymentShare ?? a.contributionPercentage ?? "-"}%</td>
                            {user?.role === "CLIENT" ? (
                              <td style={{ padding: "12px 0", textAlign: "right" }}>
                                <button
                                  onClick={async () => {
                                    if (!window.confirm("Remove this developer from the team?")) return;
                                    try {
                                      await contractService.removeTeamMember(a.assignmentID);
                                      fetchContractDetails();
                                    } catch (err) {
                                      addToast(err?.response?.data?.message || "Failed to remove team member.", "error");
                                    }
                                  }}
                                  style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", fontSize: 13 }}
                                >
                                  Remove
                                </button>
                              </td>
                            ) : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>No developers assigned yet.</p>
                  )}
                </div>
              )}

              {activeTab === "bugs" && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "1rem" }}>Active Bug Reports</h2>
                  <div style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
                    <h4 style={{ margin: 0, fontFamily: "var(--font-headline)" }}>Report Bug</h4>
                    <input
                      value={newBug.title}
                      onChange={(e) => setNewBug((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Bug title"
                      style={{ padding: "0.65rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4 }}
                    />
                    <textarea
                      value={newBug.description}
                      onChange={(e) => setNewBug((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Bug description"
                      rows={3}
                      style={{ padding: "0.65rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4 }}
                    />
                    <select
                      value={newBug.severity}
                      onChange={(e) => setNewBug((prev) => ({ ...prev, severity: e.target.value }))}
                      style={{ background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4, padding: "6px 10px", maxWidth: 200 }}
                    >
                      <option value="LOW">Low</option>
                      <option value="MINOR">Minor</option>
                      <option value="MAJOR">Major</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleReportBug}
                      disabled={isCreatingBug}
                      style={{ background: "var(--color-secondary)", color: "var(--color-on-secondary)", border: "none", borderRadius: 4, padding: "0.6rem 1rem", cursor: isCreatingBug ? "not-allowed" : "pointer", fontFamily: "var(--font-headline)" }}
                    >
                      {isCreatingBug ? "Submitting..." : "Submit Bug"}
                    </button>
                  </div>

                  {contract.bugReports?.length > 0 ? (
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {contract.bugReports.map((bug) => (
                        <div key={bug.bugID || bug.title} style={{ padding: "1rem", border: "1px solid var(--color-outline-variant)", borderRadius: 6, background: "var(--color-surface-container)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                            <div>
                              <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontWeight: 700 }}>{bug.title}</p>
                              <p style={{ margin: "0.35rem 0", color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>{bug.description || "No description"}</p>
                            </div>
                            <div style={{ minWidth: 160, textAlign: "right" }}>
                              <select
                                value={bug.status || "REPORTED"}
                                onChange={(e) => handleUpdateBugStatus(bug.bugID, e.target.value)}
                                disabled={updatingBugId === bug.bugID}
                                style={{ background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4, padding: "4px 8px" }}
                              >
                                <option value="REPORTED">Reported</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                              </select>
                            </div>
                          </div>
                          <div style={{ marginTop: "0.75rem", textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteBug(bug.bugID)}
                              disabled={deletingBugId === bug.bugID}
                              style={{ background: "none", border: "none", color: "var(--color-error)", cursor: deletingBugId === bug.bugID ? "not-allowed" : "pointer" }}
                            >
                              {deletingBugId === bug.bugID ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>No bug reports created yet.</p>
                  )}
                </div>
              )}

              {activeTab === "messages" && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "1rem" }}>Contract Chat</h2>
                  <ContractChat contractID={id} currentUserId={user?.userID} />
                </div>
              )}

              {activeTab === "disputes" && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "1rem" }}>Disputes</h2>
                  {isLoadingDisputes ? (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>Loading disputes...</p>
                  ) : disputes.length > 0 ? (
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {disputes.map((dispute) => (
                        <div
                          key={dispute.disputeID}
                          style={{ padding: "1rem", border: "1px solid var(--color-outline-variant)", borderRadius: 6, background: "var(--color-surface-container)" }}
                        >
                          <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontWeight: 700 }}>
                            Raised by {dispute.raisedBy?.fullName || "Member"}
                          </p>
                          <p style={{ margin: "0.35rem 0", color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>
                            {dispute.reason}
                          </p>
                          <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
                            <select
                              value={disputeEdits[dispute.disputeID]?.status || dispute.status}
                              onChange={(e) =>
                                setDisputeEdits((prev) => ({
                                  ...prev,
                                  [dispute.disputeID]: {
                                    ...(prev[dispute.disputeID] || {}),
                                    status: e.target.value,
                                  },
                                }))
                              }
                              style={{ background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4, padding: "4px 8px", maxWidth: 220 }}
                            >
                              <option value="OPEN">Open</option>
                              <option value="UNDER_REVIEW">Under Review</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="CLOSED">Closed</option>
                            </select>
                            <textarea
                              value={disputeEdits[dispute.disputeID]?.resolution || ""}
                              onChange={(e) =>
                                setDisputeEdits((prev) => ({
                                  ...prev,
                                  [dispute.disputeID]: {
                                    ...(prev[dispute.disputeID] || {}),
                                    resolution: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Resolution notes"
                              rows={3}
                              style={{ background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4, padding: "0.5rem" }}
                            />
                            <button
                              type="button"
                              onClick={() => handleResolveDispute(dispute.disputeID)}
                              disabled={isSavingDisputeId === dispute.disputeID}
                              style={{ background: "var(--color-secondary)", color: "var(--color-on-secondary)", border: "none", borderRadius: 4, padding: "0.4rem 0.75rem", cursor: isSavingDisputeId === dispute.disputeID ? "not-allowed" : "pointer", fontFamily: "var(--font-headline)", maxWidth: 160 }}
                            >
                              {isSavingDisputeId === dispute.disputeID ? "Saving..." : "Update Dispute"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>No disputes yet.</p>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </>
  );
}

export default ContractWorkspace;
