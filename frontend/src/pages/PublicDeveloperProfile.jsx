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
