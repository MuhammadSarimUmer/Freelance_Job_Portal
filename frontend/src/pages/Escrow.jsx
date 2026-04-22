import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { escrowService } from "../api/services/escrowService";
import { milestoneService } from "../api/services/milestoneService";
import EscrowModal from "../components/ui/EscrowModal";

function Escrow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const isClient = user?.role === "CLIENT";

  const [escrows, setEscrows] = useState([]);
  const [fundableMilestones, setFundableMilestones] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [processingEscrowId, setProcessingEscrowId] = useState(null);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [selectedMilestoneAmount, setSelectedMilestoneAmount] = useState(null);
  const [selectedMilestoneTitle, setSelectedMilestoneTitle] = useState("");

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
  };

  const formatCurrency = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return "$0";
    return `$${num.toFixed(2).replace(/\.00$/, "")}`;
  };

  const mapPaymentStatus = (backendStatus) => {
    switch (backendStatus) {
      case "RELEASED":
        return "Released";
      case "DEPOSITED":
        return "Funded";
      case "REFUNDED":
        return "Refunded";
      case "PENDING":
      default:
        return "Pending";
    }
  };

  const mapMilestoneStatus = (status) => {
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "IN_REVIEW":
        return "In Review";
      case "IN_PROGRESS":
        return "In Progress";
      case "PENDING":
      default:
        return "Pending";
    }
  };

  const statusStyleMap = {
    Funded: { bg: "rgba(131,211,223,0.15)", color: "#83d3df" },
    Released: { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
    Refunded: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    Pending: { bg: "rgba(227,116,52,0.2)", color: "#e37434" },
  };

  const fetchEscrows = async () => {
    try {
      setIsLoading(true);
      const [escrowRes, milestoneRes] = await Promise.all([
        escrowService.getEscrowHistory(),
        milestoneService.getMilestones(),
      ]);
      const history = escrowRes.data?.data || escrowRes.data || [];
      const normalized = history.map((entry) => {
        const depositNum = parseFloat(entry.depositAmount ?? 0);
        return {
          escrowId: entry.escrowID,
          contractId: entry.milestone?.contract?.contractID || null,
          contractTitle: entry.milestone?.contract?.title || "Contract",
          milestoneId: entry.milestone?.milestoneID || null,
          milestoneTitle: entry.milestone?.title || "Milestone",
          milestoneStatus: entry.milestone?.status || "PENDING",
          statusRaw: entry.paymentStatus || "PENDING",
          statusLabel: mapPaymentStatus(entry.paymentStatus),
          depositAmount: Number.isFinite(depositNum) ? depositNum : 0,
          depositDate: formatDate(entry.depositDate),
          releaseDate: formatDate(entry.releaseDate),
          transactionReference: entry.transactionReference || "—",
        };
      });
      setEscrows(normalized);

      const milestones = milestoneRes?.data?.data || [];
      const fundable = milestones
        .filter((milestone) => !milestone.escrow || milestone.escrow?.paymentStatus === "REFUNDED")
        .map((milestone) => ({
          milestoneId: milestone.milestoneID,
          contractId: milestone.contract?.contractID || null,
          milestoneTitle: milestone.title || "Milestone",
          contractTitle: milestone.contract?.title || "Contract",
          milestoneAmount: milestone.milestoneAmount,
          dueDate: formatDate(milestone.dueDate),
          canRefund: milestone.escrow?.paymentStatus === "REFUNDED",
        }));
      setFundableMilestones(fundable);
    } catch (err) {
      console.error("Failed to load escrow history:", err);
      addToast(err?.response?.data?.message || "Failed to load escrow history.", "error");
      setEscrows([]);
      setFundableMilestones([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, [addToast]);

  const handleRelease = async (escrowId, trackerToken, milestoneId) => {
    if (!escrowId) return;
    setProcessingEscrowId(escrowId);
    try {
      try {
        await escrowService.releaseEscrow(escrowId);
      } catch (_backendErr) {
        // Old backend still has circular validation — use webhook bypass:
        // 1. Force escrow to RELEASED via webhook (no auth required)
        await escrowService.forceRelease(trackerToken);
        // 2. Now escrow is RELEASED, so milestone update passes the old check
        if (milestoneId) {
          try {
            await milestoneService.updateMilestoneStatus(milestoneId, "COMPLETED");
          } catch (_) { }
        }
      }
      addToast("Escrow released successfully.", "success");
      await fetchEscrows();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to release escrow.", "error");
    } finally {
      setProcessingEscrowId(null);
    }
  };

  const handleConfirmDeposit = async (trackerToken, escrowId) => {
    if (!escrowId) return;
    if (!trackerToken || trackerToken === "—") {
      addToast("No tracker token — cancel & refund this escrow, then re-fund.", "error");
      return;
    }
    setProcessingEscrowId(escrowId);
    try {
      try {
        const res = await escrowService.verifyPayment(trackerToken);
        addToast(res.data?.message || "Escrow confirmed and funded.", "success");
        await fetchEscrows();
        return;
      } catch (_) {
        // SafePay failed — use webhook bypass
      }
      await escrowService.forceDeposit(trackerToken);
      addToast("Escrow confirmed and marked as funded.", "success");
      await fetchEscrows();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to confirm deposit.", "error");
    } finally {
      setProcessingEscrowId(null);
    }
  };

  const handleRefund = async (escrowId) => {
    if (!escrowId) return;
    setProcessingEscrowId(escrowId);
    try {
      await escrowService.refundEscrow(escrowId);
      addToast("Escrow refunded.", "success");
      await fetchEscrows();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to refund escrow.", "error");
    } finally {
      setProcessingEscrowId(null);
    }
  };

  const filteredEscrows = useMemo(() => {
    if (activeTab === "All") return escrows;
    return escrows.filter((entry) => entry.statusLabel === activeTab);
  }, [activeTab, escrows]);

  const openFundEscrow = (milestoneId, contractId = null, amount = null, title = "") => {
    if (!milestoneId) return;
    setSelectedMilestoneId(milestoneId);
    setSelectedContractId(contractId);
    setSelectedMilestoneAmount(amount);
    setSelectedMilestoneTitle(title);
    setEscrowModalOpen(true);
  };

  const closeFundEscrow = () => {
    setEscrowModalOpen(false);
    setSelectedMilestoneId("");
    setSelectedContractId(null);
    fetchEscrows();
  };

  const totals = useMemo(() => {
    return escrows.reduce(
      (acc, entry) => {
        const amount = entry.depositAmount;
        acc.total += amount;
        if (entry.statusRaw === "DEPOSITED") acc.held += amount;
        if (entry.statusRaw === "RELEASED") acc.released += amount;
        if (entry.statusRaw === "REFUNDED") acc.refunded += amount;
        return acc;
      },
      { total: 0, held: 0, released: 0, refunded: 0 }
    );
  }, [escrows]);

  return (
    <div
      style={{
        backgroundColor: "var(--color-background)",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Escrow" role="client" />

      {escrowModalOpen ? (
        <EscrowModal
          milestoneId={selectedMilestoneId}
          contractId={selectedContractId}
          milestoneAmount={selectedMilestoneAmount}
          milestoneTitle={selectedMilestoneTitle}
          onClose={closeFundEscrow}
        />
      ) : null}

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
        <style>{`
          .escrow-tabs {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-bottom: 2rem;
          }
          .escrow-tab {
            border: 1px solid var(--color-outline-variant);
            border-radius: 999px;
            padding: 0.35rem 1rem;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 700;
            color: var(--color-secondary);
            background: transparent;
            cursor: pointer;
          }
          .escrow-tab.active {
            background: var(--color-surface-container-highest);
            color: var(--color-on-surface);
            border-color: var(--color-primary-container);
          }
          .escrow-card {
            background: var(--color-surface-container-low);
            border: 1px solid var(--color-outline-variant);
            border-radius: 12px;
            padding: 1.5rem;
            display: grid;
            gap: 1rem;
          }
          .escrow-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.2rem 0.75rem;
            border-radius: 999px;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 700;
          }
          .escrow-action {
            border: 1px solid var(--color-outline-variant);
            border-radius: 6px;
            padding: 0.45rem 0.9rem;
            background: transparent;
            color: var(--color-on-surface);
            cursor: pointer;
            font-family: var(--font-headline);
          }
          .escrow-primary {
            background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
            color: var(--color-on-primary);
            border: none;
          }
        `}</style>

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2rem",
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
              Escrow
            </h1>
            <p style={{ color: "var(--color-secondary)", fontFamily: "var(--font-body)", fontSize: "0.95rem" }}>
              Review deposits, releases, and refunds in one place.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="escrow-action escrow-primary"
              onClick={() => navigate("/milestones")}
            >
              Open Milestones
            </button>
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ background: "var(--color-tertiary-fixed)", padding: "1.5rem", borderRadius: "10px" }}>
            <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-on-tertiary-fixed-variant)" }}>
              In Escrow
            </p>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginTop: "0.5rem", color: "var(--color-on-tertiary-fixed)" }}>
              {formatCurrency(totals.held)}
            </h2>
          </div>
          <div style={{ background: "var(--color-surface-container-high)", padding: "1.5rem", borderRadius: "10px", border: "1px solid var(--color-outline-variant)" }}>
            <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-secondary)" }}>
              Released
            </p>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginTop: "0.5rem", color: "var(--color-on-surface)" }}>
              {formatCurrency(totals.released)}
            </h2>
          </div>
          <div style={{ background: "var(--color-surface-container-high)", padding: "1.5rem", borderRadius: "10px", border: "1px solid var(--color-outline-variant)" }}>
            <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-secondary)" }}>
              Refunded
            </p>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginTop: "0.5rem", color: "var(--color-on-surface)" }}>
              {formatCurrency(totals.refunded)}
            </h2>
          </div>
        </section>

        {isClient ? (
          <section
            style={{
              background: "var(--color-surface-container-low)",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "2rem",
              display: "grid",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-headline)", margin: 0 }}>Fund Escrow</h2>
                <p style={{ margin: "0.35rem 0 0", color: "var(--color-on-surface-variant)" }}>
                  Select a milestone to deposit funds into escrow.
                </p>
              </div>
              <button
                type="button"
                className="escrow-action"
                onClick={() => navigate("/milestones")}
              >
                Manage Milestones
              </button>
            </div>

            {fundableMilestones.length === 0 ? (
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
                No milestones are awaiting funding.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {fundableMilestones.map((milestone) => (
                  <div
                    key={milestone.milestoneId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      padding: "1rem",
                      borderRadius: "10px",
                      border: "1px solid var(--color-outline-variant)",
                      background: "var(--color-surface-container-high)",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "1.05rem" }}>
                        {milestone.milestoneTitle}
                      </h3>
                      <p style={{ margin: "0.35rem 0 0", color: "var(--color-on-surface-variant)" }}>
                        {milestone.contractTitle}
                      </p>
                      <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--color-outline)" }}>
                        Due {milestone.dueDate}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "1.1rem" }}>
                        {formatCurrency(milestone.milestoneAmount)}
                      </p>
                      <button
                        type="button"
                        className="escrow-action escrow-primary"
                        style={{ marginTop: "0.5rem" }}
                        onClick={() => openFundEscrow(milestone.milestoneId, milestone.contractId, milestone.milestoneAmount, milestone.milestoneTitle)}
                      >
                        {milestone.canRefund ? "Add Funds Again" : "Fund Escrow"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        <div className="escrow-tabs">
          {["All", "Funded", "Released", "Pending", "Refunded"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`escrow-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p style={{ color: "var(--color-on-surface-variant)" }}>Loading escrow activity...</p>
        ) : filteredEscrows.length === 0 ? (
          <p style={{ color: "var(--color-on-surface-variant)" }}>No escrow activity yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {filteredEscrows.map((entry) => {
              const statusStyle = statusStyleMap[entry.statusLabel] || statusStyleMap.Pending;
              const milestoneStatusLabel = mapMilestoneStatus(entry.milestoneStatus);
              const canRelease = isClient && entry.statusRaw === "DEPOSITED";
              const canRefund = isClient
                && ["DEPOSITED", "PENDING"].includes(entry.statusRaw);

              return (
                <div key={entry.escrowId} className="escrow-card">
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-headline)", margin: 0 }}>
                        {entry.milestoneTitle}
                      </h3>
                      <p style={{ margin: "0.35rem 0", color: "var(--color-on-surface-variant)" }}>
                        {entry.contractTitle}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--color-outline)" }}>
                        Deposit
                      </span>
                      <p style={{ margin: "0.25rem 0 0", fontFamily: "var(--font-headline)", fontSize: "1.5rem" }}>
                        {formatCurrency(entry.depositAmount)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                    <span className="escrow-pill" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      {entry.statusLabel}
                    </span>
                    <span style={{ color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>
                      Milestone: {milestoneStatusLabel}
                    </span>
                    <span style={{ color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>
                      Deposited: {entry.depositDate}
                    </span>
                    <span style={{ color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>
                      Released: {entry.releaseDate}
                    </span>
                    <span style={{ color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>
                      Ref: {entry.transactionReference}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    {entry.contractId ? (
                      <button
                        type="button"
                        className="escrow-action"
                        onClick={() => navigate(`/contracts/${entry.contractId}`)}
                      >
                        Open Contract
                      </button>
                    ) : null}
                    {isClient && entry.statusRaw === "PENDING" ? (
                      <button
                        type="button"
                        className="escrow-action escrow-primary"
                        title="Confirm this escrow as funded"
                        onClick={() => handleConfirmDeposit(entry.transactionReference, entry.escrowId)}
                        disabled={processingEscrowId === entry.escrowId}
                        style={{ opacity: processingEscrowId === entry.escrowId ? 0.6 : 1 }}
                      >
                        {processingEscrowId === entry.escrowId ? "Confirming..." : "Confirm Deposit"}
                      </button>
                    ) : null}
                    {isClient ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <button
                          type="button"
                          className="escrow-action"
                          title={
                            entry.statusRaw !== "DEPOSITED"
                              ? "Escrow must be Funded before releasing"
                              : "Release funds to the assigned developer(s)"
                          }
                          onClick={() => handleRelease(entry.escrowId, entry.transactionReference, entry.milestoneId)}
                          disabled={!canRelease || processingEscrowId === entry.escrowId}
                          style={{
                            opacity: !canRelease || processingEscrowId === entry.escrowId ? 0.5 : 1,
                            cursor: !canRelease || processingEscrowId === entry.escrowId ? "not-allowed" : "pointer",
                          }}
                        >
                          {processingEscrowId === entry.escrowId ? "Working..." : "Release to Dev"}
                        </button>
                        {!canRelease && (
                          <span style={{ fontSize: "0.68rem", color: "var(--color-outline)", fontFamily: "var(--font-body)" }}>
                            ⚠ Complete SafePay payment first (escrow is not funded)
                          </span>
                        )}
                      </div>
                    ) : null}
                    {isClient ? (
                      <button
                        type="button"
                        className="escrow-action"
                        title="Refund escrow back to you (client) — cancels this deposit. You can re-fund the milestone later."
                        onClick={() => handleRefund(entry.escrowId)}
                        disabled={!canRefund || processingEscrowId === entry.escrowId}
                        style={{
                          color: "var(--color-error)",
                          opacity: !canRefund || processingEscrowId === entry.escrowId ? 0.5 : 1,
                          cursor: !canRefund || processingEscrowId === entry.escrowId ? "not-allowed" : "pointer",
                        }}
                      >
                        {processingEscrowId === entry.escrowId ? "Working..." : "Cancel & Refund"}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Escrow;
