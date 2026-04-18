import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { profileService } from "../api/services/profileService";
import { contractService } from "../api/services/contractService";
import { useToast } from "../context/ToastContext";

function DeveloperDirectory() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [developers, setDevelopers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState("");
  const [inviteRole, setInviteRole] = useState("Lead Developer");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchDevelopers();
    fetchContracts();
  }, []);

  const refreshData = async () => {
    await fetchDevelopers();
    await fetchContracts();
  };

  const fetchDevelopers = async () => {
    try {
      setIsLoading(true);
      // Fallback to mock if API is empty
      const res = await profileService.getAllDevelopers();
      if (res.data && res.data.data) {
        setDevelopers(res.data.data);
      } else {
        setDevelopers([]);
      }
    } catch (err) {
      console.error(err);
      addToast(err?.response?.data?.message || "Failed to load developers.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      const res = await contractService.getMyContracts();
      const myContracts = res.data?.data || [];
      setContracts(myContracts.filter((contract) => contract.status === "DRAFT"));
    } catch (err) {
      console.error(err);
      addToast(err?.response?.data?.message || "Failed to load contracts for invitations.", "error");
    }
  };

  const handleInvite = async () => {
    if (!selectedDeveloper || !selectedContractId) {
      addToast("Choose a contract before sending an invitation.", "error");
      return;
    }

    try {
      setIsInviting(true);
      await contractService.inviteDeveloper(selectedContractId, {
        developerID: selectedDeveloper.developerID,
        role: inviteRole,
        message: `Invitation sent for ${inviteRole}.`,
      });
      addToast("Invitation sent successfully.", "success");
      setSelectedDeveloper(null);
      setSelectedContractId("");
      setInviteRole("Lead Developer");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to send invitation.", "error");
    } finally {
      setIsInviting(false);
    }
  };

  const filteredDevs = developers.filter((dev) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = dev.user?.fullName?.toLowerCase().includes(term);
    const techMatch = (dev.knownTechs || []).some((kt) =>
      kt.tech?.techName?.toLowerCase().includes(term),
    );
    return nameMatch || techMatch;
  });

  return (
    <>
      <style>{`
        .search-bar-neon {
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--color-outline-variant);
          padding: 0.5rem 1rem;
          color: var(--color-on-surface);
          font-family: var(--font-body);
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          width: 100%;
          max-width: 300px;
        }
        .search-bar-neon:focus {
          border-bottom: 2px solid var(--color-primary);
          box-shadow: 0 4px 15px -10px var(--color-primary);
        }
        .dev-card-monolith {
          background: var(--color-surface-container-low);
          padding: 2rem;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: background 0.3s ease, transform 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .dev-card-monolith:hover {
          background: var(--color-surface-container);
          transform: translateY(-2px);
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
          width: 100%;
          text-align: center;
        }
        .neon-btn:hover {
          opacity: 0.9;
        }
      `}</style>
      
      <Sidebar activePage="Browse Developers" role="client" />

      {selectedDeveloper ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setSelectedDeveloper(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "var(--color-surface-container-low)",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: "8px",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-headline)", marginTop: 0 }}>
              Invite {selectedDeveloper.user?.fullName || "Developer"}
            </h2>
            <p style={{ color: "var(--color-secondary)", marginBottom: "1.5rem" }}>
              Send a direct invitation to one of your open contracts. The developer will be able to accept or decline it.
            </p>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-outline)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Contract
                </label>
                <select
                  value={selectedContractId}
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  style={{ width: "100%", padding: "0.85rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "6px" }}
                >
                  <option value="">Select a draft contract</option>
                  {contracts.map((contract) => (
                    <option key={contract.contractID} value={contract.contractID}>
                      {contract.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-outline)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Role
                </label>
                <input
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{ width: "100%", padding: "0.85rem", background: "var(--color-surface)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "6px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              <button className="neon-btn" onClick={handleInvite} disabled={isInviting || contracts.length === 0}>
                {isInviting ? "Sending..." : "Send Invitation"}
              </button>
              <button
                onClick={() => setSelectedDeveloper(null)}
                style={{ padding: "0.75rem 1.5rem", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "transparent", color: "var(--color-on-surface)", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
            {contracts.length === 0 ? (
              <p style={{ color: "var(--color-outline)", marginTop: "1rem" }}>
                Create a draft contract first before sending invitations.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <main className="sidebar-layout-main" style={{ marginLeft: "256px", flex: 1, padding: "calc(96px + 3rem) 3rem 3rem 3rem", position: "relative" }}>
        
        {/* HEADER AREA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem", flexWrap: "wrap", gap: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "3.5rem", letterSpacing: "-0.02em", color: "var(--color-on-surface)", margin: 0, lineHeight: 1 }}>
            Elite Engineers<br/>Available
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <input 
              type="text" 
              placeholder="Search skills or names..." 
              className="search-bar-neon"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="button"
              onClick={refreshData}
              disabled={isLoading}
              style={{
                padding: "0.65rem 1.25rem",
                borderRadius: "6px",
                border: "1px solid var(--color-outline-variant)",
                background: "transparent",
                color: "var(--color-on-surface)",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* GRID */}
        {isLoading ? (
          <p style={{ color: "var(--color-on-surface-variant)" }}>Scanning the network...</p>
        ) : filteredDevs.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
            {filteredDevs.map((dev) => (
              <div
                key={dev.developerID}
                className="dev-card-monolith"
                onClick={() => navigate(`/developers/${dev.developerID}`)}
                style={{ cursor: "pointer" }}
              >
                
                {/* Top: Name & Rate */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", margin: "0 0 0.5rem 0" }}>{dev.user?.fullName || "Anonymous Dev"}</h2>
                    <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.9rem", margin: 0 }}>
                      {dev.availabilityStatus
                        ? dev.availabilityStatus.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
                        : "Available"}
                    </p>
                  </div>
                  <div style={{ color: "var(--color-primary)", fontWeight: "bold", fontSize: "1.2rem", fontFamily: "var(--font-headline)" }}>
                    ${dev.hourlyRate || "0"}/hr
                  </div>
                </div>

                {/* Skills */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "auto" }}>
                  {(dev.knownTechs || []).slice(0, 3).map((kt, idx) => (
                    <span
                      key={kt.techID || kt.tech?.techName || idx}
                      style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.6875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      background: "var(--color-surface)",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      color: "var(--color-on-surface-variant)"
                      }}
                    >
                      {kt.tech?.techName || "Tech"}
                    </span>
                  ))}
                  {(dev.knownTechs || []).length > 3 && (
                    <span style={{ fontSize: "0.6875rem", padding: "0.25rem", color: "var(--color-outline)" }}>
                      +{(dev.knownTechs || []).length - 3} more
                    </span>
                  )}
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <button
                    className="neon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDeveloper(dev);
                    }}
                  >
                    Invite to Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
             <div style={{ padding: "4rem", textAlign: "center", background: "var(--color-surface-container-lowest)", borderRadius: "8px" }}>
              <p style={{ color: "var(--color-outline)" }}>No engineers found matching your query.</p>
            </div>
        )}
      </main>
    </>
  );
}

export default DeveloperDirectory;
