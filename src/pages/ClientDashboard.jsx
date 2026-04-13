import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { clientDashboardStats, clientContracts } from "../data/mockData";

function ClientDashboard() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundColor: "#051614",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Dashboard" role="client" />

      <main
        style={{
          marginLeft: "256px",
          flex: 1,
          padding: "3rem",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(0,107,118,0.15) 0%, rgba(5,22,20,0) 70%)",
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
            marginBottom: "4rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "clamp(2.5rem, 4vw, 4rem)",
                fontWeight: 400,
                letterSpacing: "-0.04em",
                color: "#d2e7e3",
                marginBottom: "0.5rem",
              }}
            >
              Editorial Hub
            </h1>
            <p
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#83d3df",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Operational Overview • Q4 2024
            </p>
          </div>
          <button
            onClick={() => navigate("/post-contract")}
            style={{
              padding: "1rem 2rem",
              background: "linear-gradient(135deg, #ffb691 0%, #e37434 100%)",
              color: "#4e1d00",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(0.98)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Post New Contract
          </button>
        </header>

        {/* STATS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.5fr 1fr 1fr",
            gap: "1.5rem",
            marginBottom: "4rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {clientDashboardStats.map((stat, index) => (
            <div
              key={stat.label}
              style={{
                background: index === 0 ? "#e8e5b5" : "#0d1f1d",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "180px",
                borderBottom: index !== 0 ? `2px solid ${stat.accent}` : "none",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
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
                    color: index === 0 ? "#e37434" : stat.accent,
                  }}
                >
                  {stat.icon}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: index === 0 ? "#494825" : "#83d3df",
                    fontFamily: "Inter, sans-serif",
                    textAlign: "right",
                    maxWidth: "120px",
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "2.25rem",
                  fontWeight: 700,
                  color: index === 0 ? "#1d1d01" : "#ffffff",
                }}
              >
                {stat.value}
              </h3>
            </div>
          ))}
        </section>

        {/* CONTRACTS TABLE */}
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
              Active Contracts
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
                  {["Contract Title", "Developer", "Status", "Deadline"].map(
                    (col) => (
                      <th
                        key={col}
                        style={{
                          padding: "1.25rem 2rem",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          color: "#83d3df",
                          fontFamily: "Inter, sans-serif",
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
                {clientContracts.map((contract, index) => (
                  <tr
                    key={contract.id}
                    style={{
                      borderBottom:
                        index < clientContracts.length - 1
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
                    <td style={{ padding: "1.75rem 2rem" }}>
                      <span
                        style={{
                          display: "block",
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: "1rem",
                          fontWeight: 500,
                          color: "#ffffff",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {contract.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "rgba(131,211,223,0.5)",
                          fontFamily: "Inter, sans-serif",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {contract.id}
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
                            background: "#263836",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            color: "#83d3df",
                            fontFamily: "Space Grotesk, sans-serif",
                          }}
                        >
                          {contract.initials}
                        </div>
                        <span
                          style={{
                            color: "#d2e7e3",
                            fontSize: "0.9rem",
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {contract.developer}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "1.75rem 2rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          background: contract.statusBg,
                          color: contract.statusColor,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td style={{ padding: "1.75rem 2rem", textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontWeight: 700,
                          color: "#d2e7e3",
                          fontSize: "0.9rem",
                        }}
                      >
                        {contract.deadline}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            marginTop: "4rem",
            background: "#0d1f1d",
            padding: "3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ maxWidth: "32rem" }}>
            <h4
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#d2e7e3",
                letterSpacing: "-0.03em",
                marginBottom: "1rem",
              }}
            >
              Hire from the Curated Talent Pool
            </h4>
            <p
              style={{
                color: "#83d3df",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                fontFamily: "Inter, sans-serif",
                marginBottom: "1.5rem",
              }}
            >
              Access our vetted network of 500+ top-tier developers.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                style={{
                  padding: "0.75rem 2rem",
                  background: "#e37434",
                  color: "#4e1d00",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Browse Talent
              </button>
              <button
                style={{
                  padding: "0.75rem 2rem",
                  background: "transparent",
                  border: "1px solid rgba(86,66,57,0.3)",
                  color: "#83d3df",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                View Pricing
              </button>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "4rem",
                fontWeight: 700,
                color: "#ffb691",
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
                color: "#83d3df",
                fontFamily: "Inter, sans-serif",
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
