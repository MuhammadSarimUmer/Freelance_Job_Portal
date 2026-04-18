import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { profileService } from "../api/services/profileService";
import { useToast } from "../context/ToastContext";
import Sidebar from "../components/layout/Sidebar";
import { normalizeTechName } from "../utils/techName";

function PublicDeveloperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [developer, setDeveloper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh", display: "flex" }}>
      <Sidebar activePage="Directory" role="client" />
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
              {availability} - {developer.experienceYears ?? 0} years exp - ${developer.hourlyRate ?? 0}/hr
            </p>
            {developer.portfolioURL ? (
              <a href={developer.portfolioURL} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--color-primary)" }}>
                Portfolio -&gt;
              </a>
            ) : null}
            <p style={{ margin: "6px 0 0", color: "var(--color-outline)", fontSize: 12 }}>
              Member since {memberSince}
            </p>
          </div>
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
      </main>
    </div>
  );
}

export default PublicDeveloperProfile;
