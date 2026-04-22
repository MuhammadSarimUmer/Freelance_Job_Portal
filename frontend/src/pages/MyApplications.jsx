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
  const [processingId, setProcessingId] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const res = await proposalService.getMyProposals();
      setApplications(res.data?.data || []);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to load proposals.";
      setFetchError(msg);
      addToast(msg, "error");
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (proposalId) => {
    if (processingId) return;
    try {
      setProcessingId(proposalId);
      await proposalService.acceptInvitation(proposalId);
      addToast("Invitation accepted. You have been added to the contract.", "success");
      await fetchApplications();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to accept invitation.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineInvite = async (proposalId) => {
    if (processingId) return;
    try {
      setProcessingId(proposalId);
      await proposalService.declineInvitation(proposalId, {});
      addToast("Invitation declined.", "info");
      await fetchApplications();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to decline invitation.", "error");
    } finally {
      setProcessingId(null);
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

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "TBD");
  const formatMoney = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? `$${num.toLocaleString()}` : "$0";
  };
  const clampText = (text, limit = 180) => {
    if (!text) return "";
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  };

  const invitations = applications.filter((app) => app.source === "CLIENT_INVITE");
  const proposals = applications.filter((app) => app.source === "DEVELOPER_PROPOSAL");

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
        ) : fetchError ? (
          <div style={{ padding: "3rem 2rem", background: "var(--color-surface-container-low)", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", textAlign: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "var(--color-error)", display: "block", marginBottom: "0.75rem" }}>error</span>
            <p style={{ fontFamily: "var(--font-headline)", color: "var(--color-error)", margin: "0 0 0.5rem" }}>Could not load proposals</p>
            <p style={{ color: "var(--color-outline)", fontSize: "0.85rem", margin: "0 0 1.5rem" }}>{fetchError}</p>
            <button type="button" onClick={fetchApplications} style={{ padding: "0.65rem 1.5rem", border: "1px solid var(--color-outline-variant)", background: "transparent", color: "var(--color-on-surface)", borderRadius: "4px", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.8rem" }}>
              Retry
            </button>
          </div>
        ) : invitations.length > 0 || proposals.length > 0 ? (
          <div className="anim-fade-in" style={{ display: "grid", gap: "2rem" }}>
            <section>
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "1rem" }}>Invitations</h2>
              {invitations.length > 0 ? invitations.map((app) => {
                const milestones = app.contract?.milestones || [];
                const milestonePreview = milestones.slice(0, 3);
                const clientEmail = app.contract?.client?.user?.email;
                return (
                  <div key={app.proposalID} className="app-row" style={{ alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", margin: "0 0 0.25rem 0" }}>
                        {app.contract?.title || "Untitled Contract"}
                      </h3>
                      <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "0.9rem" }}>
                        Client invitation - {app.contract?.application?.appName || "Project"}
                      </p>
                      {app.contract?.client?.user?.fullName ? (
                        <p style={{ color: "var(--color-outline)", margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
                          Client: {app.contract.client.user.fullName}
                        </p>
                      ) : null}
                      {clientEmail ? (
                        <p style={{ color: "var(--color-outline)", margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
                          Email: {" "}
                          <a href={`mailto:${clientEmail}`} style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                            {clientEmail}
                          </a>
                        </p>
                      ) : null}
                      <p style={{ color: "var(--color-on-surface-variant)", margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
                        Clients and developers may connect over email.
                      </p>
                      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--color-outline)" }}>
                        <span>Budget: {formatMoney(app.contract?.totalAmount)}</span>
                        <span>Timeline: {formatDate(app.contract?.startDate)} - {formatDate(app.contract?.endDate)}</span>
                        <span>Role: {app.role || "Contributor"}</span>
                      </div>
                      {app.contract?.description ? (
                        <p style={{ color: "var(--color-secondary)", fontSize: "0.85rem", marginTop: "0.75rem", marginBottom: 0, maxWidth: "42rem" }}>
                          {clampText(app.contract.description)}
                        </p>
                      ) : null}
                      <div style={{ marginTop: "0.75rem" }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-on-surface)", margin: "0 0 0.5rem 0", fontFamily: "var(--font-headline)" }}>
                          Milestones
                        </p>
                        {milestonePreview.length > 0 ? (
                          <div style={{ display: "grid", gap: "0.4rem" }}>
                            {milestonePreview.map((m) => (
                              <div key={m.milestoneID} style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", fontSize: "0.8rem", color: "var(--color-on-surface-variant)" }}>
                                <span>{m.title}</span>
                                <span>{formatMoney(m.milestoneAmount)}</span>
                                <span>{formatDate(m.dueDate)}</span>
                              </div>
                            ))}
                            {milestones.length > milestonePreview.length ? (
                              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-outline)" }}>
                                +{milestones.length - milestonePreview.length} more milestones
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-outline)" }}>
                            No milestones defined yet.
                          </p>
                        )}
                      </div>
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
                      {app.status === "PENDING" ? (
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
                            disabled={Boolean(processingId)}
                            style={{ padding: "0.55rem 0.9rem", borderRadius: "4px", border: "none", background: "var(--color-primary-container)", color: "var(--color-on-primary-container)", cursor: processingId ? "not-allowed" : "pointer", fontWeight: 700, opacity: processingId === app.proposalID ? 0.7 : 1 }}
                          >
                            {processingId === app.proposalID ? "Accepting..." : "Accept"}
                          </button>
                          <button
                            onClick={() => handleDeclineInvite(app.proposalID)}
                            disabled={Boolean(processingId)}
                            style={{ padding: "0.55rem 0.9rem", borderRadius: "4px", border: "1px solid var(--color-outline-variant)", background: "transparent", color: "var(--color-on-surface)", cursor: processingId ? "not-allowed" : "pointer", fontWeight: 700 }}
                          >
                            Decline
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              }) : (
                <div style={{ padding: "2.5rem", textAlign: "center", background: "var(--color-surface-container-lowest)", borderRadius: "8px" }}>
                  <p style={{ color: "var(--color-outline)", fontFamily: "var(--font-headline)" }}>No invitations yet.</p>
                </div>
              )}
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "1rem" }}>Proposals</h2>
              {proposals.length > 0 ? proposals.map((app) => (
                <div key={app.proposalID} className="app-row">
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", margin: "0 0 0.25rem 0" }}>
                      {app.contract?.title || "Untitled Contract"}
                    </h3>
                    <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "0.9rem" }}>
                      Developer proposal - {app.contract?.application?.appName || "Project"}
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
                    {app.status === "PENDING" ? (
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
              )) : (
                <div style={{ padding: "2.5rem", textAlign: "center", background: "var(--color-surface-container-lowest)", borderRadius: "8px" }}>
                  <p style={{ color: "var(--color-outline)", fontFamily: "var(--font-headline)" }}>No proposals yet.</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div style={{ padding: "3.5rem 2rem", textAlign: "center", background: "var(--color-surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "var(--color-outline)", display: "block", marginBottom: "1rem" }}>inbox</span>
            <p style={{ fontFamily: "var(--font-headline)", fontSize: "1.1rem", color: "var(--color-on-surface)", margin: "0 0 0.5rem" }}>No proposals or invitations yet</p>
            <p style={{ color: "var(--color-outline)", fontSize: "0.85rem", maxWidth: "32rem", margin: "0 auto 1.5rem" }}>
              To apply to a contract you need a <strong>CV uploaded</strong> in Profile Settings. Once uploaded, browse Open Contracts and hit Apply.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => navigate("/settings")} style={{ padding: "0.65rem 1.25rem", background: "var(--color-primary)", border: "none", color: "var(--color-on-primary)", borderRadius: "5px", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.78rem" }}>
                Upload CV
              </button>
              <button type="button" onClick={() => navigate("/contracts/open")} style={{ padding: "0.65rem 1.25rem", background: "transparent", border: "1px solid var(--color-outline-variant)", color: "var(--color-on-surface)", borderRadius: "5px", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.78rem" }}>
                Browse Contracts
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default MyApplications;
