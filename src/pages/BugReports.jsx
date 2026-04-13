import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import {
  bugReports,
  bugSeverityColors,
  bugStatusColors,
  bugReportStats,
} from "../data/mockData";

function BugReports() {
  const navigate = useNavigate();

  // Form state — BugReport table ke fields
  const [showForm, setShowForm] = useState(false);
  const [newBug, setNewBug] = useState({
    title: "",
    description: "",
    severity: "Medium",
    contractId: "",
  });

  const handleInput = (e) => {
    setNewBug({ ...newBug, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // Yahan API call hogi baad mein
    setShowForm(false);
    setNewBug({
      title: "",
      description: "",
      severity: "Medium",
      contractId: "",
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#051614",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Bug Reports" role="developer" />

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
            top: "-100px",
            right: "10%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(0,107,118,0.3) 0%, rgba(5,22,20,0) 70%)",
            filter: "blur(40px)",
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
              Bug Reports
            </h1>
            <p
              style={{
                color: "#83d3df",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
              }}
            >
              Track and manage issues across your active contracts
            </p>
          </div>

          {/* Report New Bug Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "0.875rem 2rem",
              background: showForm ? "#263836" : "#e37434",
              color: showForm ? "#83d3df" : "#4e1d00",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "1.1rem" }}
            >
              {showForm ? "close" : "add"}
            </span>
            {showForm ? "Cancel" : "Report Bug"}
          </button>
        </header>

        {/* STATS CARDS */}
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
          {bugReportStats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#0d1f1d",
                padding: "1.5rem",
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: stat.color, fontSize: "1.5rem" }}
                >
                  {stat.icon}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "2.5rem",
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

        {/* NEW BUG FORM — toggle hota hai */}
        {showForm && (
          <section
            style={{
              background: "#0d1f1d",
              padding: "2.5rem",
              marginBottom: "3rem",
              position: "relative",
              zIndex: 1,
              borderLeft: "4px solid #e37434",
            }}
          >
            <h3
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.25rem",
                color: "#83d3df",
                marginBottom: "2rem",
              }}
            >
              Report a New Bug
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                marginBottom: "2rem",
              }}
            >
              {/* Contract ID */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#83d3df",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Contract ID
                </label>
                <select
                  name="contractId"
                  value={newBug.contractId}
                  onChange={handleInput}
                  style={{
                    width: "100%",
                    background: "#112321",
                    border: "none",
                    borderBottom: "2px solid rgba(86,66,57,0.4)",
                    padding: "0.75rem 0",
                    color: "#d2e7e3",
                    fontSize: "0.95rem",
                    outline: "none",
                    fontFamily: "Inter, sans-serif",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select Contract</option>
                  <option value="CN-8829-X">
                    CN-8829-X — Infrastructure Migration
                  </option>
                  <option value="CN-9012-Y">
                    CN-9012-Y — Edge Analytics Dashboard
                  </option>
                  <option value="CN-8744-Z">
                    CN-8744-Z — Core API Refactor
                  </option>
                </select>
              </div>

              {/* Severity */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#83d3df",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Severity
                </label>
                <div
                  style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
                >
                  {["Critical", "High", "Medium", "Low"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setNewBug({ ...newBug, severity: level })}
                      style={{
                        padding: "6px 16px",
                        background:
                          newBug.severity === level
                            ? bugSeverityColors[level].bg
                            : "transparent",
                        border: `1px solid ${
                          newBug.severity === level
                            ? bugSeverityColors[level].color
                            : "rgba(86,66,57,0.3)"
                        }`,
                        color:
                          newBug.severity === level
                            ? bugSeverityColors[level].color
                            : "#a58b80",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bug Title */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#83d3df",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Bug Title
              </label>
              <input
                name="title"
                value={newBug.title}
                onChange={handleInput}
                placeholder="Brief description of the issue"
                type="text"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: "2px solid rgba(86,66,57,0.4)",
                  padding: "0.75rem 0",
                  color: "#d2e7e3",
                  fontSize: "1.1rem",
                  outline: "none",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "#83d3df")}
                onBlur={(e) =>
                  (e.target.style.borderBottomColor = "rgba(86,66,57,0.4)")
                }
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#83d3df",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Detailed Description
              </label>
              <textarea
                name="description"
                value={newBug.description}
                onChange={handleInput}
                placeholder="Steps to reproduce, expected vs actual behavior..."
                rows="4"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: "2px solid rgba(86,66,57,0.4)",
                  padding: "0.75rem 0",
                  color: "#d2e7e3",
                  fontSize: "0.95rem",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.7,
                  resize: "none",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "#83d3df")}
                onBlur={(e) =>
                  (e.target.style.borderBottomColor = "rgba(86,66,57,0.4)")
                }
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSubmit}
                style={{
                  padding: "0.875rem 2.5rem",
                  background: "#e37434",
                  color: "#4e1d00",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  border: "none",
                  cursor: "pointer",
                  transition: "filter 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.filter = "brightness(1.1)")
                }
                onMouseLeave={(e) => (e.target.style.filter = "brightness(1)")}
              >
                Submit Bug Report
              </button>
            </div>
          </section>
        )}

        {/* BUG REPORTS TABLE */}
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
              All Reports
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
                    "Bug ID",
                    "Contract",
                    "Title",
                    "Severity",
                    "Status",
                    "Reported",
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
                {bugReports.map((bug, index) => (
                  <tr
                    key={bug.bugId}
                    style={{
                      borderBottom:
                        index < bugReports.length - 1
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
                    {/* Bug ID */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#ffb691",
                        }}
                      >
                        {bug.bugId}
                      </span>
                    </td>

                    {/* Contract */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#83d3df",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {bug.contractId}
                      </span>
                    </td>

                    {/* Title + Description */}
                    <td
                      style={{ padding: "1.25rem 1.5rem", maxWidth: "280px" }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: "#d2e7e3",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {bug.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(210,231,227,0.45)",
                          fontFamily: "Inter, sans-serif",
                          overflow: "hidden",
                          display: "block",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {bug.description}
                      </span>
                    </td>

                    {/* Severity Badge */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 12px",
                          background: bugSeverityColors[bug.severity].bg,
                          color: bugSeverityColors[bug.severity].color,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {bug.severity}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 12px",
                          background: bugStatusColors[bug.status].bg,
                          color: bugStatusColors[bug.status].color,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {bug.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {bug.createdDate}
                      </span>
                      {bug.resolvedDate && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.7rem",
                            color: "#4ade80",
                            fontFamily: "Inter, sans-serif",
                            marginTop: "0.2rem",
                          }}
                        >
                          ✓ {bug.resolvedDate}
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

export default BugReports;
