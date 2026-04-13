import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import {
  earningsTransactions,
  earningsTabs,
  earningsStatusColors,
} from "../data/mockData";

function Earnings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");

  const filtered =
    activeTab === "All"
      ? earningsTransactions
      : earningsTransactions.filter((t) => t.paymentStatus === activeTab);

  // Total calculations
  const totalReleased = earningsTransactions
    .filter((t) => t.paymentStatus === "Released")
    .reduce(
      (sum, t) =>
        sum + parseFloat(t.depositAmount.replace("$", "").replace(",", "")),
      0,
    );

  const totalHeld = earningsTransactions
    .filter((t) => t.paymentStatus === "Held")
    .reduce(
      (sum, t) =>
        sum + parseFloat(t.depositAmount.replace("$", "").replace(",", "")),
      0,
    );

  const totalPending = earningsTransactions
    .filter((t) => t.paymentStatus === "Pending" && t.depositAmount)
    .reduce(
      (sum, t) =>
        sum + parseFloat(t.depositAmount.replace("$", "").replace(",", "")),
      0,
    );

  return (
    <div
      style={{
        backgroundColor: "#051614",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Earnings" role="developer" />

      <main
        style={{
          marginLeft: "256px",
          flex: 1,
          padding: "3rem",
          position: "relative",
        }}
      >
        {/* Teal Glow */}
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "5%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(0,107,118,0.3) 0%, rgba(5,22,20,0) 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* HEADER */}
        <header
          style={{
            marginBottom: "3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#d2e7e3",
              lineHeight: 1,
              marginBottom: "0.75rem",
            }}
          >
            Earnings
          </h1>
          <p
            style={{
              color: "#83d3df",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.9rem",
            }}
          >
            Escrow transactions and payment history
          </p>
        </header>

        {/* EARNINGS OVERVIEW — Big Visual Cards */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "2px",
            marginBottom: "3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Total Released — Cream Card */}
          <div style={{ background: "#e8e5b5", padding: "2.5rem" }}>
            <span
              className="material-symbols-outlined"
              style={{
                color: "#323210",
                fontSize: "2rem",
                display: "block",
                marginBottom: "1.5rem",
              }}
            >
              payments
            </span>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "3rem",
                fontWeight: 700,
                color: "#1d1d01",
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
                color: "#494825",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Total Released
            </p>
          </div>

          {/* In Escrow */}
          <div
            style={{
              background: "#0d1f1d",
              padding: "2.5rem",
              borderBottom: "2px solid #83d3df",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: "#83d3df",
                fontSize: "2rem",
                display: "block",
                marginBottom: "1.5rem",
              }}
            >
              lock
            </span>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "3rem",
                fontWeight: 700,
                color: "#d2e7e3",
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
                color: "#83d3df",
                fontFamily: "Inter, sans-serif",
              }}
            >
              In Escrow
            </p>
          </div>

          {/* Pending */}
          <div
            style={{
              background: "#0d1f1d",
              padding: "2.5rem",
              borderBottom: "2px solid #e37434",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: "#e37434",
                fontSize: "2rem",
                display: "block",
                marginBottom: "1.5rem",
              }}
            >
              pending
            </span>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "3rem",
                fontWeight: 700,
                color: "#d2e7e3",
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
                color: "#e37434",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Awaiting Deposit
            </p>
          </div>
        </section>

        {/* FILTER TABS */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "2rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {earningsTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 18px",
                background: activeTab === tab ? "#e37434" : "#263836",
                color: activeTab === tab ? "#4e1d00" : "#83d3df",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                transition: "all 0.2s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TRANSACTIONS TABLE */}
        <section style={{ position: "relative", zIndex: 1 }}>
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
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#83d3df",
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
                background: "rgba(86,66,57,0.2)",
              }}
            />
          </div>

          <div style={{ background: "#0d1f1d", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#263836",
                    borderBottom: "1px solid rgba(86,66,57,0.15)",
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
                        color: "#83d3df",
                        fontFamily: "Inter, sans-serif",
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
                          ? "1px solid rgba(86,66,57,0.1)"
                          : "none",
                      transition: "background 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#1b2d2b")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Escrow ID */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#ffb691",
                        }}
                      >
                        {txn.escrowId}
                      </span>
                      {txn.transactionRef && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.65rem",
                            color: "rgba(131,211,223,0.4)",
                            fontFamily: "Inter, sans-serif",
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
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.875rem",
                          color: "#d2e7e3",
                          fontWeight: 500,
                          marginBottom: "0.2rem",
                        }}
                      >
                        {txn.milestoneTitle}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "rgba(131,211,223,0.5)",
                          fontFamily: "Inter, sans-serif",
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
                          color: "#83d3df",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {txn.contractId}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color:
                            txn.paymentStatus === "Released"
                              ? "#4ade80"
                              : "#d2e7e3",
                        }}
                      >
                        {txn.depositAmount}
                      </span>
                    </td>

                    {/* Payment Share */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "#ffb691",
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
                          fontFamily: "Inter, sans-serif",
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
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
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
                            fontFamily: "Inter, sans-serif",
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
