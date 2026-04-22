import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { profileService } from "../api/services/profileService";
import { contractService } from "../api/services/contractService";
import { reviewService } from "../api/services/reviewService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import { normalizeTechName } from "../utils/techName";

function PublicDeveloperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user: authUser } = useAuth();
  const [developer, setDeveloper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState("");
  const [inviteRole, setInviteRole] = useState("Lead Developer");
  const [isInviting, setIsInviting] = useState(false);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, count: 0 });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const isClient = authUser?.role === "CLIENT";

  useEffect(() => {
    const fetchDeveloper = async () => {
      try {
        const res = await profileService.getDeveloperById(id);
        setDeveloper(res.data?.data);
      } catch (err) {
        addToast("Failed to load developer profile.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeveloper();
  }, [id, addToast]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!developer?.user?.userID) return;
      try {
        setIsLoadingReviews(true);
        const res = await reviewService.getReviewsForUser(developer.user.userID);
        setReviews(res.data?.data?.reviews || []);
        setReviewStats({
          averageRating: res.data?.data?.averageRating || 0,
          count: res.data?.data?.count || 0,
        });
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [developer?.user?.userID]);

  useEffect(() => {
    if (!isClient) return;
    const fetchContracts = async () => {
      try {
        setIsLoadingContracts(true);
        const res = await contractService.getMyContracts();
        const list = res.data?.data || [];
        setContracts(list.filter((contract) => contract.status === "DRAFT"));
      } catch (err) {
        addToast(err?.response?.data?.message || "Failed to load contracts.", "error");
        setContracts([]);
      } finally {
        setIsLoadingContracts(false);
      }
    };
    fetchContracts();
  }, [isClient, addToast]);

  const handleInvite = async () => {
    if (!developer?.developerID || !selectedContractId) {
      addToast("Choose a contract before sending an invitation.", "error");
      return;
    }

    try {
      setIsInviting(true);
      await contractService.inviteDeveloper(selectedContractId, {
        developerID: developer.developerID,
        role: inviteRole,
        message: `Invitation sent for ${inviteRole}.`,
      });
      addToast("Invitation sent successfully.", "success");
      setInviteOpen(false);
      setSelectedContractId("");
      setInviteRole("Lead Developer");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to send invitation.", "error");
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return <p style={{ padding: "6rem 3rem" }}>Loading profile...</p>;
  }
  if (!developer) {
    return <p style={{ padding: "6rem 3rem", color: "var(--color-error)" }}>Developer not found.</p>;
  }

  const user = developer.user;
  const displayName = user?.fullName || "Developer";
  const skills = developer.knownTechs || [];
  const availability = developer.availabilityStatus?.replace("_", " ") || "Unknown";
  const memberSince = user?.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : "N/A";
  const isImageUrl = (url) => /\.(png|jpe?g|webp|gif|bmp)(\?.*)?$/i.test(url || "");
  const isPdfUrl = (url) => /\.pdf(\?.*)?$/i.test(url || "");

  const renderStarRow = (rating, size = "1.1rem") => (
    <span style={{ fontSize: size, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? "var(--color-primary)" : "var(--color-outline)" }}>
          {s <= Math.round(rating) ? "★" : "☆"}
        </span>
      ))}
    </span>
  );

  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh", display: "flex" }}>
      <Sidebar activePage="Developer Directory" role="client" />
      {inviteOpen ? (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setInviteOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "520px", background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px", padding: "2rem" }}
          >
            <h2 style={{ fontFamily: "var(--font-headline)", marginTop: 0 }}>
              Invite {displayName}
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
                  disabled={isLoadingContracts}
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
              <button
                onClick={handleInvite}
                disabled={isInviting || contracts.length === 0}
                style={{ padding: "0.75rem 1.5rem", borderRadius: "6px", border: "none", background: "var(--color-primary)", color: "var(--color-on-primary)", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 700 }}
              >
                {isInviting ? "Sending..." : "Send Invitation"}
              </button>
              <button
                onClick={() => setInviteOpen(false)}
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
      <main style={{ marginLeft: 256, flex: 1, padding: "calc(96px + 3rem) 3rem 3rem", maxWidth: 900 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", color: "var(--color-secondary)", cursor: "pointer", marginBottom: "2rem", fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}
        >
          &lt;- Back
        </button>

        <div style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)", borderRadius: 8, padding: "2rem", marginBottom: "2rem", display: "flex", gap: "2rem", alignItems: "flex-start" }}>
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={displayName} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-headline)", fontSize: "1.5rem", color: "var(--color-on-primary-container)" }}>
              {displayName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--font-headline)", margin: 0, fontSize: "2rem" }}>{displayName}</h1>
            <p style={{ margin: "4px 0", color: "var(--color-on-surface-variant)", fontSize: 14 }}>
              {availability} · {developer.experienceYears ?? 0} yrs exp · ${developer.hourlyRate ?? 0}/hr
            </p>
            {developer.averageRating ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "6px 0" }}>
                {renderStarRow(developer.averageRating, "1rem")}
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-on-surface)" }}>
                  {Number(developer.averageRating).toFixed(1)}
                </span>
                <span style={{ fontSize: 12, color: "var(--color-outline)" }}>
                  ({developer.reviewCount ?? 0} review{(developer.reviewCount ?? 0) !== 1 ? "s" : ""})
                </span>
              </div>
            ) : (
              <p style={{ margin: "6px 0", fontSize: 12, color: "var(--color-outline)" }}>No reviews yet</p>
            )}
            {user?.email ? (
              <p style={{ margin: "6px 0", color: "var(--color-on-surface-variant)", fontSize: 13 }}>
                Email: {" "}
                <a
                  href={`mailto:${user.email}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--color-primary)", textDecoration: "none" }}
                >
                  {user.email}
                </a>
              </p>
            ) : null}
            {developer.portfolioURL ? (
              <a href={developer.portfolioURL} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--color-primary)" }}>
                Portfolio -&gt;
              </a>
            ) : null}
            <p style={{ margin: "6px 0 0", color: "var(--color-outline)", fontSize: 12 }}>
              Member since {memberSince}
            </p>
            <p style={{ margin: "8px 0 0", color: "var(--color-on-surface-variant)", fontSize: 12 }}>
              Clients and developers may connect through email.
            </p>
            {isClient ? (
              <button
                onClick={() => setInviteOpen(true)}
                style={{ marginTop: "1rem", padding: "0.65rem 1.25rem", borderRadius: "6px", border: "none", background: "var(--color-primary)", color: "var(--color-on-primary)", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.85rem" }}
              >
                Invite to Contract
              </button>
            ) : null}
          </div>
        </div>

        <div style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline-variant)", borderRadius: 8, padding: "1.25rem", marginBottom: "2rem" }}>
          <h3 style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "1rem" }}>About</h3>
          <p style={{ marginTop: "0.75rem", color: "var(--color-on-surface-variant)", fontSize: 13, lineHeight: 1.6 }}>
            {developer.bio || "No about info provided yet."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline-variant)", borderRadius: 8, padding: "1.25rem" }}>
            <h3 style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "1rem" }}>Portfolio</h3>
            {developer.portfolioURL ? (
              <>
                <a href={developer.portfolioURL} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--color-primary)" }}>
                  Open portfolio
                </a>
                {isImageUrl(developer.portfolioURL) ? (
                  <img
                    src={developer.portfolioURL}
                    alt="Portfolio preview"
                    style={{ width: "100%", marginTop: "0.75rem", borderRadius: 6, border: "1px solid var(--color-outline-variant)", objectFit: "cover" }}
                  />
                ) : (
                  <p style={{ marginTop: "0.75rem", color: "var(--color-on-surface-variant)", fontSize: 13 }}>
                    Portfolio link saved.
                  </p>
                )}
              </>
            ) : (
              <p style={{ marginTop: "0.75rem", color: "var(--color-on-surface-variant)", fontSize: 13 }}>
                No portfolio provided.
              </p>
            )}
          </div>

          <div style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline-variant)", borderRadius: 8, padding: "1.25rem" }}>
            <h3 style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "1rem" }}>Resume / CV</h3>
            {developer.cvUrl ? (
              <>
                <a href={developer.cvUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--color-primary)" }}>
                  View CV
                </a>
                {isImageUrl(developer.cvUrl) ? (
                  <img
                    src={developer.cvUrl}
                    alt="CV preview"
                    style={{ width: "100%", marginTop: "0.75rem", borderRadius: 6, border: "1px solid var(--color-outline-variant)", objectFit: "cover" }}
                  />
                ) : isPdfUrl(developer.cvUrl) ? (
                  <iframe
                    title="CV preview"
                    src={developer.cvUrl}
                    style={{ width: "100%", height: "220px", marginTop: "0.75rem", borderRadius: 6, border: "1px solid var(--color-outline-variant)" }}
                  />
                ) : (
                  <p style={{ marginTop: "0.75rem", color: "var(--color-on-surface-variant)", fontSize: 13 }}>
                    CV file available.
                  </p>
                )}
              </>
            ) : (
              <p style={{ marginTop: "0.75rem", color: "var(--color-on-surface-variant)", fontSize: 13 }}>
                No CV uploaded.
              </p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "1rem" }}>Skills</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skills.length > 0 ? (
              skills.map((s) => (
                <span key={s.techID} style={{ background: "var(--color-surface-container)", padding: "6px 12px", borderRadius: 4, fontSize: 13 }}>
                  {normalizeTechName(s.tech?.techName || s.techID)} - {s.proficiencyLevel}
                </span>
              ))
            ) : (
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>No skills listed.</p>
            )}
          </div>
        </div>

        {developer.cvUrl ? (
          <div style={{ marginBottom: "2rem" }}>
            <a
              href={developer.cvUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-block", padding: "10px 20px", background: "var(--color-primary)", color: "var(--color-on-primary)", borderRadius: 6, textDecoration: "none", fontFamily: "var(--font-headline)", fontSize: 14 }}
            >
              Download CV
            </a>
          </div>
        ) : null}

        {/* REVIEWS SECTION */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", margin: 0 }}>Reviews</h2>
            {reviewStats.count > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {renderStarRow(reviewStats.averageRating, "1.25rem")}
                <span style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-on-surface)" }}>
                  {Number(reviewStats.averageRating).toFixed(1)}
                </span>
                <span style={{ color: "var(--color-outline)", fontSize: "0.8rem" }}>
                  ({reviewStats.count} review{reviewStats.count !== 1 ? "s" : ""})
                </span>
              </div>
            ) : null}
          </div>

          {isLoadingReviews ? (
            <p style={{ color: "var(--color-outline)", fontSize: 13 }}>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline-variant)", borderRadius: 8, padding: "2rem", textAlign: "center" }}>
              <p style={{ color: "var(--color-outline)", margin: 0, fontSize: 13 }}>No reviews yet. Reviews appear here after completed contracts.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {reviews.map((review) => (
                <div
                  key={review.reviewID}
                  style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline-variant)", borderRadius: 8, padding: "1.25rem" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {review.reviewer?.profileImageUrl ? (
                        <img src={review.reviewer.profileImageUrl} alt={review.reviewer.fullName} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-on-primary-container)" }}>
                          {(review.reviewer?.fullName || "?").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "0.9rem", color: "var(--color-on-surface)" }}>
                          {review.reviewer?.fullName || "Client"}
                        </p>
                        {review.contract?.title ? (
                          <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {review.contract.title}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {renderStarRow(review.rating)}
                      <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "var(--color-outline)" }}>
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  {review.comment ? (
                    <p style={{ margin: 0, color: "var(--color-on-surface-variant)", fontSize: 13, lineHeight: 1.6, paddingTop: "0.5rem", borderTop: "1px solid var(--color-outline-variant)" }}>
                      {review.comment}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PublicDeveloperProfile;
