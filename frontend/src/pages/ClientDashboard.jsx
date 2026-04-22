import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import DashboardHeader from "../components/ui/DashboardHeader";
import ManageApplicationsModal from "../components/ui/ManageApplicationsModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { contractService } from "../api/services/contractService";
import { statsService } from "../api/services/statsService";
import { useToast } from "../context/ToastContext";

function ClientDashboard() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", totalAmount: "", startDate: "", endDate: "" });
  const [isUpdatingContract, setIsUpdatingContract] = useState(false);
  const [confirmDeleteContractId, setConfirmDeleteContractId] = useState(null);
  const [stats, setStats] = useState([
    { label: "Active Contracts", value: "0", icon: "assignment" },
    { label: "Completed Projects", value: "0", icon: "check_circle" },
    { label: "Money Paid Out", value: "$0", icon: "payments" },
    { label: "In Escrow Now", value: "$0", icon: "lock" },
    { label: "Pending Proposals", value: "0", icon: "inbox" },
    { label: "Milestones Pending", value: "0", icon: "flag" },
    { label: "Open Bugs", value: "0", icon: "bug_report" },
  ]);

  const statusLabelMap = {
    DRAFT: "OPEN",
    SIGNED: "SIGNED",
    IN_PROGRESS: "IN PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  };

  const getStatusLabel = (status) => statusLabelMap[status] || status;

  const fetchContracts = async () => {
    try {
      const { data } = await contractService.getMyContracts();
      const fetchedContracts = data?.data || [];

      const pendingProposalsCount = fetchedContracts.reduce((sum, contract) => {
        const count = (contract.proposals || []).filter(
          (proposal) => proposal.status === "PENDING" && proposal.source === "DEVELOPER_PROPOSAL"
        ).length;
        return sum + count;
      }, 0);

      setContracts(fetchedContracts);

      statsService.getDashboardStats().then(({ data: statsRes }) => {
        const s = statsRes?.data;
        const activeCount = (s?.contracts?.byStatus?.IN_PROGRESS ?? 0) + (s?.contracts?.byStatus?.SIGNED ?? 0);
        const completedCount = s?.contracts?.byStatus?.COMPLETED ?? 0;
        setStats([
          { label: "Active Contracts", value: String(activeCount), icon: "assignment" },
          { label: "Completed Projects", value: String(completedCount), icon: "check_circle" },
          { label: "Money Paid Out", value: `$${Number(s?.escrow?.totalReleased ?? 0).toLocaleString()}`, icon: "payments" },
          { label: "In Escrow Now", value: `$${Number(s?.escrow?.totalDeposited ?? 0).toLocaleString()}`, icon: "lock" },
          { label: "Pending Proposals", value: String(pendingProposalsCount), icon: "inbox" },
          { label: "Milestones Pending", value: String(s?.milestones?.byStatus?.PENDING ?? 0), icon: "flag" },
          { label: "Open Bugs", value: String(s?.bugs?.byStatus?.REPORTED ?? 0), icon: "bug_report" },
        ]);
      }).catch((err) => {
        console.error("Stats fetch failed:", err);
        setStats((prev) => prev.map((stat, i) =>
          i === 4 ? { ...stat, value: String(pendingProposalsCount) } : stat
        ));
      });
    } catch (err) {
      console.error("ClientDashboard contracts fetch failed:", err);
      addToast("Failed to load contracts.", "error");
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const pendingProposals = contracts
    .flatMap((contract) => (contract.proposals || []).map((proposal) => ({
      contract,
      proposal,
    })))
    .filter(({ proposal }) => proposal.status === "PENDING" && proposal.source === "DEVELOPER_PROPOSAL")
    .sort((a, b) => new Date(b.proposal.createdAt) - new Date(a.proposal.createdAt));

  useEffect(() => {
    const params = new URLSearchParams(search);
    const contractId = params.get("contract");
    if (!contractId || selectedContract) return;
    const match = contracts.find((contract) => contract.contractID === contractId);
    if (match) setSelectedContract(match);
  }, [search, contracts, selectedContract]);

  const closeHiringPipeline = () => {
    setSelectedContract(null);
    const params = new URLSearchParams(search);
    if (!params.has("contract")) return;
    params.delete("contract");
    const nextSearch = params.toString();
    navigate(
      {
        pathname: "/client/dashboard",
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true }
    );
  };

  const handleDeleteContract = async () => {
    if (!confirmDeleteContractId) return;
    try {
      await contractService.deleteContract(confirmDeleteContractId);
      await fetchContracts();
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg?.includes("active relations") || msg?.includes("escrow")) {
        addToast("Cannot delete: contract has active milestones, escrow, or team members. Cancel the contract first, or contact support.", "error");
      } else {
        addToast(msg || "Failed to delete contract.", "error");
      }
    } finally {
      setConfirmDeleteContractId(null);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-background)",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Dashboard" role="client" />
      {selectedContract ? (
        <ManageApplicationsModal
          contract={selectedContract}
          onClose={closeHiringPipeline}
        />
      ) : null}
      {editingContract ? (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setEditingContract(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "700px", background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px", padding: "2rem" }}
          >
            <h3 style={{ marginTop: 0, fontFamily: "var(--font-headline)" }}>Edit Contract</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <input value={editForm.title} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }} />
              <input type="number" value={editForm.totalAmount} onChange={(e) => setEditForm((prev) => ({ ...prev, totalAmount: e.target.value }))} placeholder="Budget" style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }} />
              <input type="date" value={editForm.startDate} onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))} style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }} />
              <input type="date" value={editForm.endDate || ""} onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))} style={{ padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }} />
              <textarea value={editForm.description} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={4} style={{ gridColumn: "1 / -1", padding: "0.75rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }} />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                className="signature-cta"
                onClick={async () => {
                  try {
                    if (!editForm.title || !editForm.description || !editForm.totalAmount || !editForm.startDate) {
                      addToast("Fill in title, description, budget, and start date before saving.", "error");
                      return;
                    }
                    const amountValue = Number(editForm.totalAmount);
                    if (Number.isNaN(amountValue) || amountValue <= 0) {
                      addToast("Budget must be a valid number greater than zero.", "error");
                      return;
                    }
                    setIsUpdatingContract(true);
                    await contractService.updateContract(editingContract.contractID, {
                      title: editForm.title,
                      description: editForm.description,
                      totalAmount: amountValue,
                      startDate: editForm.startDate,
                      endDate: editForm.endDate || null,
                    });
                    setEditingContract(null);
                    await fetchContracts();
                  } finally {
                    setIsUpdatingContract(false);
                  }
                }}
                disabled={isUpdatingContract}
                style={{ padding: "0.75rem 1.5rem", border: "none", borderRadius: "4px", color: "var(--color-on-primary-container)", cursor: "pointer" }}
              >
                {isUpdatingContract ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditingContract(null)} style={{ padding: "0.75rem 1.5rem", border: "1px solid var(--color-outline-variant)", background: "transparent", color: "var(--color-on-surface)", borderRadius: "4px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={Boolean(confirmDeleteContractId)}
        title="Delete contract"
        message="This will permanently delete the contract and all associated data. This action cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDeleteContract}
        onCancel={() => setConfirmDeleteContractId(null)}
      />
      <main
        className="sidebar-layout-main"
        style={{
          marginLeft: "256px",
          flex: 1,
          padding: "calc(96px + 3rem) 3rem 3rem 3rem",
          position: "relative",
          transition: "margin-left 0.3s ease",
        }}
      >
        <DashboardHeader />
        <div
          className="teal-glow"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "600px",
            height: "600px",
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
            marginBottom: "4rem",
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
                fontSize: "clamp(2.5rem, 4vw, 4rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "var(--color-on-surface)",
                marginBottom: "0.5rem",
              }}
            >
              {user ? (user.client?.companyName || user.fullName) : "Editorial Hub"}
            </h1>
            <p
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--color-secondary)",
                fontFamily: "var(--font-label)",
              }}
            >
              Client Dashboard • {user?.country || "Global"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/post-contract")}
              className="signature-cta"
              style={{
                padding: "1rem 2rem",
                color: "var(--color-on-primary-container)",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
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
              Post New Contract
            </button>
            <button
              type="button"
              onClick={fetchContracts}
              style={{
                padding: "1rem 2rem",
                borderRadius: "4px",
                border: "1px solid var(--color-outline-variant)",
                background: "transparent",
                color: "var(--color-on-surface)",
                cursor: "pointer",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Refresh
            </button>
          </div>
        </header>

        {/* STATS */}
        <section
          className="anim-fade-in-up anim-delay-2"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginBottom: "4rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              style={{
                background: index === 0 ? "var(--color-tertiary-fixed)" : "var(--color-surface-container-low)",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "180px",
                borderBottom: index !== 0 ? `2px solid var(--color-primary)` : "none",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                borderRadius: "8px",
                border: index !== 0 ? "1px solid var(--color-outline-variant)" : "none",
                borderBottomWidth: index !== 0 ? "2px" : "0"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "2rem",
                    color: index === 0 ? "var(--color-on-tertiary-container)" : "var(--color-primary)",
                  }}
                >
                  {stat.icon}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: index === 0 ? "var(--color-on-tertiary-fixed-variant)" : "var(--color-secondary)",
                    fontFamily: "var(--font-label)",
                    textAlign: "right",
                    maxWidth: "120px",
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "2.25rem",
                  fontWeight: 700,
                  color: index === 0 ? "var(--color-on-tertiary-fixed)" : "var(--color-on-surface)",
                }}
              >
                {stat.value}
              </h3>
            </div>
          ))}
        </section>

        {/* CONTRACTS TABLE */}
        <section className="anim-fade-in-up anim-delay-3" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--color-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Active Contracts
            </h2>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "var(--color-outline-variant-strong)",
              }}
            />
          </div>
          <p style={{ marginTop: "-1rem", marginBottom: "1.5rem", color: "var(--color-outline)", fontSize: "0.85rem" }}>
            Open contracts are visible to developers. You can edit them until a developer is assigned.
          </p>

          <div style={{ background: "var(--color-surface-container-low)", overflowX: "auto", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr
                  style={{
                    background: "var(--color-surface-container-highest)",
                    borderBottom: "1px solid var(--color-outline-variant-strong)",
                  }}
                >
                  {["Contract Title", "Hiring", "Status", "Deadline", "Actions"].map(
                    (col) => (
                      <th
                        key={col}
                        style={{
                          padding: "1.25rem 2rem",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          color: "var(--color-secondary)",
                          fontFamily: "var(--font-label)",
                          fontWeight: 700,
                          textAlign: col === "Deadline" ? "right" : "left",
                        }}
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract, index) => (
                  <tr
                    key={contract.contractID || contract._id || contract.id}
                    onClick={() => navigate(`/contracts/${contract.contractID || contract._id || contract.id}`)}
                    style={{
                      borderBottom:
                        index < contracts.length - 1
                          ? "1px solid var(--color-outline-variant)"
                          : "none",
                      transition: "background 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--color-surface-container-high)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "1.75rem 2rem" }}>
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--font-headline)",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "var(--color-on-surface)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {contract.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-body)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {contract.contractID || contract._id || contract.id}
                      </span>
                    </td>
                    <td style={{ padding: "1.75rem 2rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            background: "var(--color-surface-container-highest)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            color: "var(--color-secondary)",
                            fontFamily: "var(--font-headline)",
                            borderRadius: "4px"
                          }}
                        >
                          {contract.assignments?.length > 0 ? "TEAM" : `${contract.proposals?.length || 0}`}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContract(contract);
                          }}
                          style={{
                            color: "var(--color-on-surface)",
                            fontSize: "0.9rem",
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          {contract.assignments?.length > 0 ? "Team Active" : `${contract.proposals?.length || 0} pending`}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "1.75rem 2rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          background: contract.status === "IN_PROGRESS" ? "var(--color-primary-container)" : "var(--color-surface-container-highest)",
                          color: contract.status === "IN_PROGRESS" ? "var(--color-on-primary-container)" : "var(--color-on-surface)",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "var(--font-label)",
                          borderRadius: "4px"
                        }}
                      >
                        {getStatusLabel(contract.status)}
                      </span>
                    </td>
                    <td style={{ padding: "1.75rem 2rem", textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-headline)",
                          fontWeight: 700,
                          color: "var(--color-on-surface)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "TBD"}
                      </span>
                    </td>
                    <td style={{ padding: "1.75rem 2rem", textAlign: "right" }}>
                      {contract.status === "DRAFT" ? (
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                          {((contract.proposals || []).filter((proposal) => proposal.status === "PENDING" && proposal.source === "DEVELOPER_PROPOSAL").length > 0) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedContract(contract);
                              }}
                              style={{ border: "1px solid var(--color-primary-container)", background: "var(--color-primary-container)", color: "var(--color-on-primary-container)", borderRadius: "4px", padding: "0.4rem 0.7rem", cursor: "pointer" }}
                            >
                              Review
                            </button>
                          ) : null}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setEditingContract(contract);
                              setEditForm({
                                title: contract.title || "",
                                description: contract.description || "",
                                totalAmount: String(contract.totalAmount || ""),
                                startDate: contract.startDate ? String(contract.startDate).slice(0, 10) : "",
                                endDate: contract.endDate ? String(contract.endDate).slice(0, 10) : "",
                              });
                            }}
                            style={{ border: "1px solid var(--color-outline-variant)", background: "transparent", color: "var(--color-on-surface)", borderRadius: "4px", padding: "0.4rem 0.7rem", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setConfirmDeleteContractId(contract.contractID);
                            }}
                            style={{ border: "1px solid var(--color-error)", background: "transparent", color: "var(--color-error)", borderRadius: "4px", padding: "0.4rem 0.7rem", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "var(--color-outline)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section
          className="anim-fade-in-up anim-delay-4"
          style={{
            marginTop: "4rem",
            background: "var(--color-surface-container-low)",
            padding: "3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
            position: "relative",
            zIndex: 1,
            borderRadius: "8px",
            border: "1px solid var(--color-outline-variant)"
          }}
        >
          <div style={{ maxWidth: "32rem" }}>
            <h4
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                letterSpacing: "-0.03em",
                marginBottom: "1rem",
              }}
            >
              Hire from the Curated Talent Pool
            </h4>
            <p
              style={{
                color: "var(--color-secondary)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                fontFamily: "var(--font-body)",
                marginBottom: "1.5rem",
              }}
            >
              Access our vetted network of 500+ top-tier developers.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/client/directory")}
                className="signature-cta"
                style={{
                  padding: "0.75rem 2rem",
                  color: "var(--color-on-primary-container)",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px"
                }}
              >
                Browse Talent
              </button>
              <button
                style={{
                  padding: "0.75rem 2rem",
                  background: "transparent",
                  border: "1px solid var(--color-outline-variant-strong)",
                  color: "var(--color-secondary)",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: "4px",
                  transition: "background 0.3s ease"
                }}
                onMouseEnter={(e) => (e.target.style.background = "var(--color-surface-container-high)")}
                onMouseLeave={(e) => (e.target.style.background = "transparent")}
              >
                View Pricing
              </button>
            </div>
          </div>
          <div style={{ textAlign: "right", flex: 1, minWidth: "150px" }}>
            <p
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "clamp(3rem, 5vw, 4rem)",
                fontWeight: 700,
                color: "var(--color-primary)",
                lineHeight: 1,
              }}
            >
              500+
            </p>
            <p
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--color-secondary)",
                fontFamily: "var(--font-label)",
                marginTop: "0.5rem",
              }}
            >
              Vetted Developers
            </p>
          </div>
        </section>

        <div style={{ marginTop: "4rem" }}>
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default ClientDashboard;
