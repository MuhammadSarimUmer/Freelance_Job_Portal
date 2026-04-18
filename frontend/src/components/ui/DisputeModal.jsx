import { useState } from "react";
import { disputeService } from "../../api/services/disputeService";
import { useToast } from "../../context/ToastContext";

function DisputeModal({ contractID, onClose, onSubmitted }) {
  const { addToast } = useToast();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      addToast("Provide a dispute reason.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await disputeService.raiseDispute({ contractID, reason: reason.trim() });
      addToast("Dispute raised.", "success");
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to raise dispute.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-surface-container-high)",
          padding: "2.5rem",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "520px",
          border: "1px solid var(--color-outline-variant)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 style={{ fontFamily: "var(--font-headline)", marginBottom: "0.5rem" }}>
          Raise a dispute
        </h2>
        <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "2rem" }}>
          Describe the issue so we can start resolution.
        </p>

        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Summarize the dispute..."
          rows={5}
          style={{
            width: "100%",
            background: "var(--color-surface)",
            color: "var(--color-on-surface)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "6px",
            padding: "0.75rem",
            fontFamily: "var(--font-body)",
            marginBottom: "2rem",
            resize: "vertical",
          }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              color: "var(--color-primary)",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-headline)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
              color: "var(--color-on-primary)",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "4px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontFamily: "var(--font-headline)",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Dispute"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisputeModal;
