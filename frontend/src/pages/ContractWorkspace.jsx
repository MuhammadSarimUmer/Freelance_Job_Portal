import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { contractService } from "../api/services/contractService";
import { milestoneService } from "../api/services/milestoneService";
import { bugService } from "../api/services/bugService";
import { useAuth } from "../context/AuthContext";
import ContractChat from "../components/ui/ContractChat";
import ReviewModal from "../components/ui/ReviewModal";
import DisputeModal from "../components/ui/DisputeModal";
import { skillsService } from "../api/services/skillsService";
import { reviewService } from "../api/services/reviewService";
import { disputeService } from "../api/services/disputeService";
import { profileService } from "../api/services/profileService";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/ui/ConfirmDialog";

function ContractWorkspace() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("milestones");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [existingReviews, setExistingReviews] = useState([]);
  const [isFetchingReview, setIsFetchingReview] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [isLoadingDisputes, setIsLoadingDisputes] = useState(false);
  const [disputeEdits, setDisputeEdits] = useState({});
  const [isSavingDisputeId, setIsSavingDisputeId] = useState(null);
  const [teamRoleEdits, setTeamRoleEdits] = useState({});
  const [teamShareEdits, setTeamShareEdits] = useState({});
  const [updatingShareId, setUpdatingShareId] = useState(null);
  const [techOptions, setTechOptions] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [removingTechId, setRemovingTechId] = useState(null);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
    milestoneAmount: "",
    assigneeIDs: [],
  });
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
  const [newBug, setNewBug] = useState({ title: "", description: "", severity: "MINOR" });
  const [isCreatingBug, setIsCreatingBug] = useState(false);
  const [updatingBugId, setUpdatingBugId] = useState(null);
  const [deletingBugId, setDeletingBugId] = useState(null);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState(null);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState(null);
  const [confirmDeleteMilestoneId, setConfirmDeleteMilestoneId] = useState(null);
  const [developerOptions, setDeveloperOptions] = useState([]);
  const [confirmDeleteBugId, setConfirmDeleteBugId] = useState(null);
  const [confirmRemoveAssignmentId, setConfirmRemoveAssignmentId] = useState(null);
  const [requestingLeaveId, setRequestingLeaveId] = useState(null);
  const [assignForm, setAssignForm] = useState({
    developerID: "",
    role: "DEVELOPER",
    contributionPercentage: "0",
    paymentShare: "0",
  });
  const [isAssigning, setIsAssigning] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const statusLabelMap = {
    DRAFT: "OPEN",
    SIGNED: "SIGNED",
    IN_PROGRESS: "IN PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  };

  const isDeveloper = user?.role === "DEVELOPER";
  const isClient = user?.role === "CLIENT";

  const parseShareValue = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  useEffect(() => {
    if (!contract?.contractID || !user?.userID) return;
    fetchMyReview();
    fetchDisputes();
  }, [contract?.contractID, user?.userID]);

  const assignments = contract?.assignments || [];
  const isOpenContract = ["DRAFT", "SIGNED"].includes(contract?.status);
  const isClosedContract = Boolean(contract?.status) && !isOpenContract;
  const shareValues = assignments.map((assignment) => {
    const draftValue = teamShareEdits[assignment.assignmentID];
    if (draftValue !== undefined) return parseShareValue(draftValue);
    if (assignment.paymentShare !== undefined && assignment.paymentShare !== null) {
      return parseShareValue(assignment.paymentShare);
    }
    return assignments.length === 1 ? 100 : 0;
  });
  const shareTotal = shareValues.reduce((sum, value) => sum + value, 0);
  const isShareTotalValid = assignments.length <= 1
    || (shareValues.every((share) => share > 0) && Math.abs(shareTotal - 100) <= 0.01);
  const canPublish = assignments.length > 0 && isShareTotalValid;

  const reviewedRevieweeIds = existingReviews
    .map((review) => review.reviewee?.userID || review.revieweeID)
    .filter(Boolean);
  const baseRevieweeOptions = isClient
    ? assignments.map((assignment) => ({
      value: assignment.developer?.userID,
      label: assignment.developer?.user?.fullName || "Developer",
    })).filter((option) => option.value)
    : contract?.client?.userID
      ? [{ value: contract.client.userID, label: contract.client?.user?.fullName || "Client" }]
      : [];
  const availableRevieweeOptions = baseRevieweeOptions.filter(
    (option) => !reviewedRevieweeIds.includes(option.value)
  );
  const canLeaveReview = contract?.status === "COMPLETED" && availableRevieweeOptions.length > 0;

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
    const next = {};
    (contract?.assignments || []).forEach((assignment) => {
      if (assignment?.assignmentID) {
        next[assignment.assignmentID] = assignment.role;
      }
    });
    setTeamRoleEdits(next);
  }, [contract?.assignments]);

  useEffect(() => {
    if (assignments.length !== 1) return;
    const onlyDeveloperId = assignments[0]?.developer?.developerID;
    setNewMilestone((prev) => {
      if (!onlyDeveloperId || prev.assigneeIDs.length > 0) return prev;
      return { ...prev, assigneeIDs: [onlyDeveloperId] };
    });
  }, [assignments]);

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
      const matches = reviews.filter((review) => review.contractID === contract.contractID);
      setExistingReviews(matches);
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

  const handleCreateMilestone = async () => {
    if (!contract?.contractID) return;
    if (!newMilestone.title || !newMilestone.dueDate || !newMilestone.milestoneAmount) {
      addToast("Provide title, due date, and amount.", "error");
      return;
    }

    const teamDeveloperIds = assignments
      .map((assignment) => assignment.developer?.developerID)
      .filter(Boolean);
    const uniqueAssignees = Array.from(new Set(newMilestone.assigneeIDs.filter(Boolean)));

    if (teamDeveloperIds.length > 1) {
      if (uniqueAssignees.length === 0) {
        addToast("Select at least one team member for this milestone.", "error");
        return;
      }
      if (uniqueAssignees.length > 1 && uniqueAssignees.length !== teamDeveloperIds.length) {
        addToast("Shared milestones must include all team members.", "error");
        return;
      }
    }

    setIsCreatingMilestone(true);
    try {
      await milestoneService.createMilestone({
        contractID: contract.contractID,
        title: newMilestone.title,
        description: newMilestone.description,
        dueDate: newMilestone.dueDate,
        milestoneAmount: Number(newMilestone.milestoneAmount),
        assigneeIDs: uniqueAssignees,
      });
      setNewMilestone({
        title: "",
        description: "",
        dueDate: "",
        milestoneAmount: "",
        assigneeIDs: assignments.length === 1 && assignments[0]?.developer?.developerID
          ? [assignments[0].developer.developerID]
          : [],
      });
      await fetchContractDetails();
      addToast("Milestone created.", "success");
    } catch (err) {
      const apiMessage = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]?.msg;
      addToast(apiMessage || "Failed to create milestone.", "error");
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
    setDeletingMilestoneId(milestoneId);
    try {
      await milestoneService.deleteMilestone(milestoneId);
      await fetchContractDetails();
      addToast("Milestone deleted.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to delete milestone.", "error");
    } finally {
      setDeletingMilestoneId(null);
      setConfirmDeleteMilestoneId(null);
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
    setDeletingBugId(bugId);
    try {
      await bugService.deleteBug(bugId);
      await fetchContractDetails();
      addToast("Bug deleted.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to delete bug.", "error");
    } finally {
      setDeletingBugId(null);
      setConfirmDeleteBugId(null);
    }
  };

  const handleAssignDeveloper = async () => {
    if (!contract?.contractID) return;
    if (isClosedContract) {
      addToast("Contract is no longer open for new team members.", "error");
      return;
    }
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

  const handlePublishContract = async () => {
    if (!contract?.contractID) return;
    if (!canPublish) {
      addToast("Set payment shares to total 100% before publishing.", "error");
      return;
    }

    setIsPublishing(true);
    try {
      await contractService.updateContractStatus(contract.contractID, "IN_PROGRESS");
      await fetchContractDetails();
      addToast("Contract published.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to publish contract.", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleShareBlur = async (assignmentId) => {
    const rawValue = teamShareEdits[assignmentId];
    if (rawValue === undefined) return;

    const nextValue = Number(rawValue);
    if (Number.isNaN(nextValue)) {
      addToast("Payment share must be a valid number.", "error");
      return;
    }

    if (nextValue < 0 || nextValue > 100) {
      addToast("Payment share must be between 0 and 100.", "error");
      return;
    }

    setUpdatingShareId(assignmentId);
    try {
      await contractService.updateTeamMember(assignmentId, { paymentShare: nextValue });
      await fetchContractDetails();
      addToast("Payment share updated.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update payment share.", "error");
    } finally {
      setUpdatingShareId(null);
    }
  };

  const handleRequestLeave = async (assignmentId) => {
    if (!assignmentId) return;
    setRequestingLeaveId(assignmentId);
    try {
      await contractService.requestTeamMemberLeave(assignmentId);
      await fetchContractDetails();
      addToast("Leave request submitted.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to request leave.", "error");
    } finally {
      setRequestingLeaveId(null);
    }
  };

  const handleRemoveTeamMember = async (assignmentId) => {
    if (!assignmentId) return;
    try {
      await contractService.removeTeamMember(assignmentId);
      await fetchContractDetails();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to remove team member.", "error");
    } finally {
      setConfirmRemoveAssignmentId(null);
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
        .escrow-callout {
          background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0));
          border: 1px solid var(--color-outline-variant);
          border-radius: 10px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          display: grid;
          gap: 0.35rem;
        }
        .escrow-cta {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
          color: var(--color-on-primary);
          border: none;
          border-radius: 6px;
          padding: 0.45rem 0.9rem;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.02em;
          box-shadow: 0 10px 20px rgba(0,0,0,0.25);
        }
        .escrow-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          align-items: center;
          padding: 0.6rem 0.75rem;
          border-radius: 8px;
          background: var(--color-surface-container-high);
          border: 1px dashed var(--color-outline-variant);
        }
        .escrow-actions-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 700;
          color: var(--color-secondary);
          margin-right: 0.35rem;
        }
        .escrow-action {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.9rem;
          border-radius: 6px;
          font-family: var(--font-headline);
          font-weight: 600;
          border: 1px solid var(--color-outline-variant);
          background: var(--color-surface-container-highest);
          color: var(--color-on-surface);
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0,0,0,0.2);
        }
        .escrow-action.release {
          background: linear-gradient(135deg, var(--color-secondary), var(--color-surface-container-highest));
          color: var(--color-on-secondary);
          border: none;
        }
        .escrow-action.refund {
          border: 1px solid var(--color-error);
          color: var(--color-error);
          background: transparent;
        }
        .escrow-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
        .escrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          border: 1px solid var(--color-outline-variant);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 700;
        }
      `}</style>
      
      <Sidebar
        activePage={isClient ? "Applications" : "My Proposals"}
        role={user?.role?.toLowerCase() || "developer"}
      />
      
      {reviewModalOpen && contract && (
        <ReviewModal
          contract={contract}
          revieweeOptions={availableRevieweeOptions}
          defaultRevieweeId={!isClient && contract.client?.userID ? contract.client.userID : undefined}
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

      <ConfirmDialog
        open={Boolean(confirmDeleteMilestoneId)}
        title="Delete milestone"
        message="This will permanently remove the milestone and any escrow history. This action cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => handleDeleteMilestone(confirmDeleteMilestoneId)}
        onCancel={() => setConfirmDeleteMilestoneId(null)}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteBugId)}
        title="Delete bug report"
        message="This will permanently remove the bug report. This action cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => handleDeleteBug(confirmDeleteBugId)}
        onCancel={() => setConfirmDeleteBugId(null)}
      />

      <ConfirmDialog
        open={Boolean(confirmRemoveAssignmentId)}
        title="Remove developer"
        message="This will remove the developer from the contract team. Continue?"
        confirmLabel="Remove"
        tone="danger"
        onConfirm={() => handleRemoveTeamMember(confirmRemoveAssignmentId)}
        onCancel={() => setConfirmRemoveAssignmentId(null)}
      />

      <main className="sidebar-layout-main" style={{ marginLeft: "256px", flex: 1, padding: "calc(96px + 3rem) 3rem 3rem 3rem" }}>
        
          {isLoading ? (
            <p style={{ color: "var(--color-on-surface-variant)" }}>Loading contract...</p>
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
                  Status: {statusLabelMap[contract.status] || contract.status.replace('_', ' ')} • Budget: ${contract.totalAmount ?? contract.budget ?? 0}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {isClient && isOpenContract ? (
                  <button
                    type="button"
                    onClick={handlePublishContract}
                    disabled={isPublishing || !canPublish}
                    style={{
                      background: "var(--color-primary-container)",
                      color: "var(--color-on-primary-container)",
                      border: "none",
                      borderRadius: 6,
                      padding: "0.7rem 1.2rem",
                      cursor: isPublishing || !canPublish ? "not-allowed" : "pointer",
                      fontFamily: "var(--font-headline)",
                      opacity: isPublishing || !canPublish ? 0.7 : 1,
                    }}
                  >
                    {isPublishing ? "Publishing..." : "Publish Contract"}
                  </button>
                              onClick={() => setConfirmDeleteBugId(bug.bugID)}
                {canLeaveReview ? (
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
                  {user?.role === "CLIENT" ? (
                    <div className="escrow-callout">
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-secondary)", fontWeight: 700 }}>
                        Escrow simulation
                      </span>
                      <span style={{ color: "var(--color-on-surface-variant)", fontSize: "0.9rem" }}>
                        Funding a milestone creates an escrow record immediately. No real payment is processed.
                      </span>
                      <span style={{ color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>
                        Release is available after a milestone is marked completed and shares total 100%.
                      </span>
                    </div>
                  ) : null}
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
                          <option value="" style={{ color: "#111", background: "#fff" }}>
                            Select technology
                          </option>
                          {techOptions.map((opt) => (
                            <option key={opt.techID} value={opt.techID} style={{ color: "#111", background: "#fff" }}>
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
                      {assignments.length > 0 ? (
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-outline)", fontFamily: "var(--font-label)" }}>
                            Assign to
                          </span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                            {assignments.map((assignment) => {
                              const devId = assignment.developer?.developerID;
                              const label = assignment.developer?.user?.fullName || "Developer";
                              const checked = devId ? newMilestone.assigneeIDs.includes(devId) : false;
                              return (
                                <label key={assignment.assignmentID} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-on-surface)", fontSize: "0.85rem" }}>
                                  <input
                                    type="checkbox"
                                    disabled={!devId}
                                    checked={checked}
                                    onChange={() => {
                                      if (!devId) return;
                                      setNewMilestone((prev) => ({
                                        ...prev,
                                        assigneeIDs: prev.assigneeIDs.includes(devId)
                                          ? prev.assigneeIDs.filter((id) => id !== devId)
                                          : [...prev.assigneeIDs, devId],
                                      }));
                                    }}
                                  />
                                  {label}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
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
                        const escrowStatus = m.escrow?.paymentStatus || "NOT_FUNDED";
                        const escrowLabelMap = {
                          NOT_FUNDED: "Not funded",
                          PENDING: "Pending",
                          DEPOSITED: "Funded",
                          RELEASED: "Released",
                          REFUNDED: "Refunded",
                        };
                        const escrowToneMap = {
                          NOT_FUNDED: "var(--color-outline)",
                          PENDING: "var(--color-secondary)",
                          DEPOSITED: "var(--color-primary)",
                          RELEASED: "var(--color-secondary)",
                          REFUNDED: "var(--color-error)",
                        };
                        const escrowLabel = escrowLabelMap[escrowStatus] || escrowStatus;
                        const escrowAccent = escrowToneMap[escrowStatus] || "var(--color-outline)";
                        const escrowAmount = m.escrow?.depositAmount
                          ? Number(m.escrow.depositAmount)
                          : null;
                        const escrowAmountLabel = Number.isFinite(escrowAmount)
                          ? `$${escrowAmount.toFixed(2)}`
                          : null;
                        const assigneeNames = (m.assignments || [])
                          .map((assignment) => assignment.developer?.user?.fullName || "Developer")
                          .filter(Boolean);
                        const scopeLabel = m.scope === "SHARED" || assigneeNames.length > 1
                          ? "Shared"
                          : "Individual";
                        return (
                          <div key={m.milestoneID || m.title} style={{ padding: "1rem", border: "1px solid var(--color-outline-variant)", borderRadius: 6, background: "var(--color-surface-container)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                              <div>
                                <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontWeight: 700 }}>{m.title}</p>
                                <p style={{ margin: "0.35rem 0", color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>{m.description || "No description"}</p>
                                <p style={{ margin: "0.25rem 0", color: "var(--color-outline)", fontSize: "0.75rem" }}>
                                  {scopeLabel} milestone{assigneeNames.length > 0 ? ` • ${assigneeNames.join(", ")}` : ""}
                                </p>
                                <p style={{ margin: 0, color: "var(--color-outline)", fontSize: "0.75rem" }}>Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "N/A"}</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                                  <span className="escrow-pill" style={{ borderColor: escrowAccent, color: escrowAccent }}>
                                    Escrow: {escrowLabel}
                                  </span>
                                  <span style={{ color: "var(--color-outline)", fontSize: "0.75rem" }}>
                                    {escrowAmountLabel ? `Deposited ${escrowAmountLabel}` : "No funds held yet"}
                                  </span>
                                </div>
                              </div>
                              <div style={{ minWidth: 160, textAlign: "right" }}>
                                <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontWeight: 700 }}>${Number(m.milestoneAmount || 0)}</p>
                                <select
                                  value={m.status || "PENDING"}
                                  onChange={(e) => handleUpdateMilestoneStatus(m.milestoneID, e.target.value)}
                                  disabled={updatingMilestoneId === m.milestoneID || (isDeveloper && m.status === "COMPLETED")}
                                  style={{ marginTop: "0.5rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4, padding: "4px 8px" }}
                                >
                                  <option value="PENDING" disabled={isDeveloper}>Pending</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="IN_REVIEW">In Review</option>
                                  <option value="COMPLETED" disabled={isDeveloper}>Completed</option>
                                </select>
                              </div>
                            </div>
                            <div style={{ marginTop: "0.9rem" }}>
                              {user?.role === "CLIENT" ? (
                                <div className="escrow-actions">
                                  <span className="escrow-actions-label">Escrow actions</span>
                                  <span style={{ color: "var(--color-on-surface-variant)", fontSize: "0.8rem" }}>
                                    Fund, release, and refund from the Escrow page.
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteMilestoneId(m.milestoneID)}
                                    disabled={deletingMilestoneId === m.milestoneID}
                                    className="escrow-action"
                                    style={{ color: "var(--color-error)", borderColor: "var(--color-error)" }}
                                  >
                                    {deletingMilestoneId === m.milestoneID ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
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
                  {assignments.length === 1 ? (
                    <p style={{ marginTop: 0, color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>
                      Single-member teams receive 100% of milestone payouts automatically.
                    </p>
                  ) : null}
                  {isClient && assignments.length > 1 ? (
                    <p
                      style={{
                        marginTop: 0,
                        color: isShareTotalValid ? "var(--color-secondary)" : "var(--color-error)",
                        fontSize: "0.85rem",
                      }}
                    >
                      Total payment share: {Math.round(shareTotal * 100) / 100}% (must equal 100% before publishing).
                    </p>
                  ) : null}
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
                          {user?.role === "CLIENT" || isDeveloper ? <th style={{ padding: "8px 0" }}></th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {contract.assignments.map((a) => {
                          const shareInputValue = teamShareEdits[a.assignmentID]
                            ?? (a.paymentShare ?? (assignments.length === 1 ? 100 : ""));
                          const canEditShare = isClient && isOpenContract && assignments.length > 1;
                          const canRemove = isClient && (!isClosedContract || a.leaveRequestedAt);
                          const removeLabel = !isClosedContract
                            ? "Remove"
                            : a.leaveRequestedAt
                              ? "Approve Leave"
                              : "Awaiting Leave";

                          return (
                            <tr key={a.assignmentID || a.developer?.developerID || a.developer?.userID} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                              <td style={{ padding: "12px 0" }}>{a.developer?.user?.fullName || "Developer"}</td>
                              <td style={{ padding: "12px 0" }}>
                                {isClient ? (
                                  <select
                                    value={teamRoleEdits[a.assignmentID] ?? a.role ?? "DEVELOPER"}
                                    onChange={async (e) => {
                                      const nextRole = e.target.value;
                                      const previousRole = teamRoleEdits[a.assignmentID] ?? a.role;
                                      setTeamRoleEdits((prev) => ({
                                        ...prev,
                                        [a.assignmentID]: nextRole,
                                      }));
                                      try {
                                        await contractService.updateTeamMember(a.assignmentID, { role: nextRole });
                                        fetchContractDetails();
                                      } catch (err) {
                                        setTeamRoleEdits((prev) => ({
                                          ...prev,
                                          [a.assignmentID]: previousRole,
                                        }));
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
                              <td style={{ padding: "12px 0" }}>
                                {canEditShare ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={shareInputValue}
                                    onChange={(e) =>
                                      setTeamShareEdits((prev) => ({
                                        ...prev,
                                        [a.assignmentID]: e.target.value,
                                      }))
                                    }
                                    onBlur={() => handleShareBlur(a.assignmentID)}
                                    disabled={updatingShareId === a.assignmentID}
                                    style={{
                                      width: "90px",
                                      padding: "4px 8px",
                                      background: "var(--color-surface)",
                                      color: "var(--color-on-surface)",
                                      border: "1px solid var(--color-outline-variant)",
                                      borderRadius: 4,
                                    }}
                                  />
                                ) : (
                                  <span>
                                    {parseShareValue(shareInputValue)}%
                                  </span>
                                )}
                              </td>
                              {isClient ? (
                                <td style={{ padding: "12px 0", textAlign: "right" }}>
                                  <button
                                    onClick={() => {
                                      if (!canRemove) return;
                                      setConfirmRemoveAssignmentId(a.assignmentID);
                                    }}
                                    disabled={!canRemove}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: canRemove ? "var(--color-error)" : "var(--color-outline)",
                                      cursor: canRemove ? "pointer" : "not-allowed",
                                      fontSize: 13,
                                    }}
                                  >
                                    {removeLabel}
                                  </button>
                                </td>
                              ) : isDeveloper ? (
                                <td style={{ padding: "12px 0", textAlign: "right" }}>
                                  {isClosedContract ? (
                                    <button
                                      onClick={() => handleRequestLeave(a.assignmentID)}
                                      disabled={Boolean(a.leaveRequestedAt) || requestingLeaveId === a.assignmentID}
                                      style={{
                                        background: "none",
                                        border: "1px solid var(--color-outline-variant)",
                                        borderRadius: 4,
                                        color: "var(--color-on-surface)",
                                        padding: "4px 8px",
                                        cursor: a.leaveRequestedAt || requestingLeaveId === a.assignmentID ? "not-allowed" : "pointer",
                                        fontSize: 13,
                                      }}
                                    >
                                      {a.leaveRequestedAt ? "Leave Requested" : requestingLeaveId === a.assignmentID ? "Requesting..." : "Request Leave"}
                                    </button>
                                  ) : null}
                                </td>
                              ) : null}
                            </tr>
                          );
                        })}
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
                            Raised by {dispute.raisedBy?.fullName || "A team member"}
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
