import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import {
  milestoneFilters,
  milestoneStatusColors,
  milestoneEscrowColors,
} from "../data/mockData";
import { useToast } from "../context/ToastContext";
import { contractService } from "../api/services/contractService";
import { milestoneService } from "../api/services/milestoneService";

function Milestones() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { addToast } = useToast();

  const [milestonesData, setMilestonesData] = useState([]); // UI model
  const [contracts, setContracts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    contractID: "",
    title: "",
    description: "",
    dueDate: "",
    milestoneAmount: "",
    assigneeIDs: [],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState(null);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [editMilestoneForm, setEditMilestoneForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    milestoneAmount: "",
  });
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const selectedContract = useMemo(
    () => contracts.find((c) => c.contractID === newMilestone.contractID),
    [contracts, newMilestone.contractID]
  );
  const selectedAssignments = selectedContract?.assignments || [];

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString();
  };

  const mapMilestoneStatus = (backendStatus) => {
    switch (backendStatus) {
      case "COMPLETED":
        return "Completed";
      case "IN_PROGRESS":
        return "In Progress";
      case "PENDING":
        return "Pending";
      case "IN_REVIEW":
        return "Upcoming";
      default:
        return "Pending";
    }
  };

  const mapStatusToBackend = (uiStatus) => {
    switch (uiStatus) {
      case "Completed":
        return "COMPLETED";
      case "In Progress":
        return "IN_PROGRESS";
      case "Upcoming":
        return "IN_REVIEW";
      case "Pending":
      default:
        return "PENDING";
    }
  };

  const mapEscrowStatus = (paymentStatus) => {
    switch (paymentStatus) {
      case "RELEASED":
        return "Released";
      case "DEPOSITED":
        return "Held";
      case "REFUNDED":
      case "PENDING":
      default:
        return "Pending";
    }
  };

  const fetchMilestones = async () => {
    try {
      const [contractsRes, milestonesRes] = await Promise.all([
        contractService.getMyContracts(),
        milestoneService.getMilestones(),
      ]);

      const contractsData = contractsRes.data?.data || [];
      setContracts(contractsData);

      if (!newMilestone.contractID && contractsData.length > 0) {
        const firstContract = contractsData[0];
        const firstAssignments = firstContract?.assignments || [];
        const defaultAssignees = firstAssignments.length === 1 && firstAssignments[0]?.developer?.developerID
          ? [firstAssignments[0].developer.developerID]
          : [];
        setNewMilestone((prev) => ({
          ...prev,
          contractID: firstContract.contractID,
          assigneeIDs: defaultAssignees
        }));
      }

      const milestones = milestonesRes.data?.data || [];

      const derived = milestones.map((m) => {
        const escrow = m.escrow;
        const status = mapMilestoneStatus(m.status);
        const escrowStatus = escrow ? mapEscrowStatus(escrow.paymentStatus) : "Not Funded";
        const amountNum = Number(m.milestoneAmount ?? 0);
        const amount = `$${Number.isFinite(amountNum) ? amountNum.toFixed(2).replace(/\.00$/, "") : "0"}`;
        const assignees = (m.assignments || [])
          .map((assignment) => assignment.developer?.user?.fullName || "Developer")
          .filter(Boolean);
        const scope = m.scope === "SHARED" || assignees.length > 1 ? "Shared" : "Individual";

        return {
          milestoneId: m.milestoneID,
          contractId: m.contract?.contractID || "",
          contractTitle: m.contract?.title || "",
          title: m.title,
          description: m.description,
          dueDate: formatDate(m.dueDate) || "N/A",
          completeDate: formatDate(m.completeDate),
          amount,
          status,
          escrowStatus,
          assignees,
          scope,
          depositDate: escrow ? formatDate(escrow.depositDate) : null,
          releaseDate: escrow ? formatDate(escrow.releaseDate) : null,
        };
      });

      setMilestonesData(derived);
    } catch (err) {
      console.error("Failed to load milestones:", err);
      addToast(err?.response?.data?.message || "Failed to load milestones.", "error");
      setMilestonesData([]);
      setContracts([]);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [addToast]);

  const handleCreateMilestone = async () => {
    if (!newMilestone.contractID || !newMilestone.title || !newMilestone.dueDate || !newMilestone.milestoneAmount) {
      addToast("Provide contract, title, due date, and amount.", "error");
      return;
    }

    setIsCreating(true);
    try {
      await milestoneService.createMilestone({
        contractID: newMilestone.contractID,
        title: newMilestone.title,
        description: newMilestone.description,
        dueDate: newMilestone.dueDate,
        milestoneAmount: Number(newMilestone.milestoneAmount),
        assigneeIDs: newMilestone.assigneeIDs,
      });
      addToast("Milestone created.", "success");
      setNewMilestone((prev) => ({
        ...prev,
        title: "",
        description: "",
        dueDate: "",
        milestoneAmount: "",
        assigneeIDs: selectedAssignments.length === 1 && selectedAssignments[0]?.developer?.developerID
          ? [selectedAssignments[0].developer.developerID]
          : [],
      }));
      setShowForm(false);
      await fetchMilestones();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to create milestone.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (milestoneId, statusLabel) => {
    if (!milestoneId) return;
    setUpdatingMilestoneId(milestoneId);
    try {
      await milestoneService.updateMilestoneStatus(milestoneId, mapStatusToBackend(statusLabel));
      await fetchMilestones();
      addToast("Milestone status updated.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update milestone.", "error");
    } finally {
      setUpdatingMilestoneId(null);
    }
  };

  const handleDelete = async (milestoneId) => {
    if (!milestoneId) return;
    if (!window.confirm("Delete this milestone?")) return;
    setDeletingMilestoneId(milestoneId);
    try {
      await milestoneService.deleteMilestone(milestoneId);
      await fetchMilestones();
      addToast("Milestone deleted.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to delete milestone.", "error");
    } finally {
      setDeletingMilestoneId(null);
    }
  };

  const openEditMilestone = async (milestoneId) => {
    if (!milestoneId) return;
    setIsLoadingEdit(true);
    try {
      const res = await milestoneService.getMilestoneById(milestoneId);
      const data = res.data?.data;
      if (data) {
        const dueDate = data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : "";
        const amount = data.milestoneAmount !== undefined ? Number(data.milestoneAmount) : "";
        setEditMilestoneForm({
          title: data.title || "",
          description: data.description || "",
          dueDate,
          milestoneAmount: Number.isNaN(amount) ? "" : amount,
        });
        setEditingMilestoneId(milestoneId);
      }
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to load milestone details.", "error");
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleSaveMilestone = async () => {
    if (!editingMilestoneId) return;
    if (!editMilestoneForm.title || !editMilestoneForm.dueDate || !editMilestoneForm.milestoneAmount) {
      addToast("Provide title, due date, and amount.", "error");
      return;
    }

    setIsSavingEdit(true);
    try {
      await milestoneService.updateMilestone(editingMilestoneId, {
        title: editMilestoneForm.title,
        description: editMilestoneForm.description,
        dueDate: editMilestoneForm.dueDate,
        milestoneAmount: Number(editMilestoneForm.milestoneAmount),
      });
      addToast("Milestone updated.", "success");
      setEditingMilestoneId(null);
      await fetchMilestones();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update milestone.", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredMilestones = useMemo(() => {
    if (activeFilter === "All") return milestonesData;
    return milestonesData.filter((m) => m.status === activeFilter);
  }, [activeFilter, milestonesData]);

  // Summary stats (derived from API, in UI model)
  const totals = useMemo(() => {
    const totalAmountNum = milestonesData.reduce((sum, m) => {
      const raw = m.amount.replace("$", "").replace(/,/g, "");
      const parsed = parseFloat(raw);
      return sum + (Number.isNaN(parsed) ? 0 : parsed);
    }, 0);

    const completedAmountNum = milestonesData
      .filter((m) => m.status === "Completed")
      .reduce((sum, m) => {
        const raw = m.amount.replace("$", "").replace(/,/g, "");
        const parsed = parseFloat(raw);
        return sum + (Number.isNaN(parsed) ? 0 : parsed);
      }, 0);

    return { totalAmountNum, completedAmountNum };
  }, [milestonesData]);

  return (
    <div
      style={{
        backgroundColor: "var(--color-background)",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Milestones" role="client" />

      <main
        className="sidebar-layout-main"
        style={{
          marginLeft: "256px",
          flex: 1,
          padding: "3rem",
          position: "relative",
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Teal Glow */}
        <div
          className="teal-glow"
          style={{
            position: "absolute",
            top: "-50px",
            right: "5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* HEADER */}
        <header
          className="anim-fade-in-up"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "3rem",
            position: "relative",
            zIndex: 1,
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "var(--color-on-surface)",
                lineHeight: 1,
                marginBottom: "0.75rem",
              }}
            >
              Milestones
            </h1>
            <p
              style={{
                color: "var(--color-secondary)",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
              }}
            >
              Track deliverables and escrow payments across all contracts
            </p>
          </div>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="signature-cta"
            style={{
              padding: "0.875rem 2rem",
              color: "var(--color-on-primary-container)",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              borderRadius: "4px",
              transition: "transform 0.3s ease, filter 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.filter = "brightness(1.1)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.filter = "brightness(1)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            {showForm ? "Cancel" : "Add Milestone"}
          </button>
        </header>

        {showForm ? (
          <section
            className="anim-slide-up"
            style={{
              background: "var(--color-surface-container-low)",
              padding: "2rem",
              marginBottom: "3rem",
              borderRadius: "8px",
              border: "1px solid var(--color-outline-variant)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <h3 style={{ fontFamily: "var(--font-headline)", marginTop: 0 }}>Create Milestone</h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <select
                value={newMilestone.contractID}
                onChange={(e) => {
                  const nextContractId = e.target.value;
                  const nextContract = contracts.find((c) => c.contractID === nextContractId);
                  const nextAssignments = nextContract?.assignments || [];
                  const defaultAssignees = nextAssignments.length === 1 && nextAssignments[0]?.developer?.developerID
                    ? [nextAssignments[0].developer.developerID]
                    : [];
                  setNewMilestone((prev) => ({
                    ...prev,
                    contractID: nextContractId,
                    assigneeIDs: defaultAssignees
                  }));
                }}
                style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }}
              >
                <option value="">Select Contract</option>
                {contracts.map((c) => (
                  <option key={c.contractID} value={c.contractID}>
                    {c.title}
                  </option>
                ))}
              </select>
              <input
                value={newMilestone.title}
                onChange={(e) => setNewMilestone((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Title"
                style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }}
              />
              <textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                rows={3}
                style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone((prev) => ({ ...prev, dueDate: e.target.value }))}
                  style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }}
                />
                <input
                  type="number"
                  value={newMilestone.milestoneAmount}
                  onChange={(e) => setNewMilestone((prev) => ({ ...prev, milestoneAmount: e.target.value }))}
                  placeholder="Amount"
                  style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }}
                />
              </div>
              {selectedAssignments.length > 0 ? (
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-outline)", fontFamily: "var(--font-label)" }}>
                    Assign to
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    {selectedAssignments.map((assignment) => {
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
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleCreateMilestone}
                  disabled={isCreating}
                  className="signature-cta"
                  style={{ padding: "0.75rem 2rem", color: "var(--color-on-primary-container)", border: "none", cursor: isCreating ? "not-allowed" : "pointer", borderRadius: "4px" }}
                >
                  {isCreating ? "Creating..." : "Create Milestone"}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {editingMilestoneId ? (
          <section
            className="anim-slide-up"
            style={{
              background: "var(--color-surface-container-low)",
              padding: "2rem",
              marginBottom: "3rem",
              borderRadius: "8px",
              border: "1px solid var(--color-outline-variant)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <h3 style={{ fontFamily: "var(--font-headline)", marginTop: 0 }}>Edit Milestone</h3>
            {isLoadingEdit ? (
              <p style={{ color: "var(--color-on-surface-variant)" }}>Loading milestone...</p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                <input
                  value={editMilestoneForm.title}
                  onChange={(e) => setEditMilestoneForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Title"
                  style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }}
                />
                <textarea
                  value={editMilestoneForm.description}
                  onChange={(e) => setEditMilestoneForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  rows={3}
                  style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <input
                    type="date"
                    value={editMilestoneForm.dueDate}
                    onChange={(e) => setEditMilestoneForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }}
                  />
                  <input
                    type="number"
                    value={editMilestoneForm.milestoneAmount}
                    onChange={(e) => setEditMilestoneForm((prev) => ({ ...prev, milestoneAmount: e.target.value }))}
                    placeholder="Amount"
                    style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setEditingMilestoneId(null)}
                    style={{ background: "transparent", border: "none", color: "var(--color-secondary)", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMilestone}
                    disabled={isSavingEdit}
                    className="signature-cta"
                    style={{ padding: "0.75rem 2rem", color: "var(--color-on-primary-container)", border: "none", cursor: isSavingEdit ? "not-allowed" : "pointer", borderRadius: "4px" }}
                  >
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : null}

        {/* SUMMARY CARDS */}
        <section
          className="anim-fade-in-up anim-delay-1"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {[
            {
              label: "Total Milestones",
              value: milestonesData.length,
              icon: "flag",
              color: "var(--color-secondary)",
            },
            {
              label: "Completed",
              value: milestonesData.filter((m) => m.status === "Completed").length,
              icon: "check_circle",
              color: "#4ade80",
            },
            {
              label: "Total Value",
              value: `$${totals.totalAmountNum.toLocaleString()}`,
              icon: "account_balance_wallet",
              color: "var(--color-primary)",
            },
            {
              label: "Released",
              value: `$${totals.completedAmountNum.toLocaleString()}`,
              icon: "payments",
              color: "var(--color-on-primary-container)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--color-surface-container-low)",
                padding: "1.75rem",
                borderBottom: `2px solid ${stat.color}`,
                transition: "transform 0.2s",
                borderRadius: "8px",
                border: "1px solid var(--color-outline-variant)",
                borderBottomColor: stat.color,
                borderBottomWidth: "2px"
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <span
                className="material-symbols-outlined"
                style={{
                  color: stat.color,
                  fontSize: "1.5rem",
                  display: "block",
                  marginBottom: "1rem",
                }}
              >
                {stat.icon}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                }}
              >
                {stat.value}
              </h3>
              <p
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--color-outline)",
                  fontFamily: "var(--font-label)",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        {/* FILTER TABS */}
        <div
          className="anim-fade-in-up anim-delay-2"
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "2rem",
            position: "relative",
            zIndex: 1,
            flexWrap: "wrap",
          }}
        >
          {milestoneFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: "6px 18px",
                background: activeFilter === filter ? "var(--color-primary)" : "var(--color-surface-container-highest)",
                color: activeFilter === filter ? "var(--color-on-primary-container)" : "var(--color-secondary)",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-label)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                transition: "all 0.2s",
                borderRadius: "4px"
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* MILESTONE CARDS */}
        <section
          className="anim-slide-up anim-delay-3"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {filteredMilestones.map((milestone) => (
            <div
              key={milestone.milestoneId}
              style={{
                background: "var(--color-surface-container-low)",
                borderLeft: `4px solid ${milestoneStatusColors[milestone.status].color}`,
                padding: "2rem",
                transition: "background 0.2s, transform 0.2s",
                borderRadius: "8px",
                borderTop: "1px solid var(--color-outline-variant)",
                borderRight: "1px solid var(--color-outline-variant)",
                borderBottom: "1px solid var(--color-outline-variant)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-surface-container-high)";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-surface-container-low)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "2rem",
                  alignItems: "flex-start",
                }}
              >
                {/* Left Info */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontWeight: 700,
                        color: "var(--color-primary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {milestone.milestoneId}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--color-outline)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {milestone.contractId} — {milestone.contractTitle}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--color-on-surface)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {milestone.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-secondary)",
                      fontFamily: "var(--font-body)",
                      lineHeight: 1.6,
                      marginBottom: "1.25rem",
                      maxWidth: "600px",
                    }}
                  >
                    {milestone.description}
                  </p>
                  <p style={{ margin: "0 0 1rem", fontSize: "0.75rem", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {milestone.scope} milestone{milestone.assignees?.length ? ` • ${milestone.assignees.join(", ")}` : ""}
                  </p>

                  <div
                    style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}
                  >
                    {/* Due Date */}
                    <div>
                      <p
                        style={{
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-label)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Due Date
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-headline)",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "var(--color-on-surface)",
                        }}
                      >
                        {milestone.dueDate}
                      </p>
                    </div>

                    {/* Completed Date */}
                    {milestone.completeDate && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Completed
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-headline)",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "#4ade80",
                          }}
                        >
                          {milestone.completeDate}
                        </p>
                      </div>
                    )}

                    {/* Escrow Info */}
                    <div>
                      <p
                        style={{
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-label)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Escrow Status
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 10px",
                          background:
                            milestoneEscrowColors[milestone.escrowStatus].bg,
                          color:
                            milestoneEscrowColors[milestone.escrowStatus].color,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "var(--font-label)",
                          borderRadius: "4px"
                        }}
                      >
                        {milestone.escrowStatus}
                      </span>
                    </div>

                    {/* Deposit Date */}
                    {milestone.depositDate && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Deposited
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-headline)",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "var(--color-on-surface)",
                          }}
                        >
                          {milestone.depositDate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right — Amount + Status */}
                <div style={{ textAlign: "right", minWidth: "160px" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      lineHeight: 1,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {milestone.amount}
                  </p>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 14px",
                      background: milestoneStatusColors[milestone.status].bg,
                      color: milestoneStatusColors[milestone.status].color,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontFamily: "var(--font-label)",
                      borderRadius: "4px"
                    }}
                  >
                    {milestone.status}
                  </span>

                  <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem", justifyItems: "end" }}>
                    <select
                      value={milestone.status}
                      onChange={(e) => handleUpdateStatus(milestone.milestoneId, e.target.value)}
                      disabled={updatingMilestoneId === milestone.milestoneId}
                      style={{
                        background: "var(--color-surface)",
                        color: "var(--color-on-surface)",
                        border: "1px solid var(--color-outline-variant)",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-label)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDelete(milestone.milestoneId)}
                      disabled={deletingMilestoneId === milestone.milestoneId}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--color-error)",
                        cursor: deletingMilestoneId === milestone.milestoneId ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-headline)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {deletingMilestoneId === milestone.milestoneId ? "Deleting..." : "Delete"}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginTop: "1.5rem" }}>
                    <div
                      style={{
                        height: "4px",
                        background: "var(--color-surface-container-highest)",
                        width: "100%",
                        minWidth: "160px",
                        overflow: "hidden",
                        borderRadius: "2px"
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          transition: "width 0.4s ease",
                          background:
                            milestoneStatusColors[milestone.status].color,
                          width:
                            milestone.status === "Completed"
                              ? "100%"
                              : milestone.status === "In Progress"
                                ? "60%"
                                : milestone.status === "Pending"
                                  ? "20%"
                                  : "0%",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--color-outline)",
                        fontFamily: "var(--font-label)",
                        marginTop: "0.5rem",
                        textAlign: "right",
                      }}
                    >
                      {milestone.status === "Completed"
                        ? "100%"
                        : milestone.status === "In Progress"
                          ? "60%"
                          : milestone.status === "Pending"
                            ? "20%"
                            : "0%"}{" "}
                      complete
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => openEditMilestone(milestone.milestoneId)}
                    style={{
                      background: "transparent",
                      color: "var(--color-secondary)",
                      border: "1px solid var(--color-outline-variant)",
                      borderRadius: "4px",
                      padding: "0.35rem 0.75rem",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontFamily: "var(--font-headline)",
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div style={{ marginTop: "4rem" }}>
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default Milestones;
