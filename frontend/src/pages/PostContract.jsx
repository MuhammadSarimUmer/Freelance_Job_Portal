import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { postContractSteps } from "../data/mockData";
import { contractService, applicationService } from "../api/services/contractService";
import { milestoneService } from "../api/services/milestoneService";
import { skillsService } from "../api/services/skillsService";
import { normalizeTechName } from "../utils/techName";

const PostContract = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [milestoneDeferred, setMilestoneDeferred] = useState(false);
  const [techOptions, setTechOptions] = useState([]);
  const [customTechName, setCustomTechName] = useState("");
  const [customTechCategory, setCustomTechCategory] = useState("");
  const [isCreatingTech, setIsCreatingTech] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState({ title: "", amount: "", due: "" });
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
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
    techTags: [],
  });

  const budgetValue = Number(formData.budget || 0);
  const totalMilestoneAmount = milestones.reduce((sum, milestone) => sum + Number(milestone.amount || 0), 0);
  const remainingBudget = Math.max(budgetValue - totalMilestoneAmount, 0);
  const editingMilestone = editingMilestoneId
    ? milestones.find((milestone) => milestone.id === editingMilestoneId)
    : null;
  const editRemainingBudget = budgetValue > 0
    ? Math.max(budgetValue - (totalMilestoneAmount - Number(editingMilestone?.amount || 0)), 0)
    : 0;

  const handleInput = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addMilestone = () => {
    const amountValue = Number(milestoneDraft.amount);
    if (!milestoneDraft.title.trim() || !milestoneDraft.amount || !milestoneDraft.due) {
      addToast("Provide milestone title, amount and due date first.", "error");
      return;
    }
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      addToast("Milestone amount must be greater than zero.", "error");
      return;
    }

    const editingMilestone = editingMilestoneId
      ? milestones.find((milestone) => milestone.id === editingMilestoneId)
      : null;
    const editingAmount = editingMilestone ? Number(editingMilestone.amount || 0) : 0;
    const maxAllowed = Number(formData.budget || 0) > 0
      ? Number(formData.budget || 0) - (totalMilestoneAmount - editingAmount)
      : null;

    if (Number(formData.budget || 0) > 0 && amountValue > maxAllowed) {
      addToast("Milestone exceeds remaining budget.", "error");
      return;
    }

    setMilestoneDeferred(false);
    if (editingMilestoneId) {
      setMilestones((prev) => prev.map((milestone) => (
        milestone.id === editingMilestoneId
          ? {
            ...milestone,
            title: milestoneDraft.title.trim(),
            amount: amountValue,
            dueDate: milestoneDraft.due,
          }
          : milestone
      )));
      setEditingMilestoneId(null);
    } else {
      setMilestones((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: milestoneDraft.title.trim(),
          amount: amountValue,
          dueDate: milestoneDraft.due,
        },
      ]);
    }
    setMilestoneDraft({ title: "", amount: "", due: "" });
  };

  const removeMilestone = (id) => {
    setMilestones((prev) => {
      const next = prev.filter((milestone) => milestone.id !== id);
      if (next.length === 0) {
        setMilestoneDeferred(false);
      }
      return next;
    });
    if (editingMilestoneId === id) {
      setEditingMilestoneId(null);
      setMilestoneDraft({ title: "", amount: "", due: "" });
    }
  };

  const startEditMilestone = (milestone) => {
    if (!milestone) return;
    setMilestoneDraft({
      title: milestone.title || "",
      amount: milestone.amount || "",
      due: milestone.dueDate || "",
    });
    setEditingMilestoneId(milestone.id);
  };

  const cancelEditMilestone = () => {
    setEditingMilestoneId(null);
    setMilestoneDraft({ title: "", amount: "", due: "" });
  };

  const generateMilestones = (count = 3) => {
    const budgetValue = Number(formData.budget || 0);
    if (!budgetValue || budgetValue <= 0) {
      addToast("Add a total budget before generating milestones.", "error");
      return;
    }
    const startBase = formData.startDate ? new Date(formData.startDate) : new Date();
    const endBase = formData.endDate ? new Date(formData.endDate) : null;
    const rangeMs = endBase && endBase > startBase ? endBase - startBase : null;
    const stepMs = rangeMs ? Math.floor(rangeMs / count) : 1000 * 60 * 60 * 24 * 14;
    const baseAmount = Math.floor((budgetValue / count) * 100) / 100;
    const milestonesGenerated = Array.from({ length: count }).map((_, index) => {
      const isLast = index === count - 1;
      const amount = isLast
        ? Math.max(0, Math.round((budgetValue - baseAmount * (count - 1)) * 100) / 100)
        : baseAmount;
      const dueDate = new Date(startBase.getTime() + stepMs * (index + 1));
      return {
        id: crypto.randomUUID(),
        title: `Milestone ${index + 1}`,
        amount,
        dueDate: dueDate.toISOString().slice(0, 10),
      };
    });
    setMilestoneDeferred(false);
    setMilestones(milestonesGenerated);
    setEditingMilestoneId(null);
    setMilestoneDraft({ title: "", amount: "", due: "" });
  };

  const deferMilestones = () => {
    const budgetValue = Number(formData.budget || 0);
    if (!budgetValue || budgetValue <= 0) {
      addToast("Add a total budget before deferring milestones.", "error");
      return;
    }
    const dueDate = formData.endDate || formData.startDate || new Date().toISOString().slice(0, 10);
    setMilestoneDeferred(true);
    setMilestones([
      {
        id: crypto.randomUUID(),
        title: "Milestones to be defined",
        amount: budgetValue,
        dueDate,
      },
    ]);
    setEditingMilestoneId(null);
    setMilestoneDraft({ title: "", amount: "", due: "" });
  };

  useEffect(() => {
    const fetchTech = async () => {
      try {
        const res = await skillsService.getAllTechnologies();
        setTechOptions(res.data?.data || []);
      } catch (err) {
        addToast(err?.response?.data?.message || "Failed to load tech stack options.", "error");
      }
    };
    fetchTech();
  }, [addToast]);

  const handleCreateTechnology = async () => {
    if (!customTechName.trim()) {
      addToast("Enter a technology name.", "error");
      return;
    }
    const categoryValue = customTechCategory.trim() || "Custom";

    setIsCreatingTech(true);
    try {
      const normalized = normalizeTechName(customTechName.trim());
      await skillsService.createTechnology({
        techName: customTechName.trim(),
        category: categoryValue,
      });
      addToast("Technology added.", "success");
      setCustomTechName("");
      setCustomTechCategory("");
      setFormData((prev) => ({
        ...prev,
        techTags: prev.techTags.includes(normalized)
          ? prev.techTags
          : [...prev.techTags, normalized],
      }));
      const res = await skillsService.getAllTechnologies();
      setTechOptions(res.data?.data || []);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to add technology.", "error");
    } finally {
      setIsCreatingTech(false);
    }
  };

  const toggleTechTag = (techName) => {
    const normalized = normalizeTechName(techName);
    setFormData((prev) => ({
      ...prev,
      techTags: prev.techTags.includes(normalized)
        ? prev.techTags.filter((tag) => tag !== normalized)
        : [...prev.techTags, normalized],
    }));
  };

  const submitContract = async () => {
    try {
      if (!user?.phoneNumber) {
        addToast("Add a contact number before posting a contract.", "error");
        navigate("/settings");
        return;
      }
      if (!formData.title || !formData.description || !formData.budget || !formData.startDate) {
        addToast("Fill in Title, Description, Budget, and Start Date before submitting.", "error");
        return;
      }
      if (formData.title.trim().length < 3) {
        addToast("Contract title must be at least 3 characters.", "error");
        return;
      }
      if (!formData.appName) {
        addToast("App name is required in Step 1.", "error");
        return;
      }
      const startDateObj = new Date(formData.startDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      if (startDateObj < todayDate) {
        addToast("Start date cannot be in the past.", "error");
        return;
      }
      if (formData.endDate && new Date(formData.endDate) <= startDateObj) {
        addToast("End date must be after start date.", "error");
        return;
      }
      if (milestones.length === 0) {
        addToast("Add at least one milestone or choose 'Discuss later'.", "error");
        return;
      }
      if (budgetValue > 0 && totalMilestoneAmount > budgetValue) {
        addToast("Milestones exceed the total budget.", "error");
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
      const contractRes = await contractService.createContract({
        appID,
        title: formData.title,
        description: formData.description,
        totalAmount: Number(formData.budget),   // backend field is totalAmount
        startDate: formData.startDate,
        endDate: formData.endDate || null,
      });
      const contractID = contractRes.data?.data?.contractID;

      if (contractID && formData.techTags.length > 0) {
        const selectedTech = techOptions.filter((tech) =>
          formData.techTags.includes(normalizeTechName(tech.techName)),
        );
        await Promise.all(selectedTech.map((tech) =>
          contractService.addRequiredTech(contractID, {
            techID: tech.techID,
            requiredLevel: "INTERMEDIATE",
            purpose: "Required for project delivery",
          })
        ));
      }

      if (contractID && milestones.length > 0) {
        await Promise.all(milestones.map((milestone) =>
          milestoneService.createMilestone({
            contractID,
            title: milestone.title,
            description: milestoneDeferred ? "Milestones to be refined after kickoff." : "",
            dueDate: milestone.dueDate,
            milestoneAmount: Number(milestone.amount),
          })
        ));
      }

      addToast("Contract compiled and dispatched successfully.", "success");
      navigate("/client/dashboard");
    } catch (err) {
      addToast(err.response?.data?.message || "Contract compilation failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const progress = (step / 4) * 100;
  const milestoneCoverage = budgetValue > 0 ? Math.min(totalMilestoneAmount / budgetValue, 1) : 0;
  const milestoneCoveragePercent = Math.round(milestoneCoverage * 100);
  const appTypeLabelMap = {
    WEB: "Web Application",
    MOBILE: "Mobile App",
    DESKTOP: "Desktop App",
    INTERNAL: "Internal Tools",
  };
  const appTypeLabel = appTypeLabelMap[formData.appType] || "Web Application";

  const isStep1Complete = Boolean(formData.appName.trim()) && Boolean(formData.description.trim());
  const isStep2Complete = formData.title.trim().length >= 3 && Boolean(formData.description.trim()) && budgetValue > 0 && Boolean(formData.startDate);
  const isStep3Complete = milestones.length > 0 && (budgetValue === 0 || totalMilestoneAmount <= budgetValue);
  const canContinue = step === 1 ? isStep1Complete : step === 2 ? isStep2Complete : step === 3 ? isStep3Complete : true;

  const handleStepChange = (nextStep) => {
    if (nextStep === 2 && step === 1 && !formData.title.trim() && formData.appName.trim()) {
      setFormData((prev) => ({ ...prev, title: prev.appName.trim() }));
    }

    if (nextStep <= step) {
      setStep(nextStep);
      return;
    }

    const checks = [
      { step: 1, ok: isStep1Complete, message: "Complete the app details before continuing." },
      { step: 2, ok: isStep2Complete, message: "Complete the contract info before continuing." },
      { step: 3, ok: isStep3Complete, message: "Add milestones that fit within the budget." },
    ];

    for (const check of checks) {
      if (nextStep > check.step && !check.ok) {
        addToast(check.message, "error");
        return;
      }
    }

    setStep(nextStep);
  };

  // Inject scoped styles for responsiveness
  const layoutStyles = `
    .post-contract-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 3rem;
    }
    .tech-add-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .tech-add-btn {
      align-self: flex-start;
      padding: 0.6rem 1.5rem;
    }
    .input-field {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 2px solid var(--color-outline-variant-strong);
      padding: 0.75rem 0;
      color: var(--color-on-surface);
      font-size: 1rem;
      outline: none;
      font-family: var(--font-body);
      transition: border-color 0.3s ease;
    }
    .input-field:focus {
      border-bottom-color: var(--color-secondary);
    }
    .tech-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.7rem;
      text-transform: uppercase;
      font-family: var(--font-label);
      font-weight: 700;
      letter-spacing: 0.08em;
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
                  Define the product brief, open the contract, and invite
                  developers for proposals or direct invitations.
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
                      onClick={() => handleStepChange(i + 1)}
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
                          name="appType"
                          value={formData.appType}
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
                          <option value="WEB">Web Application</option>
                          <option value="MOBILE">Mobile App</option>
                          <option value="DESKTOP">Desktop App</option>
                          <option value="INTERNAL">Internal Tools</option>
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
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        <label
                          style={{
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
                          }}
                        >
                          Contract Title
                        </label>
                        <span style={{ fontSize: "0.7rem", color: "var(--color-outline)", fontFamily: "var(--font-body)" }}>
                          — describes the work engagement (auto-filled from app name, editable)
                        </span>
                      </div>
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
                          min={new Date().toISOString().slice(0, 10)}
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
                          min={formData.startDate || new Date().toISOString().slice(0, 10)}
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
                        <div className="tech-add-grid" style={{ marginBottom: "0.75rem" }}>
                          <input
                            placeholder="Tech name (e.g. Rust)"
                            value={customTechName}
                            onChange={(e) => setCustomTechName(e.target.value)}
                            className="input-field"
                            disabled={isCreatingTech}
                          />
                          <input
                            placeholder="Category (e.g. Backend)"
                            value={customTechCategory}
                            onChange={(e) => setCustomTechCategory(e.target.value)}
                            className="input-field"
                            disabled={isCreatingTech}
                          />
                          <button
                            type="button"
                            onClick={handleCreateTechnology}
                            disabled={isCreatingTech}
                            className="tech-add-btn"
                            style={{
                              background: "var(--color-surface-container-high)",
                              color: "var(--color-primary)",
                              border: "none",
                              borderRadius: "4px",
                              fontFamily: "var(--font-headline)",
                              fontWeight: 700,
                              cursor: isCreatingTech ? "not-allowed" : "pointer",
                              opacity: isCreatingTech ? 0.65 : 1,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {isCreatingTech ? "Adding..." : "Add New Tech"}
                          </button>
                        </div>
                        <div style={{ marginTop: "0.5rem", display: "grid", gap: "0.75rem" }}>
                          <div>
                            <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-outline)", fontFamily: "var(--font-label)" }}>
                              Selected
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.4rem" }}>
                              {formData.techTags.length > 0 ? (
                                formData.techTags.map((tag) => (
                                  <span key={tag} className="tech-chip" style={{ background: "var(--color-secondary)", color: "var(--color-on-secondary-container)" }}>
                                    {normalizeTechName(tag)}
                                    <button
                                      type="button"
                                      onClick={() => toggleTechTag(tag)}
                                      style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontWeight: 700, padding: 0, lineHeight: 1 }}
                                    >
                                      x
                                    </button>
                                  </span>
                                ))
                              ) : (
                                <span style={{ color: "var(--color-outline)", fontSize: "0.75rem" }}>No tech selected yet.</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-outline)", fontFamily: "var(--font-label)" }}>
                              Suggestions
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.4rem" }}>
                              {techOptions.slice(0, 12).map((tech) => {
                                const normalized = normalizeTechName(tech.techName);
                                const selected = formData.techTags.includes(normalized);
                                return (
                                  <span
                                    key={tech.techID}
                                    className="tech-chip"
                                    onClick={() => toggleTechTag(tech.techName)}
                                    style={{
                                      background: selected ? "var(--color-secondary)" : "var(--color-surface-container-highest)",
                                      color: selected ? "var(--color-on-secondary-container)" : "var(--color-secondary)",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {normalized}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
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
                        gap: "1rem",
                        flexWrap: "wrap",
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
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => generateMilestones(3)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            background: "transparent",
                            border: "1px solid var(--color-outline-variant)",
                            color: "var(--color-on-surface)",
                            cursor: "pointer",
                            fontFamily: "var(--font-label)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "4px",
                          }}
                        >
                          Auto-generate
                        </button>
                        <button
                          type="button"
                          onClick={deferMilestones}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            background: "transparent",
                            border: "1px solid var(--color-outline-variant)",
                            color: "var(--color-on-surface)",
                            cursor: "pointer",
                            fontFamily: "var(--font-label)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "4px",
                          }}
                        >
                          Discuss later
                        </button>
                        <button
                          type="button"
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
                            {editingMilestoneId ? "save" : "add"}
                          </span>
                          {editingMilestoneId ? "Save Changes" : "Add Milestone"}
                        </button>
                        {editingMilestoneId ? (
                          <button
                            type="button"
                            onClick={cancelEditMilestone}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              background: "transparent",
                              border: "1px solid var(--color-outline-variant)",
                              color: "var(--color-on-surface)",
                              cursor: "pointer",
                              fontFamily: "var(--font-label)",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              padding: "0.4rem 0.75rem",
                              borderRadius: "4px",
                            }}
                          >
                            Cancel Edit
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.75rem", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      <span>Budget: ${budgetValue ? budgetValue.toLocaleString() : "0"}</span>
                      <span>Planned: ${totalMilestoneAmount.toLocaleString()}</span>
                      <span>Remaining: ${remainingBudget.toLocaleString()}</span>
                    </div>
                    {budgetValue > 0 && totalMilestoneAmount > budgetValue ? (
                      <p style={{ margin: 0, color: "var(--color-error)", fontSize: "0.85rem" }}>
                        Milestones exceed the total budget.
                      </p>
                    ) : null}
                    {milestoneDeferred ? (
                      <p style={{ margin: 0, color: "var(--color-on-surface-variant)", fontSize: "0.85rem" }}>
                        Milestones are marked as "to be defined." You can edit them later.
                      </p>
                    ) : null}
                    {milestones.map((milestone, index) => (
                      <div
                        key={milestone.id || index}
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
                            ${Number(milestone.amount || 0).toLocaleString()}
                          </span>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              textTransform: "uppercase",
                              color: "var(--color-outline)",
                              letterSpacing: "0.1em",
                            }}
                          >
                            Due {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : "TBD"}
                          </span>
                          <button
                            type="button"
                            onClick={() => startEditMilestone(milestone)}
                            style={{
                              marginTop: "0.75rem",
                              background: "transparent",
                              border: "1px solid var(--color-outline-variant)",
                              color: "var(--color-on-surface)",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              fontFamily: "var(--font-label)",
                              fontWeight: 700,
                              padding: "0.35rem 0.75rem",
                              borderRadius: "4px",
                              marginRight: "0.5rem",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMilestone(milestone.id)}
                            style={{
                              marginTop: "0.75rem",
                              background: "transparent",
                              border: "none",
                              color: "var(--color-error)",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              fontFamily: "var(--font-label)",
                              fontWeight: 700,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div style={{ background: "var(--color-surface-container)", padding: "1rem", borderRadius: "6px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
                      <input
                        value={milestoneDraft.title}
                        onChange={(e) => setMilestoneDraft((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Milestone title"
                        style={{ width: "100%", background: "transparent", border: "1px solid var(--color-outline-variant)", color: "var(--color-on-surface)", padding: "0.75rem", borderRadius: "4px" }}
                      />
                      <input
                        type="number"
                        min="1"
                        max={editingMilestoneId ? editRemainingBudget || undefined : remainingBudget || undefined}
                        value={milestoneDraft.amount}
                        onChange={(e) => setMilestoneDraft((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="Amount"
                        style={{ width: "100%", background: "transparent", border: "1px solid var(--color-outline-variant)", color: "var(--color-on-surface)", padding: "0.75rem", borderRadius: "4px" }}
                      />
                      <input
                        type="date"
                        value={milestoneDraft.due}
                        onChange={(e) => setMilestoneDraft((prev) => ({ ...prev, due: e.target.value }))}
                        style={{ width: "100%", background: "transparent", border: "1px solid var(--color-outline-variant)", color: "var(--color-on-surface)", padding: "0.75rem", borderRadius: "4px" }}
                      />
                    </div>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Remaining budget: ${(editingMilestoneId ? editRemainingBudget : remainingBudget).toLocaleString()}
                    </p>
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
                        Milestone Budget Coverage
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
                            width: `${milestoneCoveragePercent}%`,
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
                        {milestoneCoveragePercent}%
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
                        { label: "App Type", value: appTypeLabel },
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
                    <p style={{ margin: 0, color: "var(--color-on-surface-variant)", fontSize: "0.9rem" }}>
                      Open contracts stay editable until a developer is assigned. After that, edits are locked to protect both sides.
                    </p>
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
                    {step > 1 ? "← Back" : "Back to Dashboard"}
                  </button>
                  <button
                    onClick={() =>
                      step < 4 ? handleStepChange(step + 1) : submitContract()
                    }
                    disabled={isProcessing || (step < 4 && !canContinue)}
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
                      opacity: isProcessing || (step < 4 && !canContinue) ? 0.7 : 1
                    }}
                    onMouseEnter={(e) =>
                      !isProcessing && canContinue && (e.target.style.filter = "brightness(1.1)")
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
                      {appTypeLabel}
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
