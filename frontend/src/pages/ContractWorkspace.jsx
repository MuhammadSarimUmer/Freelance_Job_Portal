import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { contractService } from "../api/services/contractService";
import { useAuth } from "../context/AuthContext";
import EscrowModal from "../components/ui/EscrowModal";

function ContractWorkspace() {
  const { id } = useParams();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("milestones");
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

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
                    <ul>
                      {contract.assignments.map((a, i) => (
                        <li key={i}>
                          {a.developer?.user?.fullName || a.developer?.developerID || a.developer?.userID || "Developer"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>No developers assigned.</p>
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
