import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import {
  milestones,
  milestoneFilters,
  milestoneStatusColors,
  milestoneEscrowColors,
} from "../data/mockData";

function Milestones() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredMilestones =
    activeFilter === "All"
      ? milestones
      : milestones.filter((m) => m.status === activeFilter);

  // Summary stats
  const totalAmount = milestones.reduce((sum, m) => {
    return sum + parseFloat(m.amount.replace("$", "").replace(",", ""));
  }, 0);

  const completedAmount = milestones
    .filter((m) => m.status === "Completed")
    .reduce((sum, m) => {
      return sum + parseFloat(m.amount.replace("$", "").replace(",", ""));
    }, 0);

  return (
    <div
      style={{
        backgroundColor: "#051614",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Milestones" role="client" />

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
            top: "-50px",
            right: "5%",
            width: "500px",
            height: "500px",
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div>
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
              Milestones
            </h1>
            <p
              style={{
                color: "#83d3df",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
              }}
            >
              Track deliverables and escrow payments across all contracts
            </p>
          </div>
          <button
            onClick={() => navigate("/post-contract")}
            style={{
              padding: "0.875rem 2rem",
              background: "linear-gradient(135deg, #ffb691 0%, #e37434 100%)",
              color: "#4e1d00",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
            onMouseEnter={(e) => (e.target.style.filter = "brightness(1.1)")}
            onMouseLeave={(e) => (e.target.style.filter = "brightness(1)")}
          >
            Add Milestone
          </button>
        </header>

        {/* SUMMARY CARDS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
            marginBottom: "3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {[
            {
              label: "Total Milestones",
              value: milestones.length,
              icon: "flag",
              color: "#83d3df",
            },
            {
              label: "Completed",
              value: milestones.filter((m) => m.status === "Completed").length,
              icon: "check_circle",
              color: "#4ade80",
            },
            {
              label: "Total Value",
              value: `$${totalAmount.toLocaleString()}`,
              icon: "account_balance_wallet",
              color: "#ffb691",
            },
            {
              label: "Released",
              value: `$${completedAmount.toLocaleString()}`,
              icon: "payments",
              color: "#e37434",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#0d1f1d",
                padding: "1.75rem",
                borderBottom: `2px solid ${stat.color}`,
                transition: "transform 0.2s",
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
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#d2e7e3",
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
                  color: "#a58b80",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
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
          {milestoneFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: "6px 18px",
                background: activeFilter === filter ? "#e37434" : "#263836",
                color: activeFilter === filter ? "#4e1d00" : "#83d3df",
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
              {filter}
            </button>
          ))}
        </div>

        {/* MILESTONE CARDS */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {filteredMilestones.map((milestone, index) => (
            <div
              key={milestone.milestoneId}
              style={{
                background: "#0d1f1d",
                borderLeft: `4px solid ${milestoneStatusColors[milestone.status].color}`,
                padding: "2rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1b2d2b")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#0d1f1d")
              }
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
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 700,
                        color: "#ffb691",
                        fontSize: "0.875rem",
                      }}
                    >
                      {milestone.milestoneId}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "rgba(131,211,223,0.6)",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {milestone.contractId} — {milestone.contractTitle}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#d2e7e3",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {milestone.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(210,231,227,0.55)",
                      fontFamily: "Inter, sans-serif",
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
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Due Date
                      </p>
                      <p
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "#d2e7e3",
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
                            color: "#a58b80",
                            fontFamily: "Inter, sans-serif",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Completed
                        </p>
                        <p
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
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
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
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
                          fontFamily: "Inter, sans-serif",
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
                            color: "#a58b80",
                            fontFamily: "Inter, sans-serif",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Deposited
                        </p>
                        <p
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "#d2e7e3",
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
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#ffb691",
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
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {milestone.status}
                  </span>

                  {/* Progress Bar */}
                  <div style={{ marginTop: "1.5rem" }}>
                    <div
                      style={{
                        height: "2px",
                        background: "#263836",
                        width: "160px",
                        overflow: "hidden",
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
                        color: "#a58b80",
                        fontFamily: "Inter, sans-serif",
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
