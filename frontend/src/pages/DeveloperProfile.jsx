import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { contractService } from "../api/services/contractService";

function DeveloperProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setIsLoading(true);
        const { data } = await contractService.getMyContracts();
        setContracts(data?.data || []);
      } catch (err) {
        console.error("Failed to load developer profile contracts:", err);
        addToast(err?.response?.data?.message || "Failed to load developer profile.", "error");
        setContracts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [addToast]);

  const developer = user?.developer;
  const displayName = user?.fullName || "Developer";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DV";
  const availabilityLabel = developer?.availabilityStatus
    ? developer.availabilityStatus.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
    : "Available";
  const skills = useMemo(
    () => (developer?.knownTechs || []).map((skill) => ({
      name: skill.tech?.techName || skill.techID || "Tech",
    })),
    [developer?.knownTechs],
  );
  const completedContracts = contracts.filter((contract) => contract.status === "COMPLETED");
  const profileStats = [
    { value: `${developer?.experienceYears ?? 0}+`, label: "Years Exp" },
    { value: `$${developer?.hourlyRate ?? 0}`, label: "Hourly Rate" },
    { value: String(contracts.length), label: "Projects" },
    {
      value: contracts.length > 0 ? `${Math.round((completedContracts.length / contracts.length) * 100)}%` : "N/A",
      label: "Success Rate",
    },
  ];
  const recentEngagements = contracts.slice(0, 4).map((contract) => ({
    year: contract.startDate ? new Date(contract.startDate).getFullYear() : "Now",
    title: contract.title || "Untitled Contract",
    desc: contract.description || "No contract description available.",
  }));

  // Responsive layout styles injected
  const profileLayoutStyles = `
    .profile-grid-container {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 3rem;
    }
    @media (max-width: 1024px) {
      .profile-grid-container {
        grid-template-columns: 1fr;
      }
      .profile-banner {
        height: 200px !important;
      }
      .profile-header {
        margin-top: -4rem !important;
      }
    }
  `;

  return (
    <>
      <style>{profileLayoutStyles}</style>
      <div
        style={{
          backgroundColor: "var(--color-background)",
          minHeight: "100vh",
          display: "flex",
        }}
      >
        <Sidebar activePage="Profile" role="developer" />

        <main
          className="sidebar-layout-main"
          style={{
            marginLeft: "256px",
            flex: 1,
            padding: "calc(96px + 3rem) 3rem 3rem 3rem",
            position: "relative",
          }}
        >
          {isLoading ? (
            <p style={{ color: "var(--color-secondary)", marginBottom: "1.5rem" }}>
              Loading profile data...
            </p>
          ) : null}

          {/* BANNER */}
          <div
            className="profile-banner anim-fade-in"
            style={{
              width: "100%",
              height: "280px",
              position: "relative",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, var(--color-glow-teal) 0%, var(--color-secondary) 50%, var(--color-surface-container-low) 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 50%, var(--color-background) 100%)",
              }}
            />
            <div style={{ position: "absolute", top: "2rem", right: "2rem" }}>
              <button
                onClick={() => navigate("/jobs")}
                style={{
                  padding: "0.5rem 1.5rem",
                  background: "var(--color-surface-container-highest)",
                  border: "1px solid var(--color-outline-variant-strong)",
                  color: "var(--color-secondary)",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: "4px",
                  transition: "background 0.3s ease"
                }}
                onMouseEnter={(e) => (e.target.style.background = "var(--color-navbar-bg)")}
                onMouseLeave={(e) => (e.target.style.background = "var(--color-surface-container-highest)")}
              >
                Browse Jobs
              </button>
            </div>
          </div>

          <div
            className="profile-header"
            style={{
              maxWidth: "1280px",
              margin: "-8rem auto 0",
              padding: "0 2rem 4rem",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div className="profile-grid-container">
              {/* LEFT — Profile Card */}
              <div
                className="anim-slide-up anim-delay-1"
                style={{
                  background: "var(--color-surface-container-low)",
                  padding: "2.5rem",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "8px",
                  border: "1px solid var(--color-outline-variant)",
                  boxShadow: "var(--shadow-elevated)"
                }}
              >
                <div
                  className="teal-glow"
                  style={{
                    position: "absolute",
                    top: "-40px",
                    right: "-40px",
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                  }}
                />

                <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      width: "160px",
                      height: "160px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--color-secondary), var(--color-surface-container-highest))",
                      border: "4px solid var(--color-background)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontSize: "3.5rem",
                        fontWeight: 700,
                        color: "var(--color-on-surface)",
                      }}
                    >
                      {initials}
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
                      border: "3px solid var(--color-background)",
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
                        fontFamily: "var(--font-headline)",
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "var(--color-on-surface)",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {displayName}
                    </h1>
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
                        borderRadius: "4px"
                      }}
                    >
                      {availabilityLabel}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "var(--color-secondary)",
                      fontFamily: "var(--font-headline)",
                      fontSize: "1.1rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {developer?.portfolioURL ? "Portfolio-Ready Developer" : "Freelance Developer"}
                  </p>
                  <p
                    style={{
                      color: "var(--color-on-surface)",
                      opacity: 0.8,
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      fontFamily: "var(--font-body)",
                      maxWidth: "280px",
                    }}
                  >
                    {user?.email
                      ? `Primary account: ${user.email}${user.phoneNumber ? ` • ${user.phoneNumber}` : ""}`
                      : "Your account details will appear here as your profile grows."}
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
                    className="signature-cta"
                    style={{
                      width: "100%",
                      color: "var(--color-on-primary-container)",
                      fontFamily: "var(--font-headline)",
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
                      transition: "transform 0.3s ease, filter 0.3s ease",
                      borderRadius: "4px"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = "brightness(1.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = "brightness(1)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
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
                    onClick={() => {
                      if (developer?.portfolioURL) {
                        window.open(developer.portfolioURL, "_blank", "noopener,noreferrer");
                      }
                    }}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1px solid var(--color-outline-variant-strong)",
                      color: "var(--color-secondary)",
                      fontFamily: "var(--font-headline)",
                      fontWeight: 700,
                      padding: "1rem",
                      fontSize: "1rem",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      transition: "background 0.2s",
                      borderRadius: "4px"
                    }}
                    disabled={!developer?.portfolioURL}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "var(--color-surface-container-high)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "transparent")
                    }
                  >
                    {developer?.portfolioURL ? "View Portfolio" : "Portfolio Unavailable"}
                  </button>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontWeight: 700,
                      color: "var(--color-outline)",
                      fontFamily: "var(--font-label)",
                      marginBottom: "1rem",
                    }}
                  >
                    Technical Arsenal
                  </p>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {skills.length > 0 ? skills.map((skill) => (
                      <span
                        key={skill.name}
                        style={{
                          background: "var(--color-secondary)",
                          color: "var(--color-on-secondary-container)",
                          padding: "4px 12px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          fontFamily: "var(--font-headline)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderRadius: "4px"
                        }}
                      >
                        {skill.name}
                      </span>
                    )) : (
                      <span style={{ color: "var(--color-secondary)", fontFamily: "var(--font-body)", fontSize: "0.85rem" }}>
                        No skills added yet.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT — Stats + Experience */}
              <div
                className="anim-fade-in-up anim-delay-2"
                style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
              >
                {/* Stats Row */}
                <div
                  style={{
                    background: "var(--color-surface-container-low)",
                    padding: "2rem",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-around",
                    alignItems: "center",
                    borderRadius: "8px",
                    border: "1px solid var(--color-outline-variant)"
                  }}
                >
                  {profileStats.map((stat, index, arr) => (
                    <div
                      key={stat.label}
                      style={{
                        textAlign: "center",
                        minWidth: "120px",
                        flex: 1,
                        borderRight:
                          index < arr.length - 1
                            ? "1px solid var(--color-outline-variant)"
                            : "none",
                        padding: "1rem",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-headline)",
                          fontSize: "2.5rem",
                          fontWeight: 700,
                          color: "var(--color-primary)",
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
                          color: "var(--color-outline)",
                          fontFamily: "var(--font-label)",
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
                    background: "var(--color-tertiary-fixed)",
                    padding: "2.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    borderRadius: "8px",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease"
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
                    style={{
                      background: "var(--color-on-tertiary-fixed)",
                      color: "var(--color-tertiary-fixed)",
                      padding: "3px 10px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontFamily: "var(--font-label)",
                      alignSelf: "flex-start",
                      borderRadius: "4px"
                    }}
                  >
                    Featured Case Study
                  </span>
                  <h2
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "var(--color-on-tertiary-fixed)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Neural Architecture for FinTech.
                  </h2>
                  <p
                    style={{
                      color: "var(--color-on-tertiary-container)",
                      fontSize: "0.9rem",
                      lineHeight: 1.7,
                      fontFamily: "var(--font-body)",
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
                      flexWrap: "wrap",
                    }}
                  >
                    {["Rust", "Kafka", "gRPC", "PostgreSQL"].map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "var(--color-glow-teal-soft)",
                          color: "var(--color-secondary)",
                          padding: "3px 10px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          fontFamily: "var(--font-label)",
                          border: "1px solid var(--color-outline-variant-strong)",
                          borderRadius: "4px"
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience Timeline */}
                <div style={{ background: "var(--color-surface-container-low)", padding: "2.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
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
                        fontFamily: "var(--font-headline)",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "var(--color-on-surface)",
                      }}
                    >
                      Recent Engagements
                    </h2>
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--color-secondary)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font-label)",
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
                    {(recentEngagements.length > 0 ? recentEngagements : [{
                      year: "Now",
                      title: "No engagements yet",
                      desc: "Your recent contract history will appear here once you are assigned to projects.",
                    }]).map((exp) => (
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
                            background: "var(--color-surface-container-highest)",
                            padding: "0.75rem 1rem",
                            fontFamily: "var(--font-headline)",
                            fontWeight: 700,
                            color: "var(--color-outline)",
                            fontSize: "0.85rem",
                            flexShrink: 0,
                            borderRadius: "4px"
                          }}
                        >
                          {exp.year}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4
                            style={{
                              fontFamily: "var(--font-headline)",
                              fontWeight: 700,
                              color: "var(--color-on-surface)",
                              marginBottom: "0.25rem",
                            }}
                          >
                            {exp.title}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--color-on-surface)",
                              opacity: 0.8,
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {exp.desc}
                          </p>
                        </div>
                        <span
                          className="material-symbols-outlined"
                          style={{ color: "var(--color-outline)", fontSize: "1.25rem" }}
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
    </>
  );
}

export default DeveloperProfile;
