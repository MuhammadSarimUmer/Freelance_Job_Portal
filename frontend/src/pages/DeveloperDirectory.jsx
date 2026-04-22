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
  const [sortBy, setSortBy] = useState("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [minExperience, setMinExperience] = useState("");

  useEffect(() => {
    loadDirectory();
  }, []);

  const loadDirectory = async () => {
    try {
      setIsLoading(true);
      const params = { limit: 300 };
      if (availabilityFilter) params.status = availabilityFilter;
      if (minExperience) params.minExperience = minExperience;
      if (sortBy === "rating") params.sortBy = "rating";

      const [devRes, contractRes] = await Promise.all([
        profileService.getAllDevelopers(params),
        contractService.getMyContracts(),
      ]);

      const devs = devRes.data?.data || [];
      setDevelopers(Array.isArray(devs) ? devs : []);

      const myContracts = contractRes.data?.data || [];
      setContracts(myContracts.filter((contract) => contract.status === "DRAFT"));
    } catch (err) {
      console.error(err);
      addToast(err?.response?.data?.message || "Failed to load directory data.", "error");
      setDevelopers([]);
      setContracts([]);
    } finally {
      setIsLoading(false);
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

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const filteredDevs = developers
    .filter((dev) => {
      const term = searchTerm.toLowerCase();
      const nameMatch = dev.user?.fullName?.toLowerCase().includes(term);
      const techMatch = (dev.knownTechs || []).some((kt) =>
        kt.tech?.techName?.toLowerCase().includes(term),
      );
      return !term || nameMatch || techMatch;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.averageRating || 0) - (a.averageRating || 0);
      return 0;
    });

  const totalPages = Math.ceil(filteredDevs.length / ITEMS_PER_PAGE);
  const pagedDevs = filteredDevs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderStars = (rating) => {
    if (!rating) return null;
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", letterSpacing: "0.05em" }}>
        {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}{" "}
        <span style={{ color: "var(--color-outline)", fontSize: "0.7rem" }}>({rating.toFixed(1)})</span>
      </span>
    );
  };

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
        .skeleton-card {
          background: var(--color-surface-container-low);
          border-radius: 8px;
          padding: 2rem;
          border: 1px solid var(--color-outline-variant);
          display: grid;
          gap: 0.75rem;
          animation: shimmer 1.6s infinite;
          background-image: linear-gradient(90deg, var(--color-surface-container-low) 0%, var(--color-surface-container) 50%, var(--color-surface-container-low) 100%);
          background-size: 200% 100%;
        }
        .skeleton-line {
          height: 12px;
          border-radius: 6px;
          background: var(--color-surface-container-highest);
        }
        .skeleton-line.large { height: 20px; width: 65%; }
        .skeleton-line.medium { width: 45%; }
        .skeleton-line.small { width: 30%; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <Sidebar activePage="Developer Directory" role="client" />

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
                  <option value="">Select an open contract</option>
                  {contracts.map((contract) => (
                    <option key={contract.contractID} value={contract.contractID}>
                      {contract.title}
                    </option>
                  ))}
                </select>
                <p style={{ marginTop: "0.5rem", color: "var(--color-outline)", fontSize: "0.75rem" }}>
                  For active contracts, add team members from the contract workspace.
                </p>
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
                Open contracts appear here after you create them.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <main className="sidebar-layout-main" style={{ marginLeft: "256px", flex: 1, padding: "calc(96px + 3rem) 3rem 3rem 3rem", position: "relative" }}>

        {/* HEADER AREA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem", flexWrap: "wrap", gap: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "3.5rem", letterSpacing: "-0.02em", color: "var(--color-on-surface)", margin: 0, lineHeight: 1 }}>
            Elite Engineers<br />Available
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search skills or names..."
              className="search-bar-neon"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              style={{ padding: "0.65rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "var(--color-surface)", color: "var(--color-on-surface)", cursor: "pointer", fontSize: "0.8rem" }}
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
            <select
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
              style={{ padding: "0.65rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "var(--color-surface)", color: "var(--color-on-surface)", cursor: "pointer", fontSize: "0.8rem" }}
            >
              <option value="">Any Experience</option>
              <option value="1">1+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
              <option value="10">10+ Years</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: "0.65rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "var(--color-surface)", color: "var(--color-on-surface)", cursor: "pointer", fontSize: "0.8rem" }}
            >
              <option value="default">Sort: Default</option>
              <option value="rating">Sort: Rating</option>
            </select>
            <button
              type="button"
              onClick={loadDirectory}
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
              {isLoading ? "Refreshing..." : "Apply Filters"}
            </button>
          </div>
        </div>

        {/* GRID */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="skeleton-card">
                <div className="skeleton-line large" />
                <div className="skeleton-line medium" />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <div className="skeleton-line small" />
                  <div className="skeleton-line small" />
                  <div className="skeleton-line small" />
                </div>
                <div className="skeleton-line" style={{ height: 36, borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : filteredDevs.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
            {pagedDevs.map((dev) => {
              const availLabel = dev.availabilityStatus === "AVAILABLE"
                ? "Available" : dev.availabilityStatus === "BUSY"
                  ? "Busy" : "Unavailable";
              const availColor = dev.availabilityStatus === "AVAILABLE"
                ? "var(--color-secondary)" : dev.availabilityStatus === "BUSY"
                  ? "var(--color-primary)" : "var(--color-outline)";
              const skills = (dev.knownTechs || []).slice(0, 4);
              const extraSkills = (dev.knownTechs || []).length - 4;

              return (
                <div
                  key={dev.developerID}
                  style={{
                    background: "var(--color-surface-container-low)",
                    borderRadius: "8px",
                    border: "1px solid var(--color-outline-variant)",
                    borderLeft: "3px solid var(--color-secondary)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/developers/${dev.developerID}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderLeftColor = "var(--color-primary)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderLeftColor = "var(--color-secondary)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* BODY */}
                  <div style={{ padding: "1.4rem 1.6rem", display: "flex", flexDirection: "column", gap: "0.85rem", flex: 1 }}>

                    {/* HEADER ROW */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {dev.user?.profileImageUrl ? (
                        <img src={dev.user.profileImageUrl} alt={dev.user?.fullName} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--color-outline-variant)" }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-surface-container-highest)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-on-surface)", flexShrink: 0 }}>
                          {getInitials(dev.user?.fullName || "Dev")}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {dev.user?.fullName || "Developer"}
                        </h2>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--color-outline)", fontFamily: "var(--font-body)" }}>
                          {dev.experienceYears ?? 0} yrs exp
                          <span style={{ margin: "0 0.4rem", color: "var(--color-outline-variant)" }}>·</span>
                          <span style={{ color: availColor, fontWeight: 600 }}>{availLabel}</span>
                        </p>
                      </div>
                      <span style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-on-surface)", letterSpacing: "-0.02em", flexShrink: 0 }}>
                        ${dev.hourlyRate || "0"}<span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--color-outline)" }}>/hr</span>
                      </span>
                    </div>

                    {/* BIO */}
                    <p style={{ fontSize: "0.84rem", lineHeight: 1.6, color: "var(--color-secondary)", fontFamily: "var(--font-body)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {dev.bio || "No bio provided yet."}
                    </p>

                    {/* SKILLS */}
                    {skills.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {skills.map((kt, i) => (
                          <span key={kt.techID || i} style={{ fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase", padding: "2px 7px", color: "var(--color-on-surface-variant)", fontFamily: "var(--font-label)", background: "var(--color-surface-container)", borderRadius: "3px", letterSpacing: "0.06em" }}>
                            {kt.tech?.techName || "Tech"}
                          </span>
                        ))}
                        {extraSkills > 0 ? (
                          <span style={{ fontSize: "0.62rem", color: "var(--color-outline)", padding: "2px 3px", fontFamily: "var(--font-label)" }}>+{extraSkills}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {/* FOOTER */}
                  <div style={{ padding: "0.85rem 1.6rem", borderTop: "1px solid var(--color-outline-variant)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {dev.averageRating ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          {renderStars(dev.averageRating)}
                          <span style={{ fontSize: "0.68rem", color: "var(--color-outline)", fontFamily: "var(--font-body)" }}>
                            {Number(dev.averageRating).toFixed(1)} ({dev.reviewCount ?? 0})
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.68rem", color: "var(--color-outline)" }}>No reviews yet</span>
                      )}
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "3px" }}>
                        {dev.portfolioURL ? <span style={{ fontSize: "0.62rem", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Portfolio</span> : null}
                        {dev.cvUrl ? <span style={{ fontSize: "0.62rem", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.06em" }}>CV</span> : null}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      {dev.portfolioURL ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); window.open(dev.portfolioURL, "_blank", "noopener,noreferrer"); }}
                          style={{ padding: "0.45rem 0.75rem", background: "transparent", border: "1px solid var(--color-outline-variant)", borderRadius: "5px", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.68rem", color: "var(--color-on-surface)", letterSpacing: "0.04em" }}
                        >
                          Portfolio
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedDeveloper(dev); }}
                        style={{ padding: "0.45rem 0.9rem", background: "var(--color-primary)", border: "none", borderRadius: "5px", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.68rem", color: "var(--color-on-primary)", letterSpacing: "0.04em" }}
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "4rem", textAlign: "center", background: "var(--color-surface-container-lowest)", borderRadius: "8px" }}>
            <p style={{ color: "var(--color-outline)" }}>No engineers found matching your query.</p>
          </div>
        )}

        {/* PAGINATION */}
        {!isLoading && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "transparent", color: currentPage === 1 ? "var(--color-outline)" : "var(--color-on-surface)", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontFamily: "var(--font-headline)", fontSize: "0.75rem" }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) => p === "..." ? (
                <span key={`ellipsis-${i}`} style={{ color: "var(--color-outline)", padding: "0 0.25rem" }}>…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  style={{ padding: "0.5rem 0.85rem", borderRadius: "6px", border: `1px solid ${currentPage === p ? "var(--color-primary)" : "var(--color-outline-variant)"}`, background: currentPage === p ? "var(--color-primary)" : "transparent", color: currentPage === p ? "var(--color-on-primary)" : "var(--color-on-surface)", cursor: "pointer", fontFamily: "var(--font-headline)", fontSize: "0.75rem", fontWeight: 700 }}
                >
                  {p}
                </button>
              ))}
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "transparent", color: currentPage === totalPages ? "var(--color-outline)" : "var(--color-on-surface)", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontFamily: "var(--font-headline)", fontSize: "0.75rem" }}
            >
              Next →
            </button>
            <span style={{ fontSize: "0.72rem", color: "var(--color-outline)", marginLeft: "0.5rem" }}>
              {filteredDevs.length} developer{filteredDevs.length !== 1 ? "s" : ""} · Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </main>
    </>
  );
}

export default DeveloperDirectory;
