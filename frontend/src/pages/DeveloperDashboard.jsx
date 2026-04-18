import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import DashboardHeader from "../components/ui/DashboardHeader";
import { useAuth } from "../context/AuthContext";
import { contractService } from "../api/services/contractService";
import { useToast } from "../context/ToastContext";
import { profileService } from "../api/services/profileService";
import { statsService } from "../api/services/statsService";

function DeveloperDashboard() {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();
  const { addToast } = useToast();
  
  const [stats, setStats] = useState([
    { label: "Active Projects", value: "0", icon: "terminal" },
    { label: "Completed", value: "0", icon: "check_circle" },
    { label: "Milestones Active", value: "0", icon: "flag" },
    { label: "Bugs Assigned", value: "0", icon: "bug_report" },
  ]);
  const [contracts, setContracts] = useState([]);
  const [networkActivity, setNetworkActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  const availabilityLabel = user?.developer?.availabilityStatus === "AVAILABLE" ? "Available for Hire" : "Set Available for Hire";

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [{ data: contractData }, { data: statsRes }] = await Promise.all([
        contractService.getMyContracts(),
        statsService.getDashboardStats(),
      ]);
      const contracts = contractData?.data || [];
      setContracts(contracts);
      const s = statsRes?.data;

      setStats([
        { label: "Active Projects", value: String(s?.contracts?.byStatus?.IN_PROGRESS ?? 0), icon: "terminal" },
        { label: "Completed", value: String(s?.contracts?.byStatus?.COMPLETED ?? 0), icon: "check_circle" },
        { label: "Milestones Active", value: String(s?.milestones?.byStatus?.IN_PROGRESS ?? 0), icon: "flag" },
        { label: "Bugs Assigned", value: String(s?.bugs?.total ?? 0), icon: "bug_report" },
      ]);

      // Build activity feed from assigned contracts
      const acts = contracts.slice(0, 5).map(c => ({
        title: c.status === "IN_PROGRESS" ? "Contract Active" : `Contract ${c.status}`,
        desc: c.title,
        time: new Date(c.startDate || Date.now()).toLocaleDateString(),
        icon: c.status === "COMPLETED" ? "check_circle" : "work",
        status: c.status === "COMPLETED" ? "success" : "neutral"
      }));
      setNetworkActivity(acts);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      addToast(err?.response?.data?.message || "Failed to load dashboard.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, addToast]);

  return (
    <div
      style={{
        backgroundColor: "var(--color-background)",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activePage="Dashboard" role="developer" />

      <main
        className="sidebar-layout-main"
        style={{
          marginLeft: "256px",
          flex: 1,
          padding: "calc(96px + 3rem) 3rem 3rem 3rem",
          position: "relative",
          overflow: "hidden",
          transition: "margin-left 0.3s ease",
        }}
      >
        <DashboardHeader />
        <div
          className="teal-glow"
          style={{
            position: "absolute",
            top: "-100px",
            right: "10%",
            width: "600px",
            height: "600px",
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
            marginBottom: "4rem",
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
                fontSize: "clamp(2.5rem, 4vw, 4rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "var(--color-on-surface)",
                lineHeight: 1,
                marginBottom: "1rem",
              }}
            >
              The Tactical
              <br />
              <span
                style={{
                  color: "var(--color-secondary)",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                Command Center.
              </span>
            </h1>
            <p
              style={{
                color: "var(--color-secondary)",
                fontFamily: "var(--font-body)",
                maxWidth: "28rem",
              }}
            >
              Your engineering output tracked across high-frequency metrics.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={async () => {
                try {
                  setIsTogglingAvailability(true);
                  await profileService.updateMyDeveloperProfile({
                    availabilityStatus: user?.developer?.availabilityStatus === "AVAILABLE" ? "BUSY" : "AVAILABLE",
                  });
                  await refreshMe();
                  addToast("Availability status updated.", "success");
                } catch (err) {
                  addToast(err?.response?.data?.message || "Failed to update availability.", "error");
                } finally {
                  setIsTogglingAvailability(false);
                }
              }}
              className="signature-cta"
              style={{
                padding: "1rem 2rem",
                color: "var(--color-on-primary-container)",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                borderRadius: "4px",
              }}
              disabled={isTogglingAvailability}
            >
              {isTogglingAvailability ? "Updating..." : availabilityLabel}
            </button>
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={isLoading}
              style={{
                padding: "1rem 2rem",
                borderRadius: "4px",
                border: "1px solid var(--color-outline-variant)",
                background: "transparent",
                color: "var(--color-on-surface)",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {isLoading ? (
          <p style={{ color: "var(--color-secondary)", position: "relative", zIndex: 1, marginBottom: "2rem" }}>
            Loading dashboard telemetry...
          </p>
        ) : null}

        {/* STATS */}
        <section
          className="anim-fade-in-up anim-delay-2"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
            marginBottom: "4rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--color-tertiary-fixed)",
                padding: "2rem",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                borderRadius: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  fontSize: "4rem",
                  color: "var(--color-on-tertiary-fixed)",
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
                  color: "var(--color-on-tertiary-fixed-variant)",
                  fontFamily: "var(--font-label)",
                  marginBottom: "1rem",
                }}
              >
                {stat.label}
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "var(--color-on-tertiary-fixed)",
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
                  style={{ fontSize: "0.9rem", color: "var(--color-on-tertiary-fixed-variant)" }}
                >
                  trending_up
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-on-tertiary-fixed-variant)",
                    fontFamily: "var(--font-body)",
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
          className="anim-fade-in-up anim-delay-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Contracts */}
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
                  fontFamily: "var(--font-headline)",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--color-secondary)",
                }}
              >
                My Contracts
              </h3>
              <span
                onClick={() => navigate("/jobs")}
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--color-outline)",
                  cursor: "pointer",
                  fontFamily: "var(--font-label)",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--color-primary)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--color-outline)")}
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
              {contracts.length > 0 ? contracts.slice(0, 4).map((job) => (
                <article
                  key={job.contractID}
                  style={{
                    background: "var(--color-surface-container-low)",
                    padding: "2rem",
                    transition: "background 0.2s",
                    borderRadius: "8px",
                    border: "1px solid var(--color-outline-variant)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--color-surface-container-high)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--color-surface-container-low)")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          background: "var(--color-secondary-container)",
                          color: "var(--color-on-secondary-container)",
                          padding: "2px 10px",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "var(--font-label)",
                        }}
                      >
                        {job.status?.replaceAll("_", " ") || "Contract"}
                      </span>
                      <h4
                        style={{
                          fontFamily: "var(--font-headline)",
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          color: "var(--color-on-surface)",
                          marginTop: "0.75rem",
                        }}
                      >
                        {job.title}
                      </h4>
                      <p
                        style={{
                          color: "var(--color-secondary)",
                          fontSize: "0.85rem",
                          marginTop: "0.25rem",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {job.application?.appName || "Client project"}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-headline)",
                          fontSize: "1.75rem",
                          fontWeight: 700,
                          color: "var(--color-on-surface)",
                        }}
                      >
                        ${Number(job.totalAmount || 0).toLocaleString()}
                      </span>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {job.endDate ? `Ends ${new Date(job.endDate).toLocaleDateString()}` : "No end date"}
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
                    {(job.technologies || []).slice(0, 4).map((tech, index) => (
                      <span
                        key={tech.techID || index}
                        style={{
                          border: "1px solid var(--color-outline-variant-strong)",
                          padding: "2px 10px",
                          fontSize: "0.75rem",
                          color: "var(--color-on-surface)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {tech.requiredLevel || tech.techID || "Tech"}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid var(--color-outline-variant)",
                      flexWrap: "wrap",
                      gap: "1rem",
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
                            "linear-gradient(to bottom, var(--color-secondary), var(--color-primary))",
                        }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "var(--color-outline)",
                            fontFamily: "var(--font-label)",
                          }}
                        >
                          Assignments
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-headline)",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "var(--color-primary)",
                          }}
                        >
                          {(job.assignments || []).length}
                        </p>
                      </div>
                    </div>
                    <button
                      className="signature-cta"
                      style={{
                        padding: "0.75rem 2.5rem",
                        color: "var(--color-on-primary-container)",
                        fontFamily: "var(--font-headline)",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        border: "none",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        borderRadius: "4px",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                      onClick={() => navigate(`/contracts/${job.contractID}`)}
                    >
                      Open Contract
                    </button>
                  </div>
                </article>
              )) : (
                <div
                  style={{
                    background: "var(--color-surface-container-low)",
                    padding: "2rem",
                    transition: "background 0.2s",
                    borderRadius: "8px",
                    border: "1px solid var(--color-outline-variant)",
                    color: "var(--color-secondary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  No assigned contracts yet.
                </div>
              )}
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
                  color: "var(--color-outline)",
                  fontFamily: "var(--font-headline)",
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
                    background: "var(--color-outline-variant-strong)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  {networkActivity.map((activity, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: "-1.65rem",
                          top: "4px",
                          width: "24px",
                          height: "24px",
                          background: "var(--color-surface-container-highest)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--color-primary)",
                          }}
                        >
                          {activity.icon}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--color-on-surface)",
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                        }}
                      >
                        {activity.title}{" "}
                        <span style={{ color: "var(--color-secondary)" }}>
                          {activity.desc}
                        </span>
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-body)",
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

            <div style={{ background: "var(--color-surface-container-high)", padding: "2rem", borderRadius: "8px" }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--color-outline)",
                  fontFamily: "var(--font-label)",
                  marginBottom: "1.5rem",
                }}
              >
                Match Meter
              </p>
              <div
                style={{
                  height: "2px",
                  width: "100%",
                  background: "var(--color-surface-container-highest)",
                  marginBottom: "1rem",
                  position: "relative",
                  borderRadius: "2px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "74%",
                    background: "linear-gradient(to right, var(--color-secondary), var(--color-primary))",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-on-surface)",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.6,
                }}
              >
                Add 3 more case studies to increase visibility by{" "}
                <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>15%</span>.
              </p>
              <button
                style={{
                  width: "100%",
                  marginTop: "1.5rem",
                  padding: "0.75rem",
                  border: "1px solid var(--color-outline-variant-strong)",
                  background: "transparent",
                  color: "var(--color-secondary)",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  borderRadius: "4px",
                  transition: "background 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "var(--color-surface-container-highest)")
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
