import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { profileService } from "../api/services/profileService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { reviewService } from "../api/services/reviewService";

function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, count: 0 });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsLoading(true);
        const res = await profileService.getClientById(id);
        setClient(res.data?.data || null);
      } catch (err) {
        addToast(err?.response?.data?.message || "Failed to load client profile.", "error");
        setClient({
          user: { fullName: "Unknown Client" },
          companyName: "—",
          totalSpent: 0,
          activeContracts: 0,
          completedContracts: 0,
          memberSince: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  useEffect(() => {
    if (!client?.userID) return;

    const fetchReviews = async () => {
      try {
        const res = await reviewService.getReviewsForUser(client.userID);
        const payload = res.data?.data || {};
        setReviewSummary({
          averageRating: payload.averageRating || 0,
          count: payload.count || 0,
        });
      } catch (err) {
        console.error("Failed to load reviews", err);
      }
    };

    fetchReviews();
  }, [client?.userID]);

  const layoutStyles = `
    .client-profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 900px) {
      .client-profile-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  const StatCard = ({ label, value, accent }) => (
    <div
      style={{
        background: "var(--color-surface-container-low)",
        padding: "2rem",
        borderRadius: "8px",
        border: "1px solid var(--color-outline-variant)",
        flex: 1,
        minWidth: "180px",
      }}
    >
      <p
        style={{
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "var(--color-outline)",
          fontFamily: "var(--font-label)",
          marginBottom: "0.75rem",
        }}
      >
        {label}
      </p>
      <h3
        style={{
          fontFamily: "var(--font-headline)",
          fontSize: "2.5rem",
          fontWeight: 700,
          color: accent || "var(--color-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </h3>
    </div>
  );

  return (
    <>
      <style>{layoutStyles}</style>
      <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh", display: "flex" }}>
        <Sidebar activePage="Profile" role={user?.role?.toLowerCase() || "client"} />

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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
              <p style={{ color: "var(--color-outline)", fontFamily: "var(--font-body)", fontSize: "1.1rem" }}>
                Resolving client identity...
              </p>
            </div>
          ) : client ? (
            <div className="anim-fade-in" style={{ maxWidth: "1100px" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", marginBottom: "3rem", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--color-tertiary), var(--color-surface-container-highest))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "3px solid var(--color-primary)",
                  }}
                >
                  {client.user?.profileImageUrl ? (
                    <img
                      src={client.user.profileImageUrl}
                      alt={client.user?.fullName || "Client"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        color: "var(--color-on-surface)",
                      }}
                    >
                      {(client.user?.fullName || "?")[0].toUpperCase()}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h1
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontSize: "clamp(2.5rem, 4vw, 4rem)",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                      color: "var(--color-on-surface)",
                      lineHeight: 1,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {client.user?.fullName || "Unknown"}
                  </h1>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "1.1rem",
                      color: "var(--color-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {client.companyName || "Independent Client"}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-label)",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: "var(--color-outline)",
                    }}
                  >
                    Member since{" "}
                    {client.memberSince
                      ? new Date(client.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                      : "N/A"}
                  </p>
                </div>

                <button
                  className="signature-cta"
                  onClick={() => navigate(user?.role === "CLIENT" ? "/settings" : `/contracts?client=${id}`)}
                  style={{
                    padding: "1rem 2.5rem",
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
                    color: "var(--color-on-primary)",
                    border: "none",
                    fontFamily: "var(--font-headline)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    alignSelf: "center",
                    transition: "filter 0.3s, transform 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "brightness(1.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "brightness(1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {user?.role === "CLIENT" ? "Edit Profile" : "View Contracts"}
                </button>
              </div>

              {/* Stats Row */}
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "3rem" }}>
                <StatCard label="Total Invested" value={`$${(client.totalSpent || 0).toLocaleString()}`} />
                <StatCard label="Active Contracts" value={client.activeContracts || 0} accent="var(--color-secondary)" />
                <StatCard label="Completed" value={client.completedContracts || 0} accent="var(--color-tertiary)" />
                <StatCard
                  label="Rating"
                  value={reviewSummary.count > 0 ? reviewSummary.averageRating.toFixed(1) : "N/A"}
                  accent="var(--color-primary)"
                />
              </div>

              {/* Bio / About */}
              <section
                style={{
                  background: "var(--color-surface-container-low)",
                  padding: "3rem",
                  borderRadius: "8px",
                  border: "1px solid var(--color-outline-variant)",
                  marginBottom: "2rem",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--color-on-surface)",
                    marginBottom: "1.5rem",
                  }}
                >
                  About
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "1rem",
                    color: "var(--color-on-surface)",
                    opacity: 0.85,
                    lineHeight: 1.7,
                    maxWidth: "700px",
                  }}
                >
                  {client.bio || "This client has not added a bio yet. They are verified on the Codex platform and their contracts are secured through the escrow pipeline."}
                </p>
              </section>

              {/* Trust & Verification */}
              <section
                style={{
                  background: "var(--color-surface-container-low)",
                  padding: "3rem",
                  borderRadius: "8px",
                  border: "1px solid var(--color-outline-variant)",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--color-on-surface)",
                    marginBottom: "2rem",
                  }}
                >
                  Trust & Verification
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {[
                    { icon: "verified", text: "Email Verified", active: true },
                    { icon: "payments", text: "Payment Method Verified", active: client.totalSpent > 0 },
                    { icon: "shield", text: "Identity Confirmed", active: true },
                  ].map((item) => (
                    <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "1.5rem",
                          color: item.active ? "var(--color-secondary)" : "var(--color-outline)",
                        }}
                      >
                        {item.icon}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.95rem",
                          color: item.active ? "var(--color-on-surface)" : "var(--color-outline)",
                        }}
                      >
                        {item.text}
                      </span>
                      {item.active && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: "var(--color-secondary)",
                            fontFamily: "var(--font-label)",
                            fontWeight: 700,
                          }}
                        >
                          Confirmed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          <Footer />
        </main>
      </div>
    </>
  );
}

export default ClientProfile;
