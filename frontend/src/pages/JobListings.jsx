import { useEffect, useMemo, useState } from "react";
import Footer from "../components/layout/Footer";
import { techTags } from "../data/mockData";
import JobApplyModal from "../components/ui/JobApplyModal";
import { contractService } from "../api/services/contractService";
import { useToast } from "../context/ToastContext";
import { normalizeTechName } from "../utils/techName";

function JobListings() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [budget, setBudget] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", width: "100%", maxWidth: "520px" }}>
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
                <div style={{ background: "var(--color-surface-container-low)", padding: "2rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
                  <p style={{ color: "var(--color-secondary)", margin: 0 }}>Loading open contracts...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "2rem",
                  }}
                >
                  {filteredJobs.map((job) => (
                    <div
                      key={job.contractID}
                      style={{
                        background: "var(--color-surface-container-low)",
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        borderRadius: "8px",
                        border: "1px solid var(--color-outline-variant)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1rem",
                            gap: "0.75rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              padding: "3px 10px",
                              color: "var(--color-secondary)",
                              fontFamily: "var(--font-label)",
                              border: "1px solid var(--color-outline-variant-strong)",
                              borderRadius: "4px",
                            }}
                          >
                            {job.application?.appType || "PROJECT"}
                          </span>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "var(--color-on-surface)",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            ${Number(job.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontFamily: "var(--font-headline)",
                            fontSize: "1.4rem",
                            fontWeight: 700,
                            color: "var(--color-on-surface)",
                            marginBottom: "0.5rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {job.title}
                        </h3>
                        <p style={{ color: "var(--color-secondary)", marginTop: 0, marginBottom: "1rem" }}>
                          {job.application?.appName || "Client project"}
                        </p>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            lineHeight: 1.6,
                            color: "var(--color-secondary)",
                            fontFamily: "var(--font-body)",
                            marginBottom: "1.5rem",
                          }}
                        >
                          {job.description || "No scope description provided."}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                            marginBottom: "1.5rem",
                          }}
                        >
                          {(job.technologies || []).length > 0 ? job.technologies.map((tech) => (
                            <span
                              key={`${job.contractID}-${tech.techID}`}
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                padding: "3px 10px",
                                color: "var(--color-secondary)",
                                border: "1px solid var(--color-outline-variant-strong)",
                                fontFamily: "var(--font-body)",
                                background: "var(--color-surface-container-highest)",
                                borderRadius: "4px",
                              }}
                            >
                              {tech.tech?.techName || "Tech"} • {tech.requiredLevel}
                            </span>
                          )) : (
                            <span style={{ color: "var(--color-outline)" }}>No required tech added yet</span>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: "1rem",
                          borderTop: "1px solid var(--color-outline-variant)",
                          gap: "1rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontWeight: 700,
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
                          }}
                        >
                          {job.proposals?.length || 0} proposal{(job.proposals?.length || 0) === 1 ? "" : "s"}
                        </span>
                        <button
                          onClick={() => setSelectedJob(job)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "var(--font-headline)",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            color: "var(--color-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          Review & Propose
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1rem" }}
                          >
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "var(--color-surface-container-low)", padding: "2rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
                  <p style={{ color: "var(--color-secondary)", margin: 0 }}>No open contracts match your current filters.</p>
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
