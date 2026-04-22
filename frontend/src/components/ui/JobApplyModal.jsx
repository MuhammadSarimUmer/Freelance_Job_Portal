import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { proposalService } from "../../api/services/contractService";

/**
 * JobApplyModal — opportunity details + proposal submission.
 */
function JobApplyModal({ job, onClose, onSubmitted }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = job.totalAmount
    ? `$${Number(job.totalAmount).toLocaleString()}`
    : job.budget || "Negotiable";

  const deadline = job.endDate
    ? new Date(job.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Open-ended";

  const status = job.status || "DRAFT";
  const statusLabelMap = {
    DRAFT: "OPEN",
    SIGNED: "SIGNED",
    IN_PROGRESS: "IN PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  };
  const statusLabel = statusLabelMap[status] || status;
  const proposalForMe = (job.proposals || []).find(
    (proposal) => proposal.developer?.userID === user?.userID || proposal.developer?.user?.email === user?.email,
  );

  const getProfileGateStatus = () => {
    const missingRequired = [];
    const missingOptional = [];

    if (!user?.developer?.cvUrl) missingRequired.push("CV");
    if (!user?.phoneNumber) missingOptional.push("contact number");
    if (!user?.developer?.hourlyRate || Number(user.developer.hourlyRate) <= 0) missingOptional.push("hourly rate");
    if ((user?.developer?.knownTechs?.length || 0) === 0) missingOptional.push("skills");

    return { missingRequired, missingOptional };
  };

  const submitProposal = async ({ ignoreProfileGate = false } = {}) => {
    try {
      const { missingRequired, missingOptional } = getProfileGateStatus();
      if (missingRequired.length > 0) {
        addToast("Upload your CV before sending a proposal.", "error");
        return;
      }
      if (missingOptional.length > 0 && !ignoreProfileGate) {
        addToast(`Complete your profile or send anyway: ${missingOptional.join(", ")}.`, "error");
        return;
      }

      setIsSubmitting(true);
      const trimmedMessage = message.trim();
      const payload = trimmedMessage ? { message: trimmedMessage } : {};
      await proposalService.createProposal(job.contractID, payload);
      addToast("Proposal submitted successfully.", "success");
      onSubmitted?.();
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to submit proposal.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewProfile = () => {
    onClose();
    navigate("/developer/profile");
  };

  const handleViewSettings = () => {
    onClose();
    navigate("/settings");
    addToast("Keep your profile sharp — clients pick developers they can see clearly.", "info");
  };

  const { missingRequired, missingOptional } = getProfileGateStatus();
  const canSendAnyway = missingRequired.length === 0 && missingOptional.length > 0;

  return (
    <div
      className="anim-fade-in"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="anim-slide-up"
        style={{
          background: "var(--color-surface-container-low)",
          padding: "2.5rem",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "620px",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid var(--color-outline-variant)",
          boxShadow: "var(--shadow-elevated)",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        {/* Glow */}
        <div
          className="teal-glow"
          style={{ position: "absolute", top: "-50px", left: "-50px", width: "200px", height: "200px", borderRadius: "50%", zIndex: 0, pointerEvents: "none", opacity: 0.4 }}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", position: "relative", zIndex: 1 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", fontWeight: 700, color: "var(--color-on-surface)", marginBottom: "0.25rem" }}>
              Contract Details
            </h2>
            <p style={{ color: "var(--color-secondary)", fontSize: "0.9rem" }}>{job.title || "Untitled Contract"}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "var(--color-surface-container-highest)", border: "none", color: "var(--color-on-surface)", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", cursor: "pointer" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>close</span>
          </button>
        </div>

        {/* Contract Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "2rem", position: "relative", zIndex: 1 }}>
          {[
            { label: "Total Budget", value: totalAmount, icon: "payments" },
            { label: "Deadline", value: deadline, icon: "calendar_today" },
            { label: "Status", value: statusLabel, icon: "flag" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "var(--color-surface-container)", padding: "1rem", borderRadius: "6px", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "1.25rem", color: "var(--color-primary)", display: "block", marginBottom: "0.5rem" }}>{stat.icon}</span>
              <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-outline)", fontFamily: "var(--font-label)", marginBottom: "0.25rem" }}>{stat.label}</p>
              <p style={{ fontFamily: "var(--font-headline)", fontSize: "0.9rem", color: "var(--color-on-surface)", fontWeight: 700 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ background: "var(--color-surface)", padding: "1.5rem", borderRadius: "6px", marginBottom: "2rem", position: "relative", zIndex: 1 }}>
          <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "0.9rem", color: "var(--color-secondary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Scope</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-on-surface)", opacity: 0.85, lineHeight: 1.7 }}>
            {job.description || "No scope description provided."}
          </p>
        </div>

        {/* Milestones */}
        {(job.milestones || []).length > 0 ? (
          <div style={{ marginBottom: "2rem", position: "relative", zIndex: 1 }}>
            <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "0.9rem", color: "var(--color-secondary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Payment Milestones
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {job.milestones.map((m, idx) => (
                <div
                  key={m.milestoneID || idx}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "var(--color-surface)", borderRadius: "6px", borderLeft: "3px solid var(--color-primary)", gap: "1rem" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.85rem", color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.title || `Milestone ${idx + 1}`}
                    </p>
                    {m.dueDate ? (
                      <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "var(--color-outline)", fontFamily: "var(--font-body)" }}>
                        Due {new Date(m.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    ) : null}
                  </div>
                  <span style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.9rem", color: "var(--color-on-surface)", flexShrink: 0 }}>
                    ${Number(m.milestoneAmount || 0).toLocaleString()}
                  </span>
                </div>
              ))}
              <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: "var(--color-outline)", fontFamily: "var(--font-body)", textAlign: "right" }}>
                Total: ${Number(job.totalAmount || 0).toLocaleString()} across {job.milestones.length} milestone{job.milestones.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ) : null}

        {/* Tech Stack */}
        {(job.technologies || []).length > 0 ? (
          <div style={{ marginBottom: "2rem", position: "relative", zIndex: 1 }}>
            <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "0.9rem", color: "var(--color-secondary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Required Tech
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {job.technologies.map((t, i) => (
                <span key={t.techID || i} style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", padding: "3px 9px", color: "var(--color-on-surface-variant)", fontFamily: "var(--font-label)", background: "var(--color-surface)", borderRadius: "4px", letterSpacing: "0.06em" }}>
                  {t.tech?.techName || "Tech"} · {t.requiredLevel}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Hiring Status */}
        <div style={{ background: "rgba(161,250,255,0.05)", border: "1px solid rgba(161,250,255,0.15)", borderRadius: "6px", padding: "1.25rem", marginBottom: "2rem", position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "var(--font-label)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-primary)", marginBottom: "0.5rem", fontWeight: 700 }}>
            Hiring status
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-on-surface-variant)", lineHeight: 1.6 }}>
            {proposalForMe
              ? `Your current status for this contract is ${proposalForMe.status.replaceAll("_", " ").toLowerCase()}.`
              : "Open contracts accept developer proposals, and clients can also send direct invitations. Keep your profile ready so either path works in your favor."}
          </p>
        </div>

        {missingRequired.length > 0 || missingOptional.length > 0 ? (
          <div
            style={{
              background: "var(--color-surface-container)",
              border: "1px dashed var(--color-outline-variant)",
              borderRadius: "6px",
              padding: "1rem",
              marginBottom: "1.5rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            {missingRequired.length > 0 ? (
              <>
                <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "0.85rem" }}>
                  CV required to submit a proposal.
                </p>
                <p style={{ margin: "0.4rem 0 0", color: "var(--color-on-surface-variant)", fontSize: "0.8rem" }}>
                  Upload your CV in profile settings to continue.
                </p>
              </>
            ) : null}
            {missingOptional.length > 0 ? (
              <>
                <p style={{ margin: missingRequired.length > 0 ? "0.75rem 0 0" : 0, fontFamily: "var(--font-headline)", fontSize: "0.85rem" }}>
                  Recommended: {missingOptional.join(", ")}
                </p>
                <p style={{ margin: "0.4rem 0 0", color: "var(--color-on-surface-variant)", fontSize: "0.8rem" }}>
                  You can update now, or send the proposal anyway.
                </p>
              </>
            ) : null}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleViewSettings}
                style={{
                  padding: "0.6rem 1rem",
                  background: "var(--color-surface-container-highest)",
                  border: "1px solid var(--color-outline-variant)",
                  color: "var(--color-on-surface)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                }}
              >
                Complete Profile
              </button>
              {canSendAnyway ? (
                <button
                  type="button"
                  onClick={() => submitProposal({ ignoreProfileGate: true })}
                  disabled={isSubmitting}
                  style={{
                    padding: "0.6rem 1rem",
                    background: "var(--color-primary-container)",
                    border: "none",
                    color: "var(--color-on-primary-container)",
                    borderRadius: "4px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-headline)",
                    fontWeight: 700,
                  }}
                >
                  Send Anyway
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {!proposalForMe ? (
          <div style={{ marginBottom: "2rem", position: "relative", zIndex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.75rem", fontFamily: "var(--font-label)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-outline)" }}>
              Proposal message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe why you're a strong fit for this contract."
              style={{
                width: "100%",
                minHeight: "120px",
                background: "var(--color-surface)",
                color: "var(--color-on-surface)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "6px",
                padding: "1rem",
                fontFamily: "var(--font-body)",
                resize: "vertical",
              }}
            />
          </div>
        ) : null}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <button
            onClick={proposalForMe ? handleViewProfile : () => submitProposal()}
            className="signature-cta"
            style={{
              flex: 1,
              padding: "1rem",
              border: "none",
              color: "var(--color-on-primary)",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
              borderRadius: "4px",
            }}
            disabled={!proposalForMe && (isSubmitting || missingRequired.length > 0)}
          >
            {proposalForMe ? "View My Profile" : isSubmitting ? "Submitting..." : "Submit Proposal"}
          </button>
          <button
            onClick={handleViewSettings}
            style={{
              flex: 1,
              padding: "1rem",
              background: "transparent",
              border: "1px solid var(--color-outline-variant)",
              color: "var(--color-on-surface-variant)",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
              borderRadius: "4px",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "var(--color-surface-container-highest)")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Profile Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobApplyModal;


/*
return (
    <div
      className="anim-fade-in"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="anim-slide-up"
        style={{
          background: "var(--color-surface-container-low)",
          padding: "2.5rem",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "600px",
          border: "1px solid var(--color-outline-variant)",
          boxShadow: "var(--shadow-elevated)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          className="teal-glow"
          style={{
            position: "absolute",
            top: "-50px",
            left: "-50px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.5
          }}
        />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", position: "relative", zIndex: 1 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", fontWeight: 700, color: "var(--color-on-surface)" }}>
              Apply for Contract
            </h2>
            <p style={{ color: "var(--color-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              {job.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--color-surface-container-highest)",
              border: "none",
              color: "var(--color-on-surface)",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "relative", zIndex: 1 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-secondary)", fontWeight: 700, marginBottom: "0.5rem" }}>
              Bid Amount (USD)
            </label>
            <input
              type="number"
              name="bidAmount"
              value={formData.bidAmount}
              onChange={handleInput}
              placeholder="e.g. 5000"
              required
              style={{
                width: "100%", background: "transparent", border: "none",
                borderBottom: "2px solid var(--color-outline-variant-strong)",
                padding: "0.75rem 0", color: "var(--color-on-surface)", fontSize: "1.25rem",
                outline: "none", fontFamily: "var(--font-headline)", transition: "border-color 0.3s"
              }}
              onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-secondary)")}
              onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-secondary)", fontWeight: 700, marginBottom: "0.5rem" }}>
              Estimated Timeline
            </label>
            <input
              type="text"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleInput}
              placeholder="e.g. 4 Weeks"
              required
              style={{
                width: "100%", background: "transparent", border: "none",
                borderBottom: "2px solid var(--color-outline-variant-strong)",
                padding: "0.75rem 0", color: "var(--color-on-surface)", fontSize: "1rem",
                outline: "none", fontFamily: "var(--font-body)", transition: "border-color 0.3s"
              }}
              onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-secondary)")}
              onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-secondary)", fontWeight: 700, marginBottom: "0.5rem" }}>
              Cover Letter / Proposal
            </label>
            <textarea
              name="proposal"
              value={formData.proposal}
              onChange={handleInput}
              placeholder="Explain why you are the best fit for this architecture..."
              required
              rows="5"
              style={{
                width: "100%", background: "transparent", border: "none",
                borderBottom: "2px solid var(--color-outline-variant-strong)",
                padding: "0.75rem 0", color: "var(--color-on-surface)", fontSize: "0.95rem",
                outline: "none", fontFamily: "var(--font-body)", lineHeight: 1.6, resize: "none",
                transition: "border-color 0.3s"
              }}
              onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-secondary)")}
              onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button
              type="submit"
              disabled={isProcessing}
              className="signature-cta"
              style={{
                width: "100%", padding: "1.25rem", border: "none", color: "var(--color-on-primary-container)",
                fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.85rem",
                textTransform: "uppercase", letterSpacing: "0.2em", 
                cursor: isProcessing ? "not-allowed" : "pointer", 
                borderRadius: "4px",
                opacity: isProcessing ? 0.7 : 1
              }}
            >
              {isProcessing ? "Transmitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobApplyModal;
*/
