import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { applicationService } from "../api/services/contractService";
import { useToast } from "../context/ToastContext";

function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true);
        const res = await applicationService.getApplicationById(id);
        setApplication(res.data?.data ?? res.data);
      } catch (err) {
        addToast(err?.response?.data?.message || "Failed to load application details.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  const applicationContracts = application?.contracts || [];

  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh", display: "flex" }}>
      <Sidebar activePage="Create Contract" role="client" />
      <main
        className="sidebar-layout-main"
        style={{
          marginLeft: "256px",
          flex: 1,
          padding: "calc(96px + 3rem) 3rem 3rem 3rem",
        }}
      >
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
            <p style={{ color: "var(--color-outline)", fontFamily: "var(--font-body)" }}>Loading project app data...</p>
          </div>
        ) : application ? (
          <div className="anim-fade-in" style={{ maxWidth: "900px" }}>
            {/* Back */}
            <button
              onClick={() => navigate(-1)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-secondary)",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "2rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>arrow_back</span>
              Back to Dashboard
            </button>

            {/* Header */}
            <div style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <h1
                  style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: "clamp(2rem, 3vw, 3rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "var(--color-on-surface)",
                    lineHeight: 1,
                  }}
                >
                  {application.appName || "Project App"} {application.appID ? `( ${application.appID.slice(-6).toUpperCase()} )` : ""}
                </h1>
                <span
                  style={{
                    padding: "4px 14px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "var(--font-label)",
                    color: "var(--color-secondary)",
                    border: "1px solid var(--color-outline-variant)",
                    borderRadius: "4px",
                    background: "var(--color-surface-container-lowest)",
                  }}
                >
                  {application.appType || "Application"} • v{application.currentVersion || "1.0.0"}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-label)",
                  fontSize: "0.75rem",
                  color: "var(--color-outline)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                Created {application.createdDate ? new Date(application.createdDate).toLocaleDateString() : "N/A"}
              </p>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem" }}>
              {/* Left: Cover Letter */}
              <section
                style={{
                  background: "var(--color-surface-container-low)",
                  padding: "2.5rem",
                  borderRadius: "8px",
                  border: "1px solid var(--color-outline-variant)",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--color-on-surface)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Description
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                    color: "var(--color-on-surface)",
                    opacity: 0.85,
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {application.description || "No description provided."}
                </p>
              </section>

              {/* Right: Metadata */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div
                  style={{
                    background: "var(--color-surface-container-low)",
                    padding: "2rem",
                    borderRadius: "8px",
                    border: "1px solid var(--color-outline-variant)",
                  }}
                >
                  <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-outline)", fontFamily: "var(--font-label)", marginBottom: "0.5rem" }}>
                    Application ID
                  </p>
                  <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.35rem", fontWeight: 700, color: "var(--color-primary)" }}>
                    {application.appID || "—"}
                  </h3>
                  <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--color-secondary)", fontFamily: "var(--font-body)", lineHeight: 1.6 }}>
                    {applicationContracts.length} contract{applicationContracts.length === 1 ? "" : "s"} linked
                  </p>
                </div>

                <div
                  style={{
                    background: "var(--color-surface-container-low)",
                    padding: "2rem",
                    borderRadius: "8px",
                    border: "1px solid var(--color-outline-variant)",
                  }}
                >
                  <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-outline)", fontFamily: "var(--font-label)", marginBottom: "0.5rem" }}>
                    Contracts
                  </p>
                  {applicationContracts.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {applicationContracts.slice(0, 3).map((c) => (
                        <p
                          key={c.contractID || c.contractId || c.id}
                          onClick={() => navigate(`/contracts/${c.contractID || c.id}`)}
                          style={{
                            fontFamily: "var(--font-headline)",
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: "var(--color-secondary)",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          {c.title || "Untitled contract"}
                        </p>
                      ))}
                      {applicationContracts.length > 3 ? (
                        <p style={{ color: "var(--color-outline)", fontFamily: "var(--font-body)", fontSize: "0.85rem" }}>
                          +{applicationContracts.length - 3} more
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p style={{ fontFamily: "var(--font-body)", color: "var(--color-secondary)", fontSize: "0.9rem" }}>
                      No contracts linked yet.
                    </p>
                  )}
                </div>

                {/* Delete Button */}
                {application.appID && (
                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete this application?")) return;
                      try {
                        await applicationService.deleteApplication(application.appID);
                        addToast("Project app deleted.", "success");
                        navigate("/client/dashboard");
                      } catch (err) {
                        addToast(err?.response?.data?.message || "Failed to delete.", "error");
                      }
                    }}
                    style={{
                      padding: "1rem",
                      background: "transparent",
                      border: "1px solid var(--color-error)",
                      color: "var(--color-error)",
                      fontFamily: "var(--font-headline)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                      transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "var(--color-error)";
                      e.target.style.color = "var(--color-on-error)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "var(--color-error)";
                    }}
                  >
                    Delete Application
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--color-error)", fontFamily: "var(--font-body)" }}>Application not found.</p>
        )}

        <Footer />
      </main>
    </div>
  );
}

export default ApplicationDetail;
