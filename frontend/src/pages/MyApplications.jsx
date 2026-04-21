import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { proposalService } from "../api/services/contractService";
import { useToast } from "../context/ToastContext";

function MyApplications() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await proposalService.getMyProposals();
      setApplications(res.data?.data || []);
    } catch (err) {
      console.error(err);
      addToast(err?.response?.data?.message || "Failed to load proposals.", "error");
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (proposalId) => {
    try {
      await proposalService.acceptInvitation(proposalId);
      addToast("Invitation accepted.", "success");
      fetchApplications();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to accept invitation.", "error");
    }
  };

  const handleDeclineInvite = async (proposalId) => {
    try {
      await proposalService.declineInvitation(proposalId, {});
      addToast("Invitation declined.", "info");
      fetchApplications();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to decline invitation.", "error");
    }
  };

  const handleWithdrawProposal = async (proposalId) => {
    try {
      await proposalService.withdrawProposal(proposalId);
      addToast("Proposal withdrawn.", "info");
      fetchApplications();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to withdraw proposal.", "error");
    }
  };

  return (
    <>
      <style>{`
        .app-row {
          background: var(--color-surface-container-low);
          padding: 1.5rem 2rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.3s ease;
        }
        .app-row:hover {
          background: var(--color-surface-container);
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-family: var(--font-body);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .status-PENDING { background: var(--color-surface); color: var(--color-on-surface-variant); }
        .status-ACCEPTED { background: rgba(0, 245, 255, 0.1); color: var(--color-primary); }
        .status-DECLINED { background: rgba(255, 113, 108, 0.1); color: var(--color-error); }
        .status-WITHDRAWN { background: rgba(140, 140, 140, 0.15); color: var(--color-outline); }
      `}</style>

      <Sidebar activePage="My Proposals" role="developer" />

      <main className="sidebar-layout-main" style={{ marginLeft: "256px", flex: 1, padding: "calc(96px + 3rem) 3rem 3rem 3rem" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3rem", gap: "1rem", flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "3rem", margin: 0 }}>My Proposals & Invites</h1>
          <button
            type="button"
            onClick={fetchApplications}
            disabled={isLoading}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              border: "1px solid var(--color-outline-variant)",
              background: "transparent",
              color: "var(--color-on-surface)",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {isLoading ? (
          <p style={{ color: "var(--color-on-surface-variant)" }}>Loading proposal activity...</p>
        ) : applications.length > 0 ? (
          <div className="anim-fade-in">
            {applications.map(app => (
              <div key={app.proposalID} className="app-row">
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", margin: "0 0 0.25rem 0" }}>
                    {app.contract?.title || "Untitled Contract"}
                  </h3>
                  <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "0.9rem" }}>
                    {app.source === "CLIENT_INVITE" ? "Client invitation" : "Developer proposal"} • {app.contract?.application?.appName || "Project"}
                  </p>
                  {app.contract?.client?.user?.fullName ? (
                    <p style={{ color: "var(--color-outline)", margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
                      Client: {app.contract.client.user.fullName}
                    </p>
                  ) : null}
                  {app.message ? (
                    <p style={{ color: "var(--color-secondary)", fontSize: "0.85rem", marginTop: "0.75rem", marginBottom: 0, maxWidth: "40rem" }}>
                      {app.message}
                    </p>
                  ) : null}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`status-badge status-${app.status}`} style={{ display: "inline-block", marginBottom: "0.4rem" }}>
                    {app.status}
                  </span>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "var(--color-outline)", fontFamily: "var(--font-body)" }}>
                    {app.proposedRate ? `$${Number(app.proposedRate).toLocaleString()}/hr` : "Rate not specified"}
                  </p>
                  {app.status === "PENDING" && app.source === "CLIENT_INVITE" ? (
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.75rem", flexWrap: "wrap" }}>
                      {app.contract?.client?.clientID ? (
                        <button
                          onClick={() => navigate(`/clients/${app.contract.client.clientID}`)}
                          style={{ padding: "0.55rem 0.9rem", borderRadius: "4px", border: "1px solid var(--color-outline-variant)", background: "transparent", color: "var(--color-on-surface)", cursor: "pointer", fontWeight: 700 }}
                        >
                          View Client
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleAcceptInvite(app.proposalID)}
                        style={{ padding: "0.55rem 0.9rem", borderRadius: "4px", border: "none", background: "var(--color-primary-container)", color: "var(--color-on-primary-container)", cursor: "pointer", fontWeight: 700 }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(app.proposalID)}
                        style={{ padding: "0.55rem 0.9rem", borderRadius: "4px", border: "1px solid var(--color-outline-variant)", background: "transparent", color: "var(--color-on-surface)", cursor: "pointer", fontWeight: 700 }}
                      >
                        Decline
                      </button>
                    </div>
                  ) : null}
                  {app.status === "PENDING" && app.source === "DEVELOPER_PROPOSAL" ? (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                      <button
                        onClick={() => handleWithdrawProposal(app.proposalID)}
                        style={{ padding: "0.55rem 0.9rem", borderRadius: "4px", border: "1px solid var(--color-outline-variant)", background: "transparent", color: "var(--color-on-surface)", cursor: "pointer", fontWeight: 700 }}
                      >
                        Withdraw
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "4rem", textAlign: "center", background: "var(--color-surface-container-lowest)", borderRadius: "8px" }}>
            <p style={{ color: "var(--color-outline)", fontFamily: "var(--font-headline)" }}>No proposals or invitations yet.</p>
          </div>
        )}
      </main>
    </>
  );
}

export default MyApplications;
