import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { developerSkills, developerExperiences } from "../data/mockData";

function DeveloperProfile() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundColor: "#051614",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Profile" role="developer" />

      <main style={{ marginLeft: "256px", flex: 1 }}>
        {/* BANNER */}
        <div
          style={{
            width: "100%",
            height: "280px",
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #91C6BC 0%, #4B9DA9 50%, #0d1f1d 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 50%, #051614 100%)",
            }}
          />
          <div style={{ position: "absolute", top: "2rem", right: "2rem" }}>
            <button
              onClick={() => navigate("/jobs")}
              style={{
                padding: "0.5rem 1.5rem",
                background: "rgba(5,22,20,0.6)",
                border: "1px solid rgba(131,211,223,0.3)",
                color: "#83d3df",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Browse Jobs
            </button>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "-8rem auto 0",
            padding: "0 2rem 4rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "350px 1fr",
              gap: "3rem",
            }}
          >
            {/* LEFT — Profile Card */}
            <div
              style={{
                background: "#0d1f1d",
                padding: "2.5rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  right: "-40px",
                  width: "160px",
                  height: "160px",
                  background: "#006b76",
                  opacity: 0.4,
                  filter: "blur(80px)",
                  borderRadius: "50%",
                }}
              />

              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4B9DA9, #263836)",
                    border: "4px solid #051614",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "3.5rem",
                      fontWeight: 700,
                      color: "#d2e7e3",
                    }}
                  >
                    AR
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "160px",
                    width: "20px",
                    height: "20px",
                    background: "#4ade80",
                    borderRadius: "50%",
                    border: "3px solid #051614",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <h1
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#d2e7e3",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Alex Rivera
                  </h1>
                  <span
                    style={{
                      background: "#006b76",
                      color: "#99e9f6",
                      padding: "2px 10px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Available
                  </span>
                </div>
                <p
                  style={{
                    color: "#83d3df",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "1.1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  Full-Stack Creative Engineer
                </p>
                <p
                  style={{
                    color: "rgba(210,231,227,0.55)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    fontFamily: "Inter, sans-serif",
                    maxWidth: "280px",
                  }}
                >
                  Crafting high-performance digital experiences at the
                  intersection of brutalist design and architectural code.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                <button
                  style={{
                    width: "100%",
                    background: "#e37434",
                    color: "#4e1d00",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    padding: "1rem",
                    fontSize: "1rem",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "-0.02em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "filter 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.filter = "brightness(1.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.filter = "brightness(1)")
                  }
                >
                  Hire Me
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.25rem" }}
                  >
                    arrow_forward
                  </span>
                </button>
                <button
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "1px solid rgba(165,139,128,0.2)",
                    color: "#83d3df",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    padding: "1rem",
                    fontSize: "1rem",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.background = "rgba(131,211,223,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.background = "transparent")
                  }
                >
                  View Portfolio
                </button>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                    color: "#a58b80",
                    fontFamily: "Inter, sans-serif",
                    marginBottom: "1rem",
                  }}
                >
                  Technical Arsenal
                </p>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {developerSkills.map((skill) => (
                    <span
                      key={skill.name}
                      style={{
                        background: "#4B9DA9",
                        color: "#ffffff",
                        padding: "4px 12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        fontFamily: "Space Grotesk, sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Stats + Experience */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              {/* Stats Row */}
              <div
                style={{
                  background: "#0d1f1d",
                  padding: "2rem",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                {[
                  { value: "8+", label: "Years Exp" },
                  { value: "$120", label: "Hourly Rate" },
                  { value: "142", label: "Projects" },
                  { value: "99%", label: "Success Rate" },
                ].map((stat, index, arr) => (
                  <div
                    key={stat.label}
                    style={{
                      textAlign: "center",
                      flex: 1,
                      borderRight:
                        index < arr.length - 1
                          ? "1px solid rgba(86,66,57,0.2)"
                          : "none",
                      padding: "0 1rem",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        color: "#ffb691",
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      style={{
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "#a58b80",
                        fontFamily: "Inter, sans-serif",
                        marginTop: "0.5rem",
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Featured Case Study */}
              <div
                style={{
                  background: "#e8e5b5",
                  padding: "2.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <span
                  style={{
                    background: "#1d1d01",
                    color: "#e8e5b5",
                    padding: "3px 10px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "Inter, sans-serif",
                    alignSelf: "flex-start",
                  }}
                >
                  Featured Case Study
                </span>
                <h2
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#1d1d01",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Neural Architecture for FinTech.
                </h2>
                <p
                  style={{
                    color: "rgba(29,29,1,0.7)",
                    fontSize: "0.9rem",
                    lineHeight: 1.7,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Re-engineering a legacy banking core into a distributed,
                  reactive system processing $2B+ in monthly volume.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {["Rust", "Kafka", "gRPC", "PostgreSQL"].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "rgba(75,157,169,0.2)",
                        color: "#4B9DA9",
                        padding: "3px 10px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontFamily: "Inter, sans-serif",
                        border: "1px solid rgba(75,157,169,0.3)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Timeline */}
              <div style={{ background: "#0d1f1d", padding: "2.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "2rem",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#d2e7e3",
                    }}
                  >
                    Recent Engagements
                  </h2>
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#83d3df",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      textDecoration: "underline",
                    }}
                  >
                    View All
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                  }}
                >
                  {developerExperiences.map((exp) => (
                    <div
                      key={exp.year}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "1.5rem",
                      }}
                    >
                      <div
                        style={{
                          background: "#263836",
                          padding: "0.75rem 1rem",
                          fontFamily: "Space Grotesk, sans-serif",
                          fontWeight: 700,
                          color: "#a58b80",
                          fontSize: "0.85rem",
                          flexShrink: 0,
                        }}
                      >
                        {exp.year}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            fontWeight: 700,
                            color: "#d2e7e3",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {exp.title}
                        </h4>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "rgba(210,231,227,0.55)",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {exp.desc}
                        </p>
                      </div>
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "#a58b80", fontSize: "1.25rem" }}
                      >
                        north_east
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default DeveloperProfile;
