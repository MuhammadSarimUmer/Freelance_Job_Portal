import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { allJobs, techTags } from "../data/mockData";

function JobListings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState(["React"]);
  const [budget, setBudget] = useState(70);
  const [appTypes, setAppTypes] = useState({
    "Web Application": false,
    "Mobile Native": true,
    "Internal Tools": false,
    "Desktop App": false,
  });

  const toggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleAppType = (type) => {
    setAppTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredJobs = allJobs.filter((job) => {
    if (!searchQuery) return true;
    return (
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    );
  });

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
            position: "fixed",
            top: "20%",
            left: "-10%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(0,107,118,0.25) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* HEADER */}
        <section
          style={{ marginBottom: "4rem", position: "relative", zIndex: 1 }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "#e37434",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Current Opportunities
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
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "clamp(3rem, 8vw, 6rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
                color: "#d2e7e3",
              }}
            >
              BUILD THE
              <br />
              <span style={{ color: "#83d3df" }}>FUTURE.</span>
            </h1>
            <div style={{ position: "relative", width: "380px" }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#a58b80",
                  fontSize: "1.25rem",
                }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Search stacks, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0d1f1d",
                  border: "none",
                  borderBottom: "2px solid rgba(86,66,57,0.4)",
                  padding: "1rem 1rem 1rem 3rem",
                  color: "#d2e7e3",
                  fontSize: "0.9rem",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "#83d3df")}
                onBlur={(e) =>
                  (e.target.style.borderBottomColor = "rgba(86,66,57,0.4)")
                }
              />
            </div>
          </div>
        </section>

        <div
          style={{
            display: "flex",
            gap: "4rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* FILTERS */}
          <aside
            style={{
              width: "260px",
              flexShrink: 0,
              position: "sticky",
              top: "120px",
              alignSelf: "flex-start",
            }}
          >
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.25rem",
                color: "#83d3df",
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
                  color: "#a58b80",
                  fontFamily: "Inter, sans-serif",
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
                        border: `2px solid ${checked ? "#83d3df" : "rgba(86,66,57,0.5)"}`,
                        background: checked ? "#83d3df" : "transparent",
                        flexShrink: 0,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {checked && (
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "0.7rem",
                            color: "#051614",
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
                        color: checked ? "#d2e7e3" : "#83d3df",
                        fontFamily: "Inter, sans-serif",
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
                  color: "#a58b80",
                  fontFamily: "Inter, sans-serif",
                  display: "block",
                  marginBottom: "1rem",
                  fontWeight: 700,
                }}
              >
                Tech Stack
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {techTags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: "4px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontFamily: "Inter, sans-serif",
                      background: activeTags.includes(tag)
                        ? "#e37434"
                        : "#263836",
                      color: activeTags.includes(tag) ? "#4e1d00" : "#83d3df",
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
                    color: "#a58b80",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Budget Range
                </label>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#e37434",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  ${Math.round(budget * 250)}+
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
                  height: "2px",
                  accentColor: "#e37434",
                  cursor: "pointer",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#a58b80",
                  fontFamily: "Inter, sans-serif",
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
                  background: "#0d1f1d",
                  border: "none",
                  borderBottom: "2px solid rgba(86,66,57,0.4)",
                  padding: "0.75rem 0",
                  color: "#d2e7e3",
                  fontSize: "0.875rem",
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
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
                color: "#a58b80",
                fontFamily: "Inter, sans-serif",
                marginBottom: "2rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Showing {filteredJobs.length} of {allJobs.length} opportunities
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "2rem",
              }}
            >
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    background: job.featured ? "#e8e5b5" : "#0d1f1d",
                    padding: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderLeft: job.featured ? "none" : "4px solid transparent",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!job.featured) {
                      e.currentTarget.style.borderLeftColor = "#83d3df";
                      e.currentTarget.style.background = "#1b2d2b";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!job.featured) {
                      e.currentTarget.style.borderLeftColor = "transparent";
                      e.currentTarget.style.background = "#0d1f1d";
                    }
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          padding: "3px 10px",
                          background: job.featured ? "#1d1d01" : "transparent",
                          color: job.featured ? "#e8e5b5" : "#83d3df",
                          fontFamily: "Inter, sans-serif",
                          border: job.featured
                            ? "none"
                            : "1px solid rgba(131,211,223,0.3)",
                        }}
                      >
                        {job.category}
                      </span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: job.featured ? "#42411e" : "#d2e7e3",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {job.budgetMin}
                        {job.budgetMax && ` — ${job.budgetMax}`}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        color: job.featured ? "#1d1d01" : "#d2e7e3",
                        marginBottom: "0.75rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {job.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                        color: job.featured
                          ? "#42411e"
                          : "rgba(210,231,227,0.6)",
                        fontFamily: "Inter, sans-serif",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {job.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "3px 10px",
                            color: "#4B9DA9",
                            border: "1px solid rgba(75,157,169,0.3)",
                            fontFamily: "Inter, sans-serif",
                            background: job.featured
                              ? "rgba(75,157,169,0.1)"
                              : "#263836",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "1rem",
                      borderTop: `1px solid ${job.featured ? "rgba(50,50,16,0.15)" : "rgba(86,66,57,0.15)"}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontWeight: 700,
                        color: job.featured ? "rgba(50,50,16,0.5)" : "#a58b80",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Posted {job.postedDate}
                    </span>
                    <button
                      onClick={() => navigate("/auth")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: job.featured ? "#1d1d01" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: job.featured ? "0.5rem 1.25rem" : "0",
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        color: job.featured ? "#e8e5b5" : "#83d3df",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      View Details
                      {!job.featured && (
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "1rem" }}
                        >
                          arrow_forward
                        </span>
                      )}
                    </button>
                  </div>
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

export default JobListings;
