import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { contractService } from "../api/services/contractService";
import { useAuth } from "../context/AuthContext";
import EscrowModal from "../components/ui/EscrowModal";
import { skillsService } from "../api/services/skillsService";
import { useToast } from "../context/ToastContext";

function ContractWorkspace() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("milestones");
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [techOptions, setTechOptions] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [removingTechId, setRemovingTechId] = useState(null);

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  useEffect(() => {
    const fetchTechOptions = async () => {
      try {
        const res = await skillsService.getAllTechnologies();
        setTechOptions(res.data?.data || []);
      } catch (err) {
        addToast(err?.response?.data?.message || "Failed to load tech options.", "error");
      }
    };
    fetchTechOptions();
  }, [addToast]);

  const fetchContractDetails = async () => {
    try {
      setIsLoading(true);
      setLoadError("");
      const res = await contractService.getContractById(id);
      if (res.data) setContract(res.data.data);
    } catch (err) {
      console.error(err);
      setLoadError(err?.response?.data?.message || "Failed to load contract workspace.");
      setContract(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequiredTech = async () => {
    if (!contract?.contractID) return;
    if (!selectedTechId) {
      addToast("Select a technology to add.", "error");
      return;
    }
    const existingIds = (contract.technologies || contract.requiredTechs || [])
      .map((t) => t.techID || t.tech?.techID)
      .filter(Boolean);
    if (existingIds.includes(selectedTechId)) {
      addToast("This technology is already required.", "error");
      return;
    }

    setIsAddingTech(true);
    try {
      await contractService.addRequiredTech(contract.contractID, {
        techID: selectedTechId,
        requiredLevel: "INTERMEDIATE",
        purpose: "Required for project delivery",
      });
      setSelectedTechId("");
      await fetchContractDetails();
      addToast("Technology added.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to add technology.", "error");
    } finally {
      setIsAddingTech(false);
    }
  };

  const handleRemoveRequiredTech = async (techId) => {
    if (!contract?.contractID || !techId) return;
    setRemovingTechId(techId);
    try {
      await contractService.removeRequiredTech(contract.contractID, techId);
      await fetchContractDetails();
      addToast("Technology removed.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to remove technology.", "error");
    } finally {
      setRemovingTechId(null);
    }
  };

  return (
    <>
      <style>{`
        .workspace-tab {
          padding: 1rem 2rem;
          cursor: pointer;
          font-family: var(--font-headline);
          font-weight: 500;
          color: var(--color-on-surface-variant);
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .workspace-tab.active {
          color: var(--color-on-surface);
          border-bottom: 2px solid var(--color-primary);
        }
        .ambient-card {
          background: var(--color-surface-container-low);
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .neon-btn {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
          color: var(--color-on-primary);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-family: var(--font-headline);
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }
        .neon-btn:hover { opacity: 0.9; }
      `}</style>
      
      <Sidebar activePage="Contracts" role={user?.role?.toLowerCase() || "developer"} />
      
      {escrowModalOpen && (
        <EscrowModal 
          contractId={contract?.contractID} 
          onClose={() => setEscrowModalOpen(false)} 
        />
      )}

      <main className="sidebar-layout-main" style={{ marginLeft: "256px", flex: 1, padding: "calc(96px + 3rem) 3rem 3rem 3rem" }}>
        
        {isLoading ? (
           <p style={{ color: "var(--color-on-surface-variant)" }}>Loading workspace matrix...</p>
        ) : loadError ? (
           <p style={{ color: "var(--color-error)" }}>{loadError}</p>
        ) : !contract ? (
           <p style={{ color: "var(--color-on-surface-variant)" }}>Contract unavailable.</p>
        ) : (
          <div className="anim-fade-in">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "3rem", margin: 0, color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
                  {contract.title}
                </h1>
                <p style={{ color: "var(--color-primary)", marginTop: "0.5rem", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem" }}>
                  Status: {contract.status.replace('_', ' ')} • Budget: ${contract.totalAmount ?? contract.budget ?? 0}
                </p>
              </div>
              <button className="neon-btn" onClick={() => setEscrowModalOpen(true)}>Manage Escrow</button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--color-outline-variant)", marginBottom: "3rem" }}>
              {["milestones", "team", "bugs"].map(tab => (
                <div 
                  key={tab}
                  className={`workspace-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>

            {/* Content Pane */}
            <div className="ambient-card">
              {activeTab === "milestones" && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "1rem" }}>Project Milestones</h2>
                  <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.1rem", marginBottom: "0.75rem" }}>
                      Required Tech Stack
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "0.75rem" }}>
                      {(contract.technologies || contract.requiredTechs || []).length > 0 ? (
                        (contract.technologies || contract.requiredTechs || []).map((t) => {
                          const techId = t.techID || t.tech?.techID;
                          const techName = t.tech?.techName || t.techName || techId || "Tech";
                          return (
                            <span
                              key={techId || techName}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                background: "var(--color-surface-container)",
                                padding: "4px 10px",
                                borderRadius: 4,
                              }}
                            >
                              {techName}
                              {user?.role === "CLIENT" ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRequiredTech(techId)}
                                  disabled={removingTechId === techId}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: removingTechId === techId ? "not-allowed" : "pointer",
                                    color: "var(--color-error)",
                                    fontWeight: 700,
                                  }}
                                >
                                  {removingTechId === techId ? "..." : "x"}
                                </button>
                              ) : null}
                            </span>
                          );
                        })
                      ) : (
                        <p style={{ color: "var(--color-on-surface-variant)" }}>No required technologies yet.</p>
                      )}
                    </div>

                    {user?.role === "CLIENT" ? (
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                        <select
                          value={selectedTechId}
                          onChange={(e) => setSelectedTechId(e.target.value)}
                          style={{
                            background: "var(--color-surface)",
                            color: "var(--color-on-surface)",
                            border: "1px solid var(--color-outline-variant)",
                            borderRadius: 4,
                            padding: "6px 10px",
                            minWidth: 220,
                          }}
                        >
                          <option value="">Select technology</option>
                          {techOptions.map((opt) => (
                            <option key={opt.techID} value={opt.techID}>
                              {opt.techName}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleAddRequiredTech}
                          disabled={isAddingTech}
                          style={{
                            background: "var(--color-secondary)",
                            color: "var(--color-on-secondary)",
                            border: "none",
                            borderRadius: 4,
                            padding: "6px 14px",
                            cursor: isAddingTech ? "not-allowed" : "pointer",
                            fontFamily: "var(--font-headline)",
                            fontWeight: 700,
                          }}
                        >
                          {isAddingTech ? "Adding..." : "Add Tech"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {contract.milestones?.length > 0 ? (
                    <ul>{contract.milestones.map((m) => <li key={m.milestoneID || m.title}>{m.title}</li>)}</ul>
                  ) : (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>No milestones defined yet.</p>
                  )}
                </div>
              )}

              {activeTab === "team" && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "1rem" }}>Assigned Team</h2>
                  {contract.assignments?.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "8px 0", color: "var(--color-on-surface-variant)", fontSize: 13 }}>Developer</th>
                          <th style={{ textAlign: "left", padding: "8px 0", color: "var(--color-on-surface-variant)", fontSize: 13 }}>Role</th>
                          <th style={{ textAlign: "left", padding: "8px 0", color: "var(--color-on-surface-variant)", fontSize: 13 }}>Pay Share</th>
                          {user?.role === "CLIENT" ? <th style={{ padding: "8px 0" }}></th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {contract.assignments.map((a) => (
                          <tr key={a.assignmentID || a.developer?.developerID || a.developer?.userID} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                            <td style={{ padding: "12px 0" }}>{a.developer?.user?.fullName || "Developer"}</td>
                            <td style={{ padding: "12px 0" }}>
                              {user?.role === "CLIENT" ? (
                                <select
                                  defaultValue={a.role}
                                  onChange={async (e) => {
                                    try {
                                      await contractService.updateTeamMember(a.assignmentID, { role: e.target.value });
                                      fetchContractDetails();
                                    } catch (err) {
                                      addToast(err?.response?.data?.message || "Failed to update team member.", "error");
                                    }
                                  }}
                                  style={{ background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: 4, padding: "4px 8px" }}
                                >
                                  <option value="LEAD">Lead</option>
                                  <option value="DEVELOPER">Developer</option>
                                  <option value="REVIEWER">Reviewer</option>
                                </select>
                              ) : a.role}
                            </td>
                            <td style={{ padding: "12px 0" }}>{a.paymentShare ?? a.contributionPercentage ?? "-"}%</td>
                            {user?.role === "CLIENT" ? (
                              <td style={{ padding: "12px 0", textAlign: "right" }}>
                                <button
                                  onClick={async () => {
                                    if (!window.confirm("Remove this developer from the team?")) return;
                                    try {
                                      await contractService.removeTeamMember(a.assignmentID);
                                      fetchContractDetails();
                                    } catch (err) {
                                      addToast(err?.response?.data?.message || "Failed to remove team member.", "error");
                                    }
                                  }}
                                  style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", fontSize: 13 }}
                                >
                                  Remove
                                </button>
                              </td>
                            ) : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>No developers assigned yet.</p>
                  )}
                </div>
              )}

              {activeTab === "bugs" && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "1rem" }}>Active Bug Reports</h2>
                  {contract.bugReports?.length > 0 ? (
                    <ul>{contract.bugReports.map((bug) => <li key={bug.bugID || bug.title}>{bug.title}</li>)}</ul>
                  ) : (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>No bug reports created yet.</p>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </>
  );
}

export default ContractWorkspace;
