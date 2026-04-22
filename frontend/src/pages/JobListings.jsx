import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { techTags } from "../data/mockData";
import JobApplyModal from "../components/ui/JobApplyModal";
import { contractService } from "../api/services/contractService";
import { useToast } from "../context/ToastContext";
import { normalizeTechName } from "../utils/techName";

function JobListings() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const getClientRating = (client) => {
    const reviews = client?.user?.reviewsReceived || [];
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return { avg: avg.toFixed(1), count: reviews.length };
  };

  const renderMiniStars = (avg) => {
    const full = Math.floor(avg);
    return (
      <span style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} style={{ color: s <= full ? "var(--color-primary)" : "var(--color-outline)" }}>
            {s <= full ? "★" : "☆"}
          </span>
        ))}
      </span>
    );
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [budget, setBudget] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const [experienceFilter, setExperienceFilter] = useState("Any");
  const [appTypes, setAppTypes] = useState({
    "Web Application": true,
    "Mobile Native": true,
    "Internal Tools": false,
    "Desktop App": false,
  });

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const { data } = await contractService.getOpenContracts();
      setContracts(data?.data || []);
    } catch (err) {
      console.error("Failed to load contracts:", err);
      addToast(err?.response?.data?.message || "Failed to load open contracts.", "error");
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const toggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleAppType = (type) => {
    setAppTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const availableTechTags = useMemo(() => {
    const tags = new Set();
    contracts.forEach((job) => {
      (job.technologies || []).forEach((tech) => {
        if (tech.tech?.techName) tags.add(normalizeTechName(tech.tech.techName));
      });
    });

    return tags.size > 0 ? Array.from(tags).sort() : techTags.map(normalizeTechName);
  }, [contracts]);

  const appTypeMap = {
    WEB: "Web Application",
    MOBILE: "Mobile Native",
    INTERNAL: "Internal Tools",
    DESKTOP: "Desktop App",
  };

  const filteredJobs = useMemo(() => contracts.filter((job) => {
    const queryMatch = !searchQuery || (
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.application?.appName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedAppTypes = Object.entries(appTypes)
      .filter(([, checked]) => checked)
      .map(([label]) => label);
    const jobAppType = appTypeMap[job.application?.appType] || job.application?.appType || "Web Application";
    const appTypeMatch = selectedAppTypes.length === 0 || selectedAppTypes.includes(jobAppType);

    const tagMatch = activeTags.length === 0 || activeTags.every((tag) =>
      (job.technologies || []).some((tech) =>
        normalizeTechName(tech.tech?.techName || "").toLowerCase() === tag.toLowerCase(),
      ),
    );

    const budgetMatch = Number(job.totalAmount || 0) >= Math.round(Number(budget) * 250);

    const experienceMap = {
      "Entry Level": ["BEGINNER"],
      "Mid-Level": ["INTERMEDIATE"],
      "Senior (5+ Years)": ["EXPERT"],
      "Lead / Architect": ["EXPERT"],
    };

    const experienceMatch =
      experienceFilter === "Any" ||
      (job.technologies || []).some((tech) =>
        (experienceMap[experienceFilter] || []).includes(tech.requiredLevel),
      );

    return queryMatch && appTypeMatch && tagMatch && budgetMatch && experienceMatch;
  }), [activeTags, appTypes, budget, contracts, experienceFilter, searchQuery]);

  // Sort recent-first
  const sortedJobs = useMemo(() => [...filteredJobs].sort((a, b) =>
    new Date(b.createdAt || b.startDate || 0) - new Date(a.createdAt || a.startDate || 0)
  ), [filteredJobs]);

  const totalPages = Math.ceil(sortedJobs.length / ITEMS_PER_PAGE);
  const pagedJobs = sortedJobs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const allJobs = contracts;

  // Inject scoped styles for layout responsiveness
  const layoutStyles = `
    .jobs-layout {
      display: flex;
      gap: 4rem;
    }
    .jobs-sidebar {
      width: 260px;
      flex-shrink: 0;
      position: sticky;
      top: 120px;
      align-self: flex-start;
      max-height: calc(100vh - 140px);
      overflow-y: auto;
      padding-right: 1rem;
    }
    /* Custom Scrollbar for sidebar to keep it neat */
    .jobs-sidebar::-webkit-scrollbar {
      width: 4px;
    }
    .jobs-sidebar::-webkit-scrollbar-thumb {
      background-color: var(--color-outline-variant-strong);
      border-radius: 4px;
    }
    .job-skeleton {
      background: var(--color-surface-container-low);
      border: 1px solid var(--color-outline-variant);
      border-radius: 12px;
      padding: 2rem;
      display: grid;
      gap: 0.75rem;
      animation: shimmer 1.6s infinite;
      background-image: linear-gradient(90deg, var(--color-surface-container-low) 0%, var(--color-surface-container) 50%, var(--color-surface-container-low) 100%);
      background-size: 200% 100%;
    }
    .job-skeleton-line {
      height: 12px;
      border-radius: 6px;
      background: var(--color-surface-container-highest);
    }
    .job-skeleton-line.large { height: 20px; width: 70%; }
    .job-skeleton-line.medium { width: 50%; }
    .job-skeleton-line.small { width: 35%; }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @media (max-width: 1024px) {
      .jobs-layout {
        flex-direction: column;
        gap: 2rem;
      }
      .jobs-sidebar {
        width: 100%;
        position: static;
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
              position: "fixed",
              top: "20%",
              left: "-10%",
              width: "600px",
              height: "600px",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* HEADER */}
          <section
            className="anim-fade-in-up"
            style={{ marginBottom: "4rem", position: "relative", zIndex: 1 }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                color: "var(--color-primary)",
                fontFamily: "var(--font-label)",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Open Contracts
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: "2rem",
              }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.9,
                  color: "var(--color-on-surface)",
                }}
              >
                FIND THE
                <br />
                <span style={{ color: "var(--color-secondary)" }}>RIGHT FIT.</span>
              </h1>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", width: "100%", maxWidth: "580px" }}>
                <button
                  type="button"
                  onClick={fetchContracts}
                  disabled={isLoading}
                  style={{
                    flexShrink: 0,
                    padding: "0.75rem 1.1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-outline-variant)",
                    background: "transparent",
                    color: "var(--color-on-surface)",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-headline)",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    opacity: isLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>refresh</span>
                  {isLoading ? "Loading..." : "Refresh"}
                </button>
                <div style={{ position: "relative", flex: 1 }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-outline)",
                      fontSize: "1.25rem",
                    }}
                  >
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search contracts, apps, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--color-surface-container)",
                      border: "none",
                      borderBottom: "2px solid var(--color-outline-variant-strong)",
                      padding: "1rem 1rem 1rem 3rem",
                      color: "var(--color-on-surface)",
                      fontSize: "0.9rem",
                      outline: "none",
                      fontFamily: "var(--font-body)",
                      transition: "border-color 0.3s ease",
                    }}
                    onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-secondary)")}
                    onBlur={(e) =>
                      (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchContracts}
                  disabled={isLoading}
                  style={{
                    padding: "0.75rem 1.25rem",
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
          </section>

          <div
            className="jobs-layout anim-fade-in-up anim-delay-2"
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* FILTERS */}
            <aside className="jobs-sidebar">
              <h2
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "1.25rem",
                  color: "var(--color-secondary)",
                  marginBottom: "2rem",
                }}
              >
                Refine Search
              </h2>

              <div style={{ marginBottom: "2.5rem" }}>
                <label
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--color-outline)",
                    fontFamily: "var(--font-label)",
                    display: "block",
                    marginBottom: "1rem",
                    fontWeight: 700,
                  }}
                >
                  App Type
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {Object.entries(appTypes).map(([type, checked]) => (
                    <label
                      key={type}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        onClick={() => toggleAppType(type)}
                        style={{
                          width: "16px",
                          height: "16px",
                          border: `2px solid ${checked ? "var(--color-secondary)" : "var(--color-outline-variant-strong)"}`,
                          background: checked ? "var(--color-secondary)" : "transparent",
                          flexShrink: 0,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "2px"
                        }}
                      >
                        {checked && (
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--color-background)",
                              fontWeight: 700,
                            }}
                          >
                            check
                          </span>
                        )}
                      </div>
                      <span
                        onClick={() => toggleAppType(type)}
                        style={{
                          fontSize: "0.875rem",
                          color: checked ? "var(--color-on-surface)" : "var(--color-secondary)",
                          fontFamily: "var(--font-body)",
                          fontWeight: checked ? 600 : 400,
                        }}
                      >
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "2.5rem" }}>
                <label
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--color-outline)",
                    fontFamily: "var(--font-label)",
                    display: "block",
                    marginBottom: "1rem",
                    fontWeight: 700,
                  }}
                >
                  Tech Stack
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {availableTechTags.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: "4px 12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "var(--font-body)",
                        background: activeTags.includes(tag)
                          ? "var(--color-primary)"
                          : "var(--color-surface-container-highest)",
                        color: activeTags.includes(tag) ? "var(--color-on-primary-container)" : "var(--color-secondary)",
                        borderRadius: "4px"
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "2.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      color: "var(--color-outline)",
                      fontFamily: "var(--font-label)",
                      fontWeight: 700,
                    }}
                  >
                    Budget Range
                  </label>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {budget === 0 ? "Any" : `$${Math.round(budget * 250)}+`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  style={{
                    width: "100%",
                    height: "4px",
                    accentColor: "var(--color-primary)",
                    cursor: "pointer",
                    background: "var(--color-surface-container-highest)",
                    borderRadius: "2px"
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--color-outline)",
                    fontFamily: "var(--font-label)",
                    display: "block",
                    marginBottom: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  Experience Level
                </label>
                <select
                  style={{
                    width: "100%",
                    background: "var(--color-surface-container)",
                    border: "none",
                    borderBottom: "2px solid var(--color-outline-variant-strong)",
                    padding: "0.75rem 0",
                    color: "var(--color-on-surface)",
                    fontSize: "0.875rem",
                    outline: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                >
                  <option>Any</option>
                  <option>Senior (5+ Years)</option>
                  <option>Lead / Architect</option>
                  <option>Mid-Level</option>
                  <option>Entry Level</option>
                </select>
              </div>
            </aside>

            {/* JOB CARDS */}
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-outline)",
                  fontFamily: "var(--font-body)",
                  marginBottom: "2rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Showing {filteredJobs.length} of {allJobs.length} open contracts
              </p>
              {isLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="job-skeleton">
                      <div className="job-skeleton-line large" />
                      <div className="job-skeleton-line medium" />
                      <div className="job-skeleton-line" style={{ height: 60 }} />
                      <div className="job-skeleton-line small" />
                      <div className="job-skeleton-line" style={{ height: 36, borderRadius: 6 }} />
                    </div>
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "2rem",
                  }}
                >
                  {pagedJobs.map((job) => {
                    const clientRating = getClientRating(job.client);
                    const clientName = job.client?.user?.fullName || "Client";
                    const clientAvatar = job.client?.user?.profileImageUrl;
                    const clientInitials = clientName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                    const techList = job.technologies || [];
                    const proposalCount = job.proposals?.length || 0;
                    const startDate = job.startDate ? new Date(job.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null;
                    const endDate = job.endDate ? new Date(job.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null;

                    return (
                      <div
                        key={job.contractID}
                        style={{
                          background: "var(--color-surface-container-low)",
                          borderRadius: "8px",
                          border: "1px solid var(--color-outline-variant)",
                          borderLeft: "3px solid var(--color-primary)",
                          display: "flex",
                          flexDirection: "column",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderLeftColor = "var(--color-secondary)";
                          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderLeftColor = "var(--color-primary)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* CARD BODY */}
                        <div style={{ padding: "1.4rem 1.6rem", display: "flex", flexDirection: "column", flex: 1, gap: "0.85rem" }}>

                          {/* TOP META: type badge + budget */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", padding: "3px 8px", color: "var(--color-secondary)", fontFamily: "var(--font-label)", background: "var(--color-surface-container)", border: "1px solid var(--color-outline-variant)", borderRadius: "4px" }}>
                              {job.application?.appType || "PROJECT"}
                            </span>
                            <span style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
                              ${Number(job.totalAmount || 0).toLocaleString()}
                            </span>
                          </div>

                          {/* TITLE */}
                          <div>
                            <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-on-surface)", margin: 0, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                              {job.title}
                            </h3>
                            <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "var(--color-outline)", fontFamily: "var(--font-body)" }}>
                              {job.application?.appName || "Project"}
                              {startDate ? ` · Starts ${startDate}` : ""}
                              {endDate ? ` → ${endDate}` : ""}
                            </p>
                          </div>

                          {/* DESCRIPTION */}
                          <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--color-secondary)", fontFamily: "var(--font-body)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {job.description || "No scope provided."}
                          </p>

                          {/* TECH TAGS */}
                          {techList.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                              {techList.slice(0, 4).map((tech) => (
                                <span
                                  key={`${job.contractID}-${tech.techID}`}
                                  style={{ fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase", padding: "2px 7px", color: "var(--color-on-surface-variant)", fontFamily: "var(--font-label)", background: "var(--color-surface-container)", borderRadius: "3px", letterSpacing: "0.06em" }}
                                >
                                  {tech.tech?.techName || "Tech"}
                                </span>
                              ))}
                              {techList.length > 4 ? (
                                <span style={{ fontSize: "0.62rem", color: "var(--color-outline)", padding: "2px 3px", fontFamily: "var(--font-label)" }}>+{techList.length - 4}</span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>

                        {/* CARD FOOTER */}
                        <div style={{ padding: "0.9rem 1.6rem", borderTop: "1px solid var(--color-outline-variant)", display: "flex", alignItems: "center", gap: "0.75rem" }}>

                          {/* CLIENT INFO */}
                          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", flex: 1, minWidth: 0 }}>
                            {clientAvatar ? (
                              <img src={clientAvatar} alt={clientName} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--color-outline-variant)" }} />
                            ) : (
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-surface-container-highest)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", fontWeight: 700, color: "var(--color-secondary)", flexShrink: 0 }}>
                                {clientInitials}
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 600, color: "var(--color-on-surface)", fontFamily: "var(--font-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {clientName}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                {clientRating ? (
                                  <>
                                    {renderMiniStars(clientRating.avg)}
                                    <span style={{ fontSize: "0.65rem", color: "var(--color-outline)" }}>{clientRating.avg}</span>
                                  </>
                                ) : (
                                  <span style={{ fontSize: "0.65rem", color: "var(--color-outline)" }}>New client</span>
                                )}
                                <span style={{ fontSize: "0.65rem", color: "var(--color-outline)", marginLeft: "0.35rem" }}>
                                  · {proposalCount} proposal{proposalCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                            {job.client?.clientID ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/clients/${job.client.clientID}`); }}
                                title="View client profile"
                                style={{ padding: "0.5rem 0.8rem", background: "transparent", border: "1px solid var(--color-outline-variant)", borderRadius: "5px", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.7rem", color: "var(--color-on-surface)", letterSpacing: "0.05em" }}
                              >
                                Profile
                              </button>
                            ) : null}
                            <button
                              onClick={() => setSelectedJob(job)}
                              style={{ padding: "0.5rem 1.1rem", background: "var(--color-primary)", border: "none", borderRadius: "5px", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.7rem", color: "var(--color-on-primary)", letterSpacing: "0.05em" }}
                            >
                              Apply
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: "var(--color-surface-container-low)", padding: "2rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
                  <p style={{ color: "var(--color-secondary)", margin: 0 }}>No open contracts match your current filters.</p>
                </div>
              )}

              {/* PAGINATION */}
              {!isLoading && totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "transparent", color: currentPage === 1 ? "var(--color-outline)" : "var(--color-on-surface)", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontFamily: "var(--font-headline)", fontSize: "0.75rem" }}>
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
                    .map((p, i) => p === "..." ? (
                      <span key={`e-${i}`} style={{ color: "var(--color-outline)" }}>…</span>
                    ) : (
                      <button key={p} type="button" onClick={() => setCurrentPage(p)}
                        style={{ padding: "0.5rem 0.85rem", borderRadius: "6px", border: `1px solid ${currentPage === p ? "var(--color-primary)" : "var(--color-outline-variant)"}`, background: currentPage === p ? "var(--color-primary)" : "transparent", color: currentPage === p ? "var(--color-on-primary)" : "var(--color-on-surface)", cursor: "pointer", fontFamily: "var(--font-headline)", fontSize: "0.75rem", fontWeight: 700 }}>
                        {p}
                      </button>
                    ))}
                  <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "transparent", color: currentPage === totalPages ? "var(--color-outline)" : "var(--color-on-surface)", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontFamily: "var(--font-headline)", fontSize: "0.75rem" }}>
                    Next →
                  </button>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-outline)" }}>
                    {sortedJobs.length} job{sortedJobs.length !== 1 ? "s" : ""} · Page {currentPage} of {totalPages}
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>
        {selectedJob && (
          <JobApplyModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onSubmitted={fetchContracts}
          />
        )}
        <Footer />
      </div>
    </>
  );
}

export default JobListings;
