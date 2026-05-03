import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import {
  bugSeverityColors,
  bugStatusColors,
} from "../data/mockData";
import { useToast } from "../context/ToastContext";
import { contractService } from "../api/services/contractService";
import { bugService } from "../api/services/bugService";
import ConfirmDialog from "../components/ui/ConfirmDialog";

function BugReports() {
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [bugReportsData, setBugReportsData] = useState([]);
  const [updatingBugId, setUpdatingBugId] = useState(null);
  const [deletingBugId, setDeletingBugId] = useState(null);
  const [confirmDeleteBugId, setConfirmDeleteBugId] = useState(null);
  const [editingBugId, setEditingBugId] = useState(null);
  const [editBugForm, setEditBugForm] = useState({ title: "", description: "", severity: "Medium" });
  const [isSavingBug, setIsSavingBug] = useState(false);

  // Form state
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

  const mapSeverityToBackend = (uiSeverity) => {
    switch (uiSeverity) {
      case "Critical":
        return "CRITICAL";
      case "High":
        return "MAJOR";
      case "Medium":
        return "MINOR";
      case "Low":
        return "LOW";
      default:
        return "MINOR";
    }
  };

  const mapStatusToBackend = (uiStatus) => {
    switch (uiStatus) {
      case "In Progress":
        return "IN_PROGRESS";
      case "Resolved":
        return "RESOLVED";
      case "Open":
      default:
        return "REPORTED";
    }
  };

  const fetchBugReports = async (contractList) => {
    const bugsRes = await bugService.getBugs();
    const bugs = bugsRes.data?.data || [];
    const contractMap = new Map((contractList || []).map((c) => [c.contractID, c]));

    const mapped = bugs.map((b) => ({
      bugId: b.bugID || b.id,
      contractId: b.contractID,
      contractTitle: contractMap.get(b.contractID)?.title || "",
      title: b.title,
      description: b.description,
      severity: mapSeverity(b.severity),
      status: mapStatus(b.status),
      createdDate: formatDate(b.createdDate) || "N/A",
      resolvedDate: formatDate(b.resolvedDate),
    }));

    setBugReportsData(mapped);
  };

  const handleSubmit = async () => {
    if (!newBug.contractId) {
      addToast("Select a contract before reporting a bug.", "error");
      return;
    }
    if (!newBug.title.trim()) {
      addToast("Bug title is required.", "error");
      return;
    }

    try {
      await bugService.createBug({
        contractID: newBug.contractId,
        title: newBug.title,
        description: newBug.description,
        severity: mapSeverityToBackend(newBug.severity),
      });
      addToast("Bug reported successfully.", "success");
      setShowForm(false);
      setNewBug({ title: "", description: "", severity: "Medium", contractId: newBug.contractId });
      await fetchBugReports(contracts);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to report bug.", "error");
    }
  };

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString();
  };

  const mapSeverity = (backendSeverity) => {
    switch (backendSeverity) {
      case "CRITICAL":
        return "Critical";
      case "MAJOR":
        return "High";
      case "MINOR":
        return "Medium";
      case "LOW":
        return "Low";
      default:
        return "Medium";
    }
  };

  const mapStatus = (backendStatus) => {
    switch (backendStatus) {
      case "REPORTED":
        return "Open";
      case "IN_PROGRESS":
        return "In Progress";
      case "RESOLVED":
      case "CLOSED":
        return "Resolved";
      default:
        return "Open";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await contractService.getMyContracts();
        const cs = res.data?.data || [];
        setContracts(cs);
        await fetchBugReports(cs);

        if (!newBug.contractId && cs.length > 0) {
          setNewBug((prev) => ({ ...prev, contractId: cs[0].contractID }));
        }
      } catch (err) {
        console.error("Failed to load bug reports:", err);
        addToast(err?.response?.data?.message || "Failed to load bug reports.", "error");
        setBugReportsData([]);
        setContracts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateStatus = async (bugId, status) => {
    if (!bugId) return;
    setUpdatingBugId(bugId);
    try {
      await bugService.updateBugStatus(bugId, mapStatusToBackend(status));
      await fetchBugReports(contracts);
      addToast("Bug status updated.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update bug status.", "error");
    } finally {
      setUpdatingBugId(null);
    }
  };

  const handleDelete = async (bugId) => {
    if (!bugId) return;
    setDeletingBugId(bugId);
    try {
      await bugService.deleteBug(bugId);
      await fetchBugReports(contracts);
      addToast("Bug deleted.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to delete bug.", "error");
    } finally {
      setDeletingBugId(null);
      setConfirmDeleteBugId(null);
    }
  };

  const openEditBug = (bug) => {
    setEditingBugId(bug.bugId);
    setEditBugForm({
      title: bug.title || "",
      description: bug.description || "",
      severity: bug.severity || "Medium",
    });
  };

  const handleSaveBug = async () => {
    if (!editingBugId) return;
    if (!editBugForm.title.trim()) {
      addToast("Bug title is required.", "error");
      return;
    }

    setIsSavingBug(true);
    try {
      await bugService.updateBug(editingBugId, {
        title: editBugForm.title,
        description: editBugForm.description,
        severity: mapSeverityToBackend(editBugForm.severity),
      });
      addToast("Bug updated.", "success");
      setEditingBugId(null);
      await fetchBugReports(contracts);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update bug.", "error");
    } finally {
      setIsSavingBug(false);
    }
  };

  const derivedBugReportStats = useMemo(() => {
    const total = bugReportsData.length;
    const open = bugReportsData.filter((b) => b.status === "Open").length;
    const inProgress = bugReportsData.filter((b) => b.status === "In Progress").length;
    const resolved = bugReportsData.filter((b) => b.status === "Resolved").length;

    return [
      { label: "Total Reports", value: total, icon: "bug_report", color: "#83d3df" },
      { label: "Open", value: open, icon: "error", color: "#e37434" },
      { label: "In Progress", value: inProgress, icon: "pending", color: "#83d3df" },
      { label: "Resolved", value: resolved, icon: "check_circle", color: "#4ade80" },
    ];
  }, [bugReportsData]);

  return (
    <div
      style={{
        backgroundColor: "var(--color-background)",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Bug Reports" role="developer" />

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
            top: "-100px",
            right: "10%",
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
            gap: "1rem",
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
              Bug Reports
            </h1>
            <p
              style={{
                color: "var(--color-secondary)",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
              }}
            >
              Track and manage issues across your active contracts
            </p>
          </div>

          {/* Report New Bug Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className={showForm ? "" : "signature-cta"}
            style={{
              padding: "0.875rem 2rem",
              background: showForm ? "var(--color-surface-container-highest)" : "transparent",
              color: showForm ? "var(--color-secondary)" : "var(--color-on-primary-container)",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "4px"
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

        {isLoading ? (
          <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "3rem" }}>
            Loading bug reports...
          </p>
        ) : null}

        {/* STATS CARDS */}
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
          {derivedBugReportStats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--color-surface-container-low)",
                padding: "1.5rem",
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
                  fontFamily: "var(--font-headline)",
                  fontSize: "2.5rem",
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

        {/* NEW BUG FORM */}
        {showForm && (
          <section
            className="anim-slide-up"
            style={{
              background: "var(--color-surface-container-low)",
              padding: "2.5rem",
              marginBottom: "3rem",
              position: "relative",
              zIndex: 1,
              borderLeft: "4px solid var(--color-primary)",
              borderRadius: "8px",
              borderRight: "1px solid var(--color-outline-variant)",
              borderTop: "1px solid var(--color-outline-variant)",
              borderBottom: "1px solid var(--color-outline-variant)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "1.25rem",
                color: "var(--color-secondary)",
                marginBottom: "2rem",
              }}
            >
              Report a New Bug
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
                    color: "var(--color-secondary)",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    fontFamily: "var(--font-label)",
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
                    background: "var(--color-surface-container)",
                    border: "none",
                    borderBottom: "2px solid var(--color-outline-variant-strong)",
                    padding: "0.75rem 0",
                    color: "var(--color-on-surface)",
                    fontSize: "0.95rem",
                    outline: "none",
                    fontFamily: "var(--font-body)",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select Contract</option>
                  {contracts.map((c) => (
                    <option key={c.contractID} value={c.contractID}>
                      {c.contractID} — {c.title}
                    </option>
                  ))}
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
                    color: "var(--color-secondary)",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    fontFamily: "var(--font-label)",
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
                            : "var(--color-surface-container)",
                        border: `1px solid ${
                          newBug.severity === level
                            ? bugSeverityColors[level].color
                            : "var(--color-outline-variant-strong)"
                        }`,
                        color:
                          newBug.severity === level
                            ? bugSeverityColors[level].color
                            : "var(--color-outline)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        cursor: "pointer",
                        fontFamily: "var(--font-headline)",
                        transition: "all 0.2s",
                        borderRadius: "4px"
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
                  color: "var(--color-secondary)",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  fontFamily: "var(--font-label)",
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
                  borderBottom: "2px solid var(--color-outline-variant-strong)",
                  padding: "0.75rem 0",
                  color: "var(--color-on-surface)",
                  fontSize: "1.1rem",
                  outline: "none",
                  fontFamily: "var(--font-headline)",
                  transition: "border-color 0.3s ease"
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-secondary)")}
                onBlur={(e) =>
                  (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")
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
                  color: "var(--color-secondary)",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  fontFamily: "var(--font-label)",
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
                  borderBottom: "2px solid var(--color-outline-variant-strong)",
                  padding: "0.75rem 0",
                  color: "var(--color-on-surface)",
                  fontSize: "0.95rem",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.7,
                  resize: "none",
                  transition: "border-color 0.3s ease"
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-secondary)")}
                onBlur={(e) =>
                  (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")
                }
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSubmit}
                className="signature-cta"
                style={{
                  padding: "0.875rem 2.5rem",
                  color: "var(--color-on-primary-container)",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  border: "none",
                  cursor: "pointer",
                  transition: "filter 0.2s",
                  borderRadius: "4px"
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

        {editingBugId && (
          <section
            className="anim-slide-up"
            style={{
              background: "var(--color-surface-container-low)",
              padding: "2rem",
              marginBottom: "3rem",
              position: "relative",
              zIndex: 1,
              borderLeft: "4px solid var(--color-secondary)",
              borderRadius: "8px",
              borderRight: "1px solid var(--color-outline-variant)",
              borderTop: "1px solid var(--color-outline-variant)",
              borderBottom: "1px solid var(--color-outline-variant)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "1.25rem",
                color: "var(--color-secondary)",
                marginBottom: "2rem",
              }}
            >
              Edit Bug Report
            </h3>

            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--color-secondary)",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    fontFamily: "var(--font-label)",
                  }}
                >
                  Title
                </label>
                <input
                  value={editBugForm.title}
                  onChange={(e) => setEditBugForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Bug title"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-outline-variant-strong)",
                    padding: "0.75rem 0",
                    color: "var(--color-on-surface)",
                    fontSize: "1.1rem",
                    outline: "none",
                    fontFamily: "var(--font-headline)",
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
                    color: "var(--color-secondary)",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    fontFamily: "var(--font-label)",
                  }}
                >
                  Description
                </label>
                <textarea
                  value={editBugForm.description}
                  onChange={(e) => setEditBugForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-outline-variant-strong)",
                    padding: "0.75rem 0",
                    color: "var(--color-on-surface)",
                    fontSize: "0.95rem",
                    outline: "none",
                    fontFamily: "var(--font-body)",
                    lineHeight: 1.7,
                    resize: "none",
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
                    color: "var(--color-secondary)",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    fontFamily: "var(--font-label)",
                  }}
                >
                  Severity
                </label>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {["Critical", "High", "Medium", "Low"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEditBugForm((prev) => ({ ...prev, severity: level }))}
                      style={{
                        padding: "6px 16px",
                        background:
                          editBugForm.severity === level
                            ? bugSeverityColors[level].bg
                            : "var(--color-surface-container)",
                        border: `1px solid ${
                          editBugForm.severity === level
                            ? bugSeverityColors[level].color
                            : "var(--color-outline-variant-strong)"
                        }`,
                        color:
                          editBugForm.severity === level
                            ? bugSeverityColors[level].color
                            : "var(--color-outline)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        cursor: "pointer",
                        fontFamily: "var(--font-headline)",
                        transition: "all 0.2s",
                        borderRadius: "4px",
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
              <button
                type="button"
                onClick={() => setEditingBugId(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-secondary)",
                  cursor: "pointer",
                  fontFamily: "var(--font-headline)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBug}
                disabled={isSavingBug}
                className="signature-cta"
                style={{
                  padding: "0.75rem 2rem",
                  color: "var(--color-on-primary-container)",
                  border: "none",
                  cursor: isSavingBug ? "not-allowed" : "pointer",
                  borderRadius: "4px",
                }}
              >
                {isSavingBug ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>
        )}

        {/* BUG REPORTS TABLE */}
        <section className="anim-fade-in-up anim-delay-2" style={{ position: "relative", zIndex: 1 }}>
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
              All Reports
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
                      "Bug ID",
                      "Contract",
                      "Title",
                      "Severity",
                      "Status",
                      "Reported",
                      "Actions",
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
                {bugReportsData.map((bug, index) => (
                  <tr
                    key={bug.bugId}
                    style={{
                      borderBottom:
                        index < bugReportsData.length - 1
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
                    {/* Bug ID */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-headline)",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "var(--color-primary)",
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
                          color: "var(--color-secondary)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {bug.contractId}
                      </span>
                      {bug.contractTitle ? (
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.7rem",
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {bug.contractTitle}
                        </span>
                      ) : null}
                    </td>

                    {/* Title + Description */}
                    <td
                      style={{ padding: "1.25rem 1.5rem", maxWidth: "280px" }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--font-headline)",
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: "var(--color-on-surface)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {bug.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-body)",
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
                          fontFamily: "var(--font-label)",
                          borderRadius: "4px"
                        }}
                      >
                        {bug.severity}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <select
                        value={bug.status}
                        onChange={(e) => handleUpdateStatus(bug.bugId, e.target.value)}
                        disabled={updatingBugId === bug.bugId}
                        style={{
                          background: bugStatusColors[bug.status].bg,
                          color: bugStatusColors[bug.status].color,
                          border: "1px solid var(--color-outline-variant-strong)",
                          borderRadius: "4px",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "var(--font-label)",
                          padding: "3px 12px",
                        }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-body)",
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
                            fontFamily: "var(--font-body)",
                            marginTop: "0.2rem",
                          }}
                        >
                          ✓ {bug.resolvedDate}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "1.25rem 1.5rem", display: "flex", gap: "0.75rem" }}>
                      <button
                        type="button"
                        onClick={() => openEditBug(bug)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--color-secondary)",
                          cursor: "pointer",
                          fontFamily: "var(--font-headline)",
                          fontSize: "0.75rem",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteBugId(bug.bugId)}
                        disabled={deletingBugId === bug.bugId}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--color-error)",
                          cursor: deletingBugId === bug.bugId ? "not-allowed" : "pointer",
                          fontFamily: "var(--font-headline)",
                          fontSize: "0.75rem",
                        }}
                      >
                        {deletingBugId === bug.bugId ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <ConfirmDialog
          open={Boolean(confirmDeleteBugId)}
          title="Delete bug report"
          message="This will permanently remove the bug report. This action cannot be undone."
          confirmLabel="Delete"
          tone="danger"
          onConfirm={() => handleDelete(confirmDeleteBugId)}
          onCancel={() => setConfirmDeleteBugId(null)}
        />

        <div style={{ marginTop: "4rem" }}>
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default BugReports;
