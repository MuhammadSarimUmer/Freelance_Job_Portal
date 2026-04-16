import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import {
  milestoneFilters,
  milestoneStatusColors,
  milestoneEscrowColors,
} from "../data/mockData";
import { useToast } from "../context/ToastContext";
import { contractService } from "../api/services/contractService";
import { escrowService } from "../api/services/escrowService";

function Milestones() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const { addToast } = useToast();

  const [milestonesData, setMilestonesData] = useState([]); // UI model

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

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const contractsRes = await contractService.getMyContracts();
        const contracts = contractsRes.data?.data || [];

        const escrowRes = await escrowService.getEscrowHistory();
        const escrowHistory = escrowRes.data?.data || [];

        const escrowByMilestoneID = new Map();
        for (const e of escrowHistory) {
          // PaymentEscrow model uses `milestoneID`
          if (e?.milestoneID) escrowByMilestoneID.set(e.milestoneID, e);
        }

        const derived = [];
        for (const c of contracts) {
          for (const m of c.milestones || []) {
            const escrow = escrowByMilestoneID.get(m.milestoneID);

            const status = mapMilestoneStatus(m.status);
            const escrowStatus = escrow ? mapEscrowStatus(escrow.paymentStatus) : "Not Funded";

            const amountNum = Number(m.milestoneAmount ?? 0);
            const amount = `$${Number.isFinite(amountNum) ? amountNum.toFixed(2).replace(/\\.00$/, "") : "0"}`;

            derived.push({
              milestoneId: m.milestoneID,
              contractId: c.contractID,
              contractTitle: c.title,
              title: m.title,
              description: m.description,
              dueDate: formatDate(m.dueDate) || "N/A",
              completeDate: formatDate(m.completeDate),
              amount,
              status,
              escrowStatus,
              depositDate: escrow ? formatDate(escrow.depositDate) : null,
              releaseDate: escrow ? formatDate(escrow.releaseDate) : null,
            });
          }
        }

        setMilestonesData(derived);
      } catch (err) {
        console.error("Failed to load milestones:", err);
        addToast(err?.response?.data?.message || "Failed to load milestones.", "error");
        setMilestonesData([]);
      }
    };

    fetchMilestones();
  }, [addToast]);

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
            onClick={() => navigate("/post-contract")}
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
            Add Milestone
          </button>
        </header>

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
