import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { useToast } from "../context/ToastContext";
import { postContractSteps } from "../data/mockData";
import { contractService, applicationService } from "../api/services/contractService";

function PostContract() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [milestones, setMilestones] = useState([
    {
      title: "Initial Architecture & Design Audit",
      amount: "$4,500",
      due: "Nov 12",
    },
  ]);
  const [formData, setFormData] = useState({
    // App info (Step 1 — used to create Application record)
    appName: "",
    appType: "WEB",
    appDescription: "",
    // Contract info (Step 2)
    title: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    contractType: "Full-Stack Overhaul",
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

  const submitContract = async () => {
    try {
      if (!formData.title || !formData.description || !formData.budget || !formData.startDate) {
        addToast("Fill in Title, Description, Budget, and Start Date before submitting.", "error");
        return;
      }
      if (!formData.appName) {
        addToast("App name is required in Step 1.", "error");
        return;
      }
      setIsProcessing(true);

      // Step 1: Create the Application record first (backend requires appID on contract)
      const appRes = await applicationService.createApplication({
        appName: formData.appName || formData.title,
        appType: formData.appType || "WEB",
        description: formData.appDescription || formData.description,
      });
      const appID = appRes.data?.data?.appID;

      if (!appID) throw new Error("Failed to initialize application record.");

      // Step 2: Create the Contract linked to the Application
      await contractService.createContract({
        appID,
        title: formData.title,
        description: formData.description,
        totalAmount: Number(formData.budget),   // backend field is totalAmount
        startDate: formData.startDate,
        endDate: formData.endDate || null,
      });

      addToast("Contract compiled and dispatched successfully.", "success");
      navigate("/client/dashboard");
    } catch (err) {
      addToast(err.response?.data?.message || "Contract compilation failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const progress = (step / 4) * 100;

  // Inject scoped styles for responsiveness
  const layoutStyles = `
    .post-contract-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 3rem;
    }
    @media (max-width: 1024px) {
      .post-contract-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  return (
    <>
      <style>{layoutStyles}</style>
      <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh" }}>
        <main
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "120px 2rem 5rem",
            position: "relative",
          }}
        >
          <div
            className="teal-glow"
            style={{
              position: "absolute",
              top: "-20px",
              left: "-20px",
              width: "600px",
              height: "600px",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div
            className="post-contract-grid anim-fade-in-up"
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* LEFT — FORM */}
            <div>
              <header style={{ marginBottom: "3rem" }}>
                <h1
                  style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "var(--color-on-surface)",
                    marginBottom: "1rem",
                  }}
                >
                  Create Contract
                </h1>
                <p
                  style={{
                    color: "var(--color-secondary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "1.1rem",
                    maxWidth: "36rem",
                  }}
                >
                  Define the product brief, publish the contract, and open the
                  hiring lane for developer proposals or direct invitations.
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
                      fontFamily: "var(--font-label)",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: "var(--color-outline)",
                    }}
                  >
                    Step {String(step).padStart(2, "0")} of 04:{" "}
                    {postContractSteps[step - 1]}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontWeight: 700,
                      color: "var(--color-primary)",
                    }}
                  >
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div
                  style={{ height: "2px", width: "100%", background: "var(--color-surface-container-highest)" }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "var(--color-primary)",
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
                          background: i + 1 <= step ? "var(--color-primary)" : "var(--color-surface-container-highest)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s",
                          borderRadius: "50%",
                        }}
                      >
                        {i + 1 < step ? (
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1rem", color: "var(--color-on-primary-container)" }}
                          >
                            check
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: i + 1 <= step ? "var(--color-on-primary-container)" : "var(--color-secondary)",
                              fontFamily: "var(--font-headline)",
                            }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        )}
                      </div>
                      <span
                        className="hide-mobile"
                        style={{
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: i + 1 <= step ? "var(--color-primary)" : "var(--color-outline)",
                          fontFamily: "var(--font-label)",
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
              <div style={{ background: "var(--color-surface-container-low)", padding: "2.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", boxShadow: "var(--shadow-elevated)" }}>
                {/* STEP 1 */}
                {step === 1 && (
                  <div
                    className="anim-fade-in"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2rem",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontSize: "1.25rem",
                        color: "var(--color-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      App Details
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
                            marginBottom: "0.75rem",
                          }}
                        >
                          App Name
                        </label>
                        <input
                          name="appName"
                          value={formData.appName}
                          onChange={handleInput}
                          placeholder="e.g. Codex Core"
                          type="text"
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            borderBottom: "2px solid var(--color-outline-variant-strong)",
                            padding: "0.75rem 0",
                            color: "var(--color-on-surface)",
                            fontSize: "1.1rem",
                            outline: "none",
                            fontFamily: "var(--font-body)",
                            transition: "border-color 0.3s ease",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderBottomColor = "var(--color-secondary)")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderBottomColor =
                              "var(--color-outline-variant-strong)")
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
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
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
                            background: "var(--color-surface-container)",
                            border: "none",
                            borderBottom: "2px solid var(--color-outline-variant-strong)",
                            padding: "0.75rem 0",
                            color: "var(--color-on-surface)",
                            fontSize: "1.1rem",
                            outline: "none",
                            fontFamily: "var(--font-body)",
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
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-label)",
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
                          borderBottom: "2px solid var(--color-outline-variant-strong)",
                          padding: "0.75rem 0",
                          color: "var(--color-on-surface)",
                          fontSize: "1rem",
                          outline: "none",
                          fontFamily: "var(--font-body)",
                          lineHeight: 1.7,
                          resize: "none",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderBottomColor = "var(--color-secondary)")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderBottomColor =
                            "var(--color-outline-variant-strong)")
                        }
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div
                    className="anim-fade-in"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2rem",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontSize: "1.25rem",
                        color: "var(--color-secondary)",
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
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-label)",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Contract Title
                      </label>
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleInput}
                        placeholder="The Codex Design Implementation"
                        type="text"
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          borderBottom: "2px solid var(--color-outline-variant-strong)",
                          padding: "0.75rem 0",
                          color: "var(--color-on-surface)",
                          fontSize: "1.25rem",
                          outline: "none",
                          fontFamily: "var(--font-headline)",
                          fontWeight: 700,
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderBottomColor = "var(--color-secondary)")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderBottomColor =
                            "var(--color-outline-variant-strong)")
                        }
                      />
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
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
                            borderBottom: "2px solid var(--color-outline-variant-strong)",
                            padding: "0.75rem 0",
                            color: "var(--color-on-surface)",
                            fontSize: "1rem",
                            outline: "none",
                            fontFamily: "var(--font-body)",
                            transition: "border-color 0.3s ease",
                          }}
                          onFocus={(e) =>
                          (e.target.style.borderBottomColor = "var(--color-secondary)")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderBottomColor =
                              "var(--color-outline-variant-strong)")
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
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
                            marginBottom: "0.75rem",
                          }}
                        >
                          End Date (Optional)
                        </label>
                        <input
                          name="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={handleInput}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            borderBottom: "2px solid var(--color-outline-variant-strong)",
                            padding: "0.75rem 0",
                            color: "var(--color-on-surface)",
                            fontSize: "1rem",
                            outline: "none",
                            fontFamily: "var(--font-body)",
                            transition: "border-color 0.3s ease",
                          }}
                          onFocus={(e) =>
                          (e.target.style.borderBottomColor = "var(--color-secondary)")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderBottomColor =
                              "var(--color-outline-variant-strong)")
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
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
                            marginBottom: "0.75rem",
                          }}
                        >
                          Total Amount (USD)
                        </label>
                        <input
                          name="budget"
                          value={formData.budget}
                          onChange={handleInput}
                          placeholder="25000"
                          type="number"
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            borderBottom: "2px solid var(--color-outline-variant-strong)",
                            padding: "0.75rem 0",
                            color: "var(--color-on-surface)",
                            fontSize: "1.25rem",
                            outline: "none",
                            fontFamily: "var(--font-headline)",
                            transition: "border-color 0.3s ease",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderBottomColor = "var(--color-secondary)")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderBottomColor =
                              "var(--color-outline-variant-strong)")
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
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
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
                                background: "var(--color-secondary)",
                                color: "var(--color-on-secondary-container)",
                                padding: "2px 10px",
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                                fontFamily: "var(--font-label)",
                                fontWeight: 700,
                                borderRadius: "4px"
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          <span
                            style={{
                              background: "var(--color-surface-container-highest)",
                              color: "var(--color-secondary)",
                              padding: "2px 10px",
                              fontSize: "0.7rem",
                              textTransform: "uppercase",
                              fontFamily: "var(--font-label)",
                              fontWeight: 700,
                              cursor: "pointer",
                              borderRadius: "4px"
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
                    className="anim-fade-in"
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
                          fontFamily: "var(--font-headline)",
                          fontSize: "1.25rem",
                          color: "var(--color-secondary)",
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
                          color: "var(--color-secondary)",
                          cursor: "pointer",
                          fontFamily: "var(--font-label)",
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
                          background: "var(--color-surface-container)",
                          padding: "1.5rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          borderRadius: "4px"
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
                                color: "var(--color-primary)",
                                fontFamily: "var(--font-headline)",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                              }}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <h4
                              style={{
                                fontFamily: "var(--font-headline)",
                                fontSize: "1.1rem",
                                color: "var(--color-on-surface)",
                              }}
                            >
                              {milestone.title}
                            </h4>
                          </div>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--color-outline)",
                              fontFamily: "var(--font-body)",
                              marginLeft: "2.5rem",
                            }}
                          >
                            Milestone {index + 1} deliverable
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontFamily: "var(--font-headline)",
                              fontWeight: 700,
                              color: "var(--color-on-surface)",
                              display: "block",
                            }}
                          >
                            {milestone.amount}
                          </span>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              textTransform: "uppercase",
                              color: "var(--color-outline)",
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
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-label)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Market Match Strength
                      </span>
                      <div
                        style={{
                          height: "4px",
                          flex: 1,
                          background: "var(--color-surface-container-highest)",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "2px"
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            background:
                              "linear-gradient(to right, var(--color-secondary), var(--color-primary))",
                            width: "88%",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-headline)",
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "var(--color-primary)",
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
                    className="anim-fade-in"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2rem",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontSize: "1.25rem",
                        color: "var(--color-secondary)",
                      }}
                    >
                      Review & Submit
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                          style={{ background: "var(--color-surface-container-highest)", padding: "1.25rem", borderRadius: "4px" }}
                        >
                          <p
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.15em",
                              color: "var(--color-outline)",
                              fontFamily: "var(--font-label)",
                              marginBottom: "0.5rem",
                            }}
                          >
                            {item.label}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-headline)",
                              fontWeight: 700,
                              color: "var(--color-on-surface)",
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
                    borderTop: "1px solid var(--color-outline-variant-strong)",
                    marginTop: "2rem",
                    flexWrap: "wrap",
                    gap: "1rem"
                  }}
                >
                  <button
                    onClick={() =>
                      step > 1 ? setStep(step - 1) : navigate("/client/dashboard")
                    }
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--color-outline)",
                      cursor: "pointer",
                      fontFamily: "var(--font-headline)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--color-on-surface)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--color-outline)")}
                  >
                    {step > 1 ? "← Back" : "Save as Draft"}
                  </button>
                  <button
                    onClick={() =>
                      step < 4 ? setStep(step + 1) : submitContract()
                    }
                    disabled={isProcessing}
                    className="signature-cta"
                    style={{
                      padding: "1rem 3rem",
                      color: "var(--color-on-primary-container)",
                      fontFamily: "var(--font-headline)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      border: "none",
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      transition: "filter 0.2s",
                      letterSpacing: "-0.02em",
                      borderRadius: "4px",
                      opacity: isProcessing ? 0.7 : 1
                    }}
                    onMouseEnter={(e) =>
                      !isProcessing && (e.target.style.filter = "brightness(1.1)")
                    }
                    onMouseLeave={(e) =>
                      !isProcessing && (e.target.style.filter = "brightness(1)")
                    }
                  >
                    {isProcessing ? "Transmitting..." : (step < 4 ? "Continue →" : "Submit Contract ✓")}
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
                  background: "var(--color-tertiary-fixed)",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-card)"
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
                      background: "var(--color-on-tertiary-fixed)",
                      border: "1px solid var(--color-on-tertiary-fixed)",
                      padding: "4px 10px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--color-tertiary-fixed)",
                      fontFamily: "var(--font-label)",
                      borderRadius: "4px"
                    }}
                  >
                    Live Preview
                  </span>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "var(--color-on-tertiary-fixed)", fontSize: "1.25rem" }}
                  >
                    visibility
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      color: "var(--color-on-tertiary-fixed)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {formData.title || formData.appName || "Your Contract Title"}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-on-tertiary-container)",
                      fontFamily: "var(--font-body)",
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
                    borderTop: "1px solid var(--color-outline-variant)",
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: "var(--color-on-tertiary-fixed-variant)",
                        fontFamily: "var(--font-label)",
                      }}
                    >
                      Est. Budget
                    </span>
                    <span
                      style={{
                        fontSize: "1.25rem",
                        fontFamily: "var(--font-headline)",
                        fontWeight: 700,
                        color: "var(--color-on-tertiary-fixed)",
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
                        color: "var(--color-on-tertiary-fixed-variant)",
                        fontFamily: "var(--font-label)",
                      }}
                    >
                      Type
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        fontFamily: "var(--font-headline)",
                        fontWeight: 700,
                        color: "var(--color-on-tertiary-fixed)",
                      }}
                    >
                      {formData.contractType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editorial Tip */}
              <div style={{ background: "var(--color-surface-container-high)", padding: "2rem", borderRadius: "8px" }}>
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
                    style={{ color: "var(--color-primary)", fontSize: "1.25rem" }}
                  >
                    tips_and_updates
                  </span>
                  <h4
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                      letterSpacing: "0.15em",
                      color: "var(--color-secondary)",
                    }}
                  >
                    Editorial Tip
                  </h4>
                </div>
                <p
                  style={{
                    color: "var(--color-on-surface)",
                    opacity: 0.8,
                    fontSize: "0.875rem",
                    fontStyle: "italic",
                    fontFamily: "var(--font-body)",
                    lineHeight: 1.7,
                  }}
                >
                  "Detailed milestones increase match accuracy by 34%. Top talent
                  looks for clear deliverables and structured timelines."
                </p>
              </div>

              {/* Steps Overview */}
              <div style={{ background: "var(--color-surface-container-highest)", padding: "2rem", borderRadius: "8px" }}>
                <p
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "var(--color-outline)",
                    fontFamily: "var(--font-label)",
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
                          ? "1px solid var(--color-outline-variant-strong)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        background: i + 1 <= step ? "var(--color-primary)" : "var(--color-surface-container-low)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.3s",
                        borderRadius: "50%"
                      }}
                    >
                      {i + 1 < step ? (
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "0.75rem", color: "var(--color-on-primary-container)" }}
                        >
                          check
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: i + 1 <= step ? "var(--color-on-primary-container)" : "var(--color-secondary)",
                            fontWeight: 700,
                            fontFamily: "var(--font-headline)",
                          }}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: i + 1 <= step ? "var(--color-on-surface)" : "var(--color-outline)",
                        fontFamily: "var(--font-body)",
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
    </>
  );
}

export default PostContract;
