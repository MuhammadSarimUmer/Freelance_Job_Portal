import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import {
  earningsTabs,
  earningsStatusColors,
} from "../data/mockData";
import { useToast } from "../context/ToastContext";
import { escrowService } from "../api/services/escrowService";

function Earnings() {
  const [activeTab, setActiveTab] = useState("All");
  const { addToast } = useToast();

  const [earningsTransactions, setEarningsTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString();
  };

  const mapPaymentStatus = (backendPaymentStatus) => {
    switch (backendPaymentStatus) {
      case "RELEASED":
        return "Released";
      case "DEPOSITED":
        return "Held";
      case "PENDING":
        return "Pending";
      case "REFUNDED":
      default:
        return "Pending";
    }
  };

  useEffect(() => {
    const fetchEscrows = async () => {
      try {
        setIsLoading(true);
        const res = await escrowService.getEscrowHistory();
        const history = res.data?.data || res.data || [];

        const txns = history.map((e) => {
          const paymentStatus = mapPaymentStatus(e.paymentStatus);
          const amountNum = Number(e.depositAmount ?? 0);
          const depositAmount = `$${Number.isFinite(amountNum) ? amountNum.toFixed(2).replace(/\\.00$/, "") : "0"}`;

          return {
            escrowId: e.escrowID,
            milestoneTitle: e.milestone?.title || "Milestone",
            milestoneId: e.milestone?.milestoneID || null,
            contractId: e.milestone?.contract?.contractID || null,
            depositAmount,
            paymentShare: "100%",
            paymentStatus,
            transactionRef: e.transactionReference || null,
            depositDate: formatDate(e.depositDate),
            releaseDate: formatDate(e.releaseDate),
          };
        });

        setEarningsTransactions(txns);
      } catch (err) {
        console.error("Failed to load earnings:", err);
        addToast(err?.response?.data?.message || "Failed to load earnings.", "error");
        setEarningsTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEscrows();
  }, [addToast]);

  const filtered = useMemo(() => {
    return activeTab === "All"
      ? earningsTransactions
      : earningsTransactions.filter((t) => t.paymentStatus === activeTab);
  }, [activeTab, earningsTransactions]);

  // Total calculations
  const totalReleased = useMemo(() => earningsTransactions
    .filter((t) => t.paymentStatus === "Released")
    .reduce(
      (sum, t) =>
        sum + parseFloat(t.depositAmount.replace("$", "").replace(",", "")),
      0,
    ), [earningsTransactions]);

  const totalHeld = useMemo(() => earningsTransactions
    .filter((t) => t.paymentStatus === "Held")
    .reduce(
      (sum, t) =>
        sum + parseFloat(t.depositAmount.replace("$", "").replace(",", "")),
      0,
    ), [earningsTransactions]);

  const totalPending = useMemo(() => earningsTransactions
    .filter((t) => t.paymentStatus === "Pending" && t.depositAmount)
    .reduce(
      (sum, t) =>
        sum + parseFloat(t.depositAmount.replace("$", "").replace(",", "")),
      0,
    ), [earningsTransactions]);

  return (
    <div
      style={{
        backgroundColor: "var(--color-background)",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Earnings" role="developer" />

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
            bottom: "20%",
            left: "5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* HEADER */}
        <header
          className="anim-fade-in-up"
          style={{
            marginBottom: "3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
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
            Earnings
          </h1>
          <p
            style={{
              color: "var(--color-secondary)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
            }}
          >
            Escrow transactions and payment history
          </p>
        </header>

        {isLoading ? (
          <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "3rem" }}>
            Loading earnings...
          </p>
        ) : null}

        {/* EARNINGS OVERVIEW — Big Visual Cards */}
        <section
          className="anim-fade-in-up anim-delay-1"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Total Released — Highlight Card */}
          <div style={{ background: "var(--color-tertiary-fixed)", padding: "2.5rem", borderRadius: "8px", boxShadow: "var(--shadow-card)" }}>
            <span
              className="material-symbols-outlined"
              style={{
                color: "var(--color-on-tertiary-fixed)",
                fontSize: "2rem",
                display: "block",
                marginBottom: "1.5rem",
              }}
            >
              payments
            </span>
            <h2
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "3rem",
                fontWeight: 700,
                color: "var(--color-on-tertiary-fixed)",
                lineHeight: 1,
                marginBottom: "0.75rem",
              }}
            >
              ${totalReleased.toLocaleString()}
            </h2>
            <p
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--color-on-tertiary-fixed-variant)",
                fontFamily: "var(--font-label)",
              }}
            >
              Total Released
            </p>
          </div>

          {/* In Escrow */}
          <div
            style={{
              background: "var(--color-surface-container-low)",
              padding: "2.5rem",
              borderBottom: "2px solid var(--color-secondary)",
              borderRadius: "8px",
              borderRight: "1px solid var(--color-outline-variant)",
              borderTop: "1px solid var(--color-outline-variant)",
              borderLeft: "1px solid var(--color-outline-variant)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: "var(--color-secondary)",
                fontSize: "2rem",
                display: "block",
                marginBottom: "1.5rem",
              }}
            >
              lock
            </span>
            <h2
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "3rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                lineHeight: 1,
                marginBottom: "0.75rem",
              }}
            >
              ${totalHeld.toLocaleString()}
            </h2>
            <p
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--color-secondary)",
                fontFamily: "var(--font-label)",
              }}
            >
              In Escrow
            </p>
          </div>

          {/* Pending */}
          <div
            style={{
              background: "var(--color-surface-container-low)",
              padding: "2.5rem",
              borderBottom: "2px solid var(--color-primary)",
              borderRadius: "8px",
              borderRight: "1px solid var(--color-outline-variant)",
              borderTop: "1px solid var(--color-outline-variant)",
              borderLeft: "1px solid var(--color-outline-variant)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: "var(--color-primary)",
                fontSize: "2rem",
                display: "block",
                marginBottom: "1.5rem",
              }}
            >
              pending
            </span>
            <h2
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "3rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                lineHeight: 1,
                marginBottom: "0.75rem",
              }}
            >
              ${totalPending.toLocaleString()}
            </h2>
            <p
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--color-primary)",
                fontFamily: "var(--font-label)",
              }}
            >
              Awaiting Deposit
            </p>
          </div>
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
          {earningsTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 18px",
                background: activeTab === tab ? "var(--color-primary)" : "var(--color-surface-container-highest)",
                color: activeTab === tab ? "var(--color-on-primary-container)" : "var(--color-secondary)",
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
              {tab}
            </button>
          ))}
        </div>

        {/* TRANSACTIONS TABLE */}
        <section className="anim-slide-up anim-delay-3" style={{ position: "relative", zIndex: 1 }}>
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
              Transaction History
            </h2>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "var(--color-outline-variant-strong)",
              }}
            />
          </div>

          <div style={{ background: "var(--color-surface-container-low)", overflowX: "auto", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <table style={{ width: "100%", minWidth: "800px", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "var(--color-surface-container-highest)",
                    borderBottom: "1px solid var(--color-outline-variant-strong)",
                  }}
                >
                  {[
                    "Escrow ID",
                    "Milestone",
                    "Contract",
                    "Amount",
                    "Payment Share",
                    "Status",
                    "Date",
                  ].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "1rem 1.5rem",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "var(--color-secondary)",
                        fontFamily: "var(--font-label)",
                        fontWeight: 700,
                        textAlign: "left",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn, index) => (
                  <tr
                    key={txn.escrowId}
                    style={{
                      borderBottom:
                        index < filtered.length - 1
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
                    {/* Escrow ID */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-headline)",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "var(--color-primary)",
                        }}
                      >
                        {txn.escrowId}
                      </span>
                      {txn.transactionRef && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.65rem",
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-body)",
                            marginTop: "0.2rem",
                          }}
                        >
                          {txn.transactionRef}
                        </span>
                      )}
                    </td>

                    {/* Milestone */}
                    <td
                      style={{ padding: "1.25rem 1.5rem", maxWidth: "200px" }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--font-body)",
                          fontSize: "0.875rem",
                          color: "var(--color-on-surface)",
                          fontWeight: 500,
                          marginBottom: "0.2rem",
                        }}
                      >
                        {txn.milestoneTitle}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {txn.milestoneId}
                      </span>
                    </td>

                    {/* Contract */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-secondary)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {txn.contractId}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-headline)",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color:
                            txn.paymentStatus === "Released"
                              ? "#4ade80"
                              : "var(--color-on-surface)",
                        }}
                      >
                        {txn.depositAmount}
                      </span>
                    </td>

                    {/* Payment Share */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-headline)",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "var(--color-primary)",
                        }}
                      >
                        {txn.paymentShare}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 12px",
                          background:
                            earningsStatusColors[txn.paymentStatus].bg,
                          color: earningsStatusColors[txn.paymentStatus].color,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "var(--font-label)",
                          borderRadius: "4px"
                        }}
                      >
                        {txn.paymentStatus}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-body)",
                          display: "block",
                        }}
                      >
                        {txn.depositDate || "Not yet"}
                      </span>
                      {txn.releaseDate && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#4ade80",
                            fontFamily: "var(--font-body)",
                            marginTop: "0.2rem",
                            display: "block",
                          }}
                        >
                          ✓ Released {txn.releaseDate}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ marginTop: "4rem" }}>
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default Earnings;
