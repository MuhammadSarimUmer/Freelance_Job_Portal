import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { postContractSteps } from "../data/mockData";

function PostContract() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [milestones, setMilestones] = useState([
    {
      title: "Initial Architecture & Design Audit",
      amount: "$4,500",
      due: "Nov 12",
    },
  ]);
  const [formData, setFormData] = useState({
    appName: "",
    contractType: "Full-Stack Overhaul",
    title: "",
    description: "",
    startDate: "",
    budget: "",
    techTags: ["React", "Node.js"],
  });

  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "New Milestone", amount: "$0", due: "TBD" },
    ]);
  };

  const progress = (step / 4) * 100;

  return (
    <div style={{ backgroundColor: "#051614", minHeight: "100vh" }}>
      <Navbar />
      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "120px 2rem 5rem",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20px",
            left: "-20px",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(0,107,118,0.4) 0%, rgba(5,22,20,0) 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* LEFT — FORM */}
          <div>
            <header style={{ marginBottom: "3rem" }}>
              <h1
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.03em",
                  color: "#d2e7e3",
                  marginBottom: "1rem",
                }}
              >
                Post a Contract
              </h1>
              <p
                style={{
                  color: "#83d3df",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "1.1rem",
                  maxWidth: "36rem",
                }}
              >
                Define your engineering challenge. Our algorithm matches your
                requirements with top-tier talent.
              </p>
            </header>

            {/* Progress Bar */}
            <div style={{ marginBottom: "4rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "#83d3df",
                  }}
                >
                  Step {String(step).padStart(2, "0")} of 04:{" "}
                  {postContractSteps[step - 1]}
                </span>
                <span
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    color: "#e37434",
                  }}
                >
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <div
                style={{ height: "2px", width: "100%", background: "#263836" }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#e37434",
                    width: `${progress}%`,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              {/* Step Dots */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1rem",
                }}
              >
                {postContractSteps.map((s, i) => (
                  <div
                    key={s}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                    }}
                    onClick={() => setStep(i + 1)}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        background: i + 1 <= step ? "#e37434" : "#263836",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s",
                      }}
                    >
                      {i + 1 < step ? (
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "1rem", color: "#4e1d00" }}
                        >
                          check
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: i + 1 <= step ? "#4e1d00" : "#83d3df",
                            fontFamily: "Space Grotesk, sans-serif",
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: i + 1 <= step ? "#e37434" : "#a58b80",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: i + 1 === step ? 700 : 400,
                      }}
                    >
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <div style={{ background: "#0d1f1d", padding: "2.5rem" }}>
              {/* STEP 1 */}
              {step === 1 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "1.25rem",
                      color: "#83d3df",
                      marginBottom: "0.5rem",
                    }}
                  >
                    App Details
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "2rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
                          marginBottom: "0.75rem",
                        }}
                      >
                        App Name
                      </label>
                      <input
                        name="appName"
                        value={formData.appName}
                        onChange={handleInput}
                        placeholder="e.g. Kinetic Core"
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
                        onFocus={(e) =>
                          (e.target.style.borderBottomColor = "#83d3df")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderBottomColor =
                            "rgba(86,66,57,0.4)")
                        }
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
                          marginBottom: "0.75rem",
                        }}
                      >
                        App Type
                      </label>
                      <select
                        name="contractType"
                        value={formData.contractType}
                        onChange={handleInput}
                        style={{
                          width: "100%",
                          background: "#112321",
                          border: "none",
                          borderBottom: "2px solid rgba(86,66,57,0.4)",
                          padding: "0.75rem 0",
                          color: "#d2e7e3",
                          fontSize: "1.1rem",
                          outline: "none",
                          fontFamily: "Space Grotesk, sans-serif",
                          cursor: "pointer",
                        }}
                      >
                        <option>Web Application</option>
                        <option>Mobile App</option>
                        <option>Desktop App</option>
                        <option>Full-Stack Overhaul</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        color: "#a58b80",
                        fontFamily: "Inter, sans-serif",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInput}
                      placeholder="Describe the tactical goals, expected outcomes..."
                      rows="4"
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: "2px solid rgba(86,66,57,0.4)",
                        padding: "0.75rem 0",
                        color: "#d2e7e3",
                        fontSize: "1rem",
                        outline: "none",
                        fontFamily: "Inter, sans-serif",
                        lineHeight: 1.7,
                        resize: "none",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderBottomColor = "#83d3df")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderBottomColor =
                          "rgba(86,66,57,0.4)")
                      }
                    />
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "1.25rem",
                      color: "#83d3df",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Contract Info
                  </h3>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        color: "#a58b80",
                        fontFamily: "Inter, sans-serif",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Contract Title
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInput}
                      placeholder="The Kinetic Editorial Design Implementation"
                      type="text"
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: "2px solid rgba(86,66,57,0.4)",
                        padding: "0.75rem 0",
                        color: "#d2e7e3",
                        fontSize: "1.25rem",
                        outline: "none",
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 500,
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderBottomColor = "#83d3df")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderBottomColor =
                          "rgba(86,66,57,0.4)")
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "2rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Start Date
                      </label>
                      <input
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInput}
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          borderBottom: "2px solid rgba(86,66,57,0.4)",
                          padding: "0.75rem 0",
                          color: "#d2e7e3",
                          fontSize: "1rem",
                          outline: "none",
                          fontFamily: "Space Grotesk, sans-serif",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Budget (USD)
                      </label>
                      <input
                        name="budget"
                        value={formData.budget}
                        onChange={handleInput}
                        placeholder="25,000"
                        type="number"
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          borderBottom: "2px solid rgba(86,66,57,0.4)",
                          padding: "0.75rem 0",
                          color: "#d2e7e3",
                          fontSize: "1.25rem",
                          outline: "none",
                          fontFamily: "Space Grotesk, sans-serif",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderBottomColor = "#83d3df")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderBottomColor =
                            "rgba(86,66,57,0.4)")
                        }
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Tech Stack
                      </label>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        {formData.techTags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              background: "#006b76",
                              color: "#99e9f6",
                              padding: "2px 10px",
                              fontSize: "0.7rem",
                              textTransform: "uppercase",
                              fontFamily: "Inter, sans-serif",
                              fontWeight: 700,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        <span
                          style={{
                            background: "#263836",
                            color: "#83d3df",
                            padding: "2px 10px",
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          + Add
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "1.25rem",
                        color: "#83d3df",
                      }}
                    >
                      Contract Milestones
                    </h3>
                    <button
                      onClick={addMilestone}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "transparent",
                        border: "none",
                        color: "#83d3df",
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1.1rem" }}
                      >
                        add
                      </span>
                      Add Milestone
                    </button>
                  </div>
                  {milestones.map((milestone, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#263836",
                        padding: "1.5rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              color: "#ffb691",
                              fontFamily: "Space Grotesk, sans-serif",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                            }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h4
                            style={{
                              fontFamily: "Space Grotesk, sans-serif",
                              fontSize: "1.1rem",
                              color: "#d2e7e3",
                            }}
                          >
                            {milestone.title}
                          </h4>
                        </div>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "rgba(210,231,227,0.5)",
                            fontFamily: "Inter, sans-serif",
                            marginLeft: "2.5rem",
                          }}
                        >
                          Milestone {index + 1} deliverable
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            fontWeight: 500,
                            color: "#d2e7e3",
                            display: "block",
                          }}
                        >
                          {milestone.amount}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            color: "#a58b80",
                            letterSpacing: "0.1em",
                          }}
                        >
                          Due {milestone.due}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "#a58b80",
                        fontFamily: "Inter, sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Market Match Strength
                    </span>
                    <div
                      style={{
                        height: "2px",
                        flex: 1,
                        background: "#263836",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background:
                            "linear-gradient(to right, #83d3df, #ffb691)",
                          width: "88%",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#ffb691",
                      }}
                    >
                      88%
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 4 — REVIEW */}
              {step === 4 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "1.25rem",
                      color: "#83d3df",
                    }}
                  >
                    Review & Submit
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1.5rem",
                    }}
                  >
                    {[
                      {
                        label: "App Name",
                        value: formData.appName || "Not specified",
                      },
                      { label: "App Type", value: formData.contractType },
                      {
                        label: "Contract Title",
                        value: formData.title || "Not specified",
                      },
                      {
                        label: "Budget",
                        value: formData.budget
                          ? `$${formData.budget}`
                          : "Not specified",
                      },
                      {
                        label: "Start Date",
                        value: formData.startDate || "Not specified",
                      },
                      {
                        label: "Milestones",
                        value: `${milestones.length} milestones`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{ background: "#263836", padding: "1.25rem" }}
                      >
                        <p
                          style={{
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: "#a58b80",
                            fontFamily: "Inter, sans-serif",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            fontWeight: 600,
                            color: "#d2e7e3",
                            fontSize: "1rem",
                          }}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "2rem",
                  borderTop: "1px solid rgba(86,66,57,0.15)",
                  marginTop: "2rem",
                }}
              >
                <button
                  onClick={() =>
                    step > 1 ? setStep(step - 1) : navigate("/client/dashboard")
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#a58b80",
                    cursor: "pointer",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "0.9rem",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#d2e7e3")}
                  onMouseLeave={(e) => (e.target.style.color = "#a58b80")}
                >
                  {step > 1 ? "← Back" : "Save as Draft"}
                </button>
                <button
                  onClick={() =>
                    step < 4 ? setStep(step + 1) : navigate("/client/dashboard")
                  }
                  style={{
                    padding: "1rem 3rem",
                    background: "#e37434",
                    color: "#4e1d00",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "filter 0.2s",
                    letterSpacing: "-0.02em",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.filter = "brightness(1.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.filter = "brightness(1)")
                  }
                >
                  {step < 4 ? "Continue →" : "Submit Contract ✓"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — PREVIEW SIDEBAR */}
          <div
            style={{
              position: "sticky",
              top: "120px",
              alignSelf: "flex-start",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Live Preview Card */}
            <div
              style={{
                background: "#e8e5b5",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
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
                  style={{
                    background: "rgba(50,50,16,0.15)",
                    border: "1px solid rgba(50,50,16,0.2)",
                    padding: "4px 10px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#42411e",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Live Preview
                </span>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#42411e", fontSize: "1.25rem" }}
                >
                  visibility
                </span>
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "1.5rem",
                    fontWeight: 500,
                    lineHeight: 1.2,
                    color: "#1d1d01",
                    marginBottom: "0.75rem",
                  }}
                >
                  {formData.title || formData.appName || "Your Contract Title"}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#42411e",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  {formData.description ||
                    "Your contract description will appear here..."}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(50,50,16,0.1)",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "rgba(50,50,16,0.5)",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Est. Budget
                  </span>
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 700,
                      color: "#1d1d01",
                    }}
                  >
                    {formData.budget ? `$${formData.budget}` : "$0"}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "rgba(50,50,16,0.5)",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Type
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 700,
                      color: "#1d1d01",
                    }}
                  >
                    {formData.contractType}
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Tip */}
            <div style={{ background: "#0d1f1d", padding: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#83d3df", fontSize: "1.25rem" }}
                >
                  tips_and_updates
                </span>
                <h4
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    color: "#83d3df",
                  }}
                >
                  Editorial Tip
                </h4>
              </div>
              <p
                style={{
                  color: "rgba(210,231,227,0.7)",
                  fontSize: "0.875rem",
                  fontStyle: "italic",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.7,
                }}
              >
                "Detailed milestones increase match accuracy by 34%. Top talent
                looks for clear deliverables and structured timelines."
              </p>
            </div>

            {/* Steps Overview */}
            <div style={{ background: "#1b2d2b", padding: "2rem" }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#a58b80",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "1rem",
                }}
              >
                Your Progress
              </p>
              {postContractSteps.map((s, i) => (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem 0",
                    borderBottom:
                      i < postContractSteps.length - 1
                        ? "1px solid rgba(86,66,57,0.1)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      background: i + 1 <= step ? "#e37434" : "#263836",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.3s",
                    }}
                  >
                    {i + 1 < step ? (
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "0.75rem", color: "#4e1d00" }}
                      >
                        check
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: i + 1 <= step ? "#4e1d00" : "#83d3df",
                          fontWeight: 700,
                          fontFamily: "Space Grotesk, sans-serif",
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: i + 1 <= step ? "#d2e7e3" : "#a58b80",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: i + 1 === step ? 700 : 400,
                    }}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PostContract;
