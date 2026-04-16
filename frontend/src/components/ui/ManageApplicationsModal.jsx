import { useState, useEffect } from "react";
import { proposalService } from "../../api/services/contractService";
import { useToast } from "../../context/ToastContext";

function ManageApplicationsModal({ contract, onClose }) {
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const res = await proposalService.getContractProposals(contract?.contractID);
        setApplications(res.data?.data || []);
      } catch (err) {
        addToast(err?.response?.data?.message || "Failed to load proposals.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    if (contract) fetchApplications();
  }, [contract, addToast]);

  const refresh = async () => {
    if (!contract?.contractID) return;
    const res = await proposalService.getContractProposals(contract.contractID);
    setApplications(res.data?.data || []);
  };

  const handleAccept = async (proposalId) => {
    try {
      await proposalService.acceptProposal(contract.contractID, proposalId);
      addToast("Proposal accepted. Developer added to the contract team.", "success");
      await refresh();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to accept proposal.", "error");
    }
  };

  const handleDecline = async (proposalId) => {
    try {
      await proposalService.declineProposal(contract.contractID, proposalId, {});
      addToast("Proposal declined.", "info");
      await refresh();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to decline proposal.", "error");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="anim-fade-in"
        style={{
          background: "var(--color-surface-container)",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: "12px",
          padding: "3rem",
          maxWidth: "800px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            background: "transparent",
            border: "none",
            color: "var(--color-outline)",
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.5rem" }}>close</span>
        </button>

        <h2
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--color-on-surface)",
            marginBottom: "0.5rem",
          }}
        >
          Hiring Pipeline
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "var(--color-outline)",
            marginBottom: "2.5rem",
          }}
        >
          Review developer proposals and invitation activity for {contract?.title || "this contract"}.
        </p>

        {isLoading ? (
          <p style={{ color: "var(--color-on-surface-variant)" }}>Loading proposals...</p>
        ) : applications.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", background: "var(--color-surface)", borderRadius: "8px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "var(--color-outline)", marginBottom: "1rem" }}>inbox</span>
            <p style={{ color: "var(--color-on-surface)", fontFamily: "var(--font-body)" }}>No proposals or invitations yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {applications.map((app) => {
              const appId = app.proposalID;
              return (
                <div
                  key={appId}
                  style={{
                    background: "var(--color-surface-container-low)",
                    border: "1px solid var(--color-outline-variant)",
                    borderRadius: "8px",
                    padding: "2rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                     <div>
                      <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", color: "var(--color-on-surface)", marginBottom: "0.5rem" }}>
                        {app.developer?.user?.fullName || "Developer"}
                      </h3>
                      <p style={{ fontFamily: "var(--font-label)", fontSize: "0.75rem", color: "var(--color-outline)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {app.source === "CLIENT_INVITE" ? "Client invitation" : "Developer proposal"} • {app.status}
                      </p>
                     </div>
                     <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-outline)", fontFamily: "var(--font-body)" }}>
                        {app.proposedRate ? `$${Number(app.proposedRate).toLocaleString()}/hr` : "Rate unavailable"}
                      </p>
                     </div>
                  </div>

                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-on-surface-variant)", lineHeight: 1.6, marginBottom: "2rem", whiteSpace: "pre-wrap" }}>
                    {app.message || "No message provided."}
                  </p>

                  {app.status === "PENDING" && app.source === "DEVELOPER_PROPOSAL" ? (
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleAccept(app.proposalID)}
                        style={{ padding: "0.85rem 1.4rem", background: "var(--color-primary-container)", color: "var(--color-on-primary-container)", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }}
                      >
                        Accept Proposal
                      </button>
                      <button
                        onClick={() => handleDecline(app.proposalID)}
                        style={{ padding: "0.85rem 1.4rem", background: "transparent", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }}
                      >
                        Decline
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageApplicationsModal;
