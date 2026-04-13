import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import {
  developerDashboardStats,
  developerJobsForDashboard,
  developerActivities,
} from "../data/mockData";

function DeveloperDashboard() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundColor: "#051614",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Dashboard" role="developer" />

      <main
        style={{
          marginLeft: "256px",
          flex: 1,
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "10%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(0,107,118,0.4) 0%, rgba(5,22,20,0) 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* HEADER */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "4rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "clamp(2.5rem, 4vw, 4rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "#d2e7e3",
                lineHeight: 1,
                marginBottom: "1rem",
              }}
            >
              The Tactical
              <br />
              <span
                style={{
                  color: "#83d3df",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                Command Center.
              </span>
            </h1>
            <p
              style={{
                color: "#83d3df",
                fontFamily: "Inter, sans-serif",
                maxWidth: "28rem",
              }}
            >
              Your engineering output tracked across high-frequency metrics.
            </p>
          </div>
          <button
            style={{
              padding: "1rem 2rem",
              background: "#e37434",
              color: "#4e1d00",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Available for Hire
          </button>
        </header>

        {/* STATS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
            marginBottom: "4rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {developerDashboardStats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#e8e5b5",
                padding: "2rem",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  fontSize: "4rem",
                  color: "#1d1d01",
                  opacity: 0.08,
                }}
              >
                {stat.icon}
              </span>
              <p
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#494825",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "1rem",
                }}
              >
                {stat.label}
              </p>
              <h2
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "#1d1d01",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </h2>
              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "0.9rem", color: "#494825" }}
                >
                  trending_up
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#494825",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {stat.sub}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* JOBS + ACTIVITY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Jobs */}
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#83d3df",
                }}
              >
                Recommended Jobs
              </h3>
              <span
                onClick={() => navigate("/jobs")}
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#a58b80",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#ffb691")}
                onMouseLeave={(e) => (e.target.style.color = "#a58b80")}
              >
                View All —
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {developerJobsForDashboard.map((job) => (
                <article
                  key={job.title}
                  style={{
                    background: "#0d1f1d",
                    padding: "2rem",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#1b2d2b")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#0d1f1d")
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
                    <div>
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
                        {job.category}
                      </span>
                      <h4
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          color: "#d2e7e3",
                          marginTop: "0.75rem",
                        }}
                      >
                        {job.title}
                      </h4>
                      <p
                        style={{
                          color: "#83d3df",
                          fontSize: "0.85rem",
                          marginTop: "0.25rem",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {job.company}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: "1.75rem",
                          fontWeight: 700,
                          color: "#d2e7e3",
                        }}
                      >
                        {job.budget}
                      </span>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {job.budgetType}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          border: "1px solid rgba(86,66,57,0.4)",
                          padding: "2px 10px",
                          fontSize: "0.75rem",
                          color: "#d2e7e3",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid rgba(86,66,57,0.15)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: "4px",
                          height: "48px",
                          background:
                            "linear-gradient(to bottom, #83d3df, #ffb691)",
                        }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "#a58b80",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Match Probability
                        </p>
                        <p
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#ffb691",
                          }}
                        >
                          {job.match} Match
                        </p>
                      </div>
                    </div>
                    <button
                      style={{
                        padding: "0.75rem 2.5rem",
                        background: "#e37434",
                        color: "#4e1d00",
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        border: "none",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    >
                      Apply Now
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Activity + Boost */}
          <section
            style={{ display: "flex", flexDirection: "column", gap: "3rem" }}
          >
            <div>
              <h3
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#a58b80",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  marginBottom: "2rem",
                }}
              >
                Activity Feed
              </h3>
              <div style={{ position: "relative", paddingLeft: "2rem" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: 0,
                    bottom: 0,
                    width: "1px",
                    background: "rgba(86,66,57,0.3)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  {developerActivities.map((activity, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: "-1.65rem",
                          top: "4px",
                          width: "24px",
                          height: "24px",
                          background: activity.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "0.75rem",
                            color: activity.textColor,
                          }}
                        >
                          {activity.icon}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#d2e7e3",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {activity.text}{" "}
                        <span style={{ color: "#83d3df" }}>
                          {activity.highlight}
                        </span>
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#a58b80",
                          fontFamily: "Inter, sans-serif",
                          marginTop: "0.25rem",
                        }}
                      >
                        {activity.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: "#1b2d2b", padding: "2rem" }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#a58b80",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "1.5rem",
                }}
              >
                Match Meter
              </p>
              <div
                style={{
                  height: "2px",
                  width: "100%",
                  background: "#263836",
                  marginBottom: "1rem",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "74%",
                    background: "linear-gradient(to right, #83d3df, #ffb691)",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#d2e7e3",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.6,
                }}
              >
                Add 3 more case studies to increase visibility by{" "}
                <span style={{ color: "#ffb691", fontWeight: 700 }}>15%</span>.
              </p>
              <button
                style={{
                  width: "100%",
                  marginTop: "1.5rem",
                  padding: "0.75rem",
                  border: "1px solid rgba(165,139,128,0.2)",
                  background: "transparent",
                  color: "#83d3df",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(131,211,223,0.1)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "transparent")
                }
              >
                Boost Profile
              </button>
            </div>
          </section>
        </div>

        <div style={{ marginTop: "4rem" }}>
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default DeveloperDashboard;
