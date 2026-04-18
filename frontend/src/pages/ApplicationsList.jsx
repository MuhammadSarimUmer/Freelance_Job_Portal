import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { applicationService } from "../api/services/contractService";
import { useToast } from "../context/ToastContext";

function ApplicationsList() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationService.getApplications();
        setApplications(res.data?.data || []);
      } catch (err) {
        addToast("Failed to load applications.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, [addToast]);

  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh", display: "flex" }}>
      <Sidebar activePage="Applications" role="client" />
      <main style={{ marginLeft: 256, flex: 1, padding: "calc(96px + 3rem) 3rem 3rem" }}>
        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", marginBottom: "2rem" }}>
          My Applications
        </h1>

        {isLoading ? (
          <p style={{ color: "var(--color-on-surface-variant)" }}>Loading...</p>
        ) : applications.length === 0 ? (
          <p style={{ color: "var(--color-on-surface-variant)" }}>No applications yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {applications.map((app) => (
              <div
                key={app.appID}
                data-testid={`application-card-${app.appID}`}
                onClick={() => navigate(`/applications/${app.appID}`)}
                style={{
                  background: "var(--color-surface-container-low)",
                  border: "1px solid var(--color-outline-variant)",
                  borderRadius: 8,
                  padding: "1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontFamily: "var(--font-headline)", fontWeight: 700, margin: 0, fontSize: "1.1rem" }}>
                    {app.appName}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                    {app.appType} - v{app.currentVersion} - {app.contracts?.length ?? 0} contract(s)
                  </p>
                </div>
                <span style={{ fontSize: 13, color: "var(--color-primary)", fontFamily: "var(--font-headline)" }}>
                  View -&gt;
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ApplicationsList;
