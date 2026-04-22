import { useState } from "react";
import { escrowService } from "../../api/services/escrowService";
import { useToast } from "../../context/ToastContext";

function EscrowModal({ milestoneId, contractId, milestoneAmount, milestoneTitle, onClose }) {
  const [amount, setAmount] = useState(milestoneAmount ? String(milestoneAmount) : "");
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  const handleDeposit = async () => {
    try {
      if (!milestoneId) {
        addToast("Select a milestone to fund escrow.", "error");
        return;
      }

      const parsed = Number(amount);
      if (!amount || Number.isNaN(parsed) || parsed <= 0) {
        addToast("Enter a valid amount greater than zero.", "error");
        return;
      }

      setIsProcessing(true);

      // Open blank tab NOW (synchronously, within the click gesture) to avoid popup blocker
      const newTab = window.open("", "_blank");

      const returnBase = `${window.location.origin}/payment/return`;
      const redirectUrl = contractId
        ? `${returnBase}?contractId=${contractId}`
        : returnBase;
      const cancelUrl = `${window.location.origin}/escrow`;

      const res = await escrowService.initiatePayment({
        milestoneID: milestoneId,
        depositAmount: parsed,
        redirectUrl,
        cancelUrl,
      });

      const checkoutUrl = res.data?.data?.checkoutUrl;
      if (!checkoutUrl) throw new Error("No checkout URL returned from server.");

      if (newTab) {
        newTab.location.href = checkoutUrl;
      } else {
        // Popup was blocked — fall back to same-tab navigation
        window.location.href = checkoutUrl;
      }
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error(err);
      addToast(err?.response?.data?.message || err?.message || "Failed to initiate payment.", "error");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-surface {
          background: var(--color-surface-container-high);
          padding: 3rem;
          border-radius: 8px;
          width: 100%;
          max-width: 500px;
          border: 1px solid var(--color-outline-variant);
          position: relative;
        }
        .modal-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--color-outline-variant);
          padding: 0.5rem 0;
          color: var(--color-on-surface);
          font-size: 1.5rem;
          margin-bottom: 2rem;
          outline: none;
          transition: border-color 0.3s ease;
        }
        .modal-input:focus { border-bottom-color: var(--color-primary); }
        .escrow-note {
          background: var(--color-surface-container-low);
          border: 1px dashed var(--color-outline-variant);
          border-radius: 8px;
          padding: 0.85rem 1rem;
          margin-bottom: 1.5rem;
          display: grid;
          gap: 0.35rem;
        }
        .escrow-badge {
          align-self: start;
          display: inline-flex;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 700;
          background: var(--color-primary-container);
          color: var(--color-on-primary-container);
        }
      `}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-surface" onClick={e => e.stopPropagation()}>
          <h2 style={{ fontFamily: "var(--font-headline)", marginBottom: "1rem" }}>Initialize Escrow</h2>
          <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "2rem" }}>
            Securely lock funds in the workspace matrix.
          </p>
          {milestoneTitle && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", padding: "0.85rem 1rem", background: "var(--color-surface-container)", borderRadius: "6px", border: "1px solid var(--color-outline-variant)" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-secondary)", fontWeight: 700 }}>Funding Milestone</p>
                <p style={{ margin: "0.2rem 0 0", fontFamily: "var(--font-headline)", fontWeight: 700, color: "var(--color-on-surface)" }}>{milestoneTitle}</p>
              </div>
              {milestoneAmount && (
                <p style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "1.25rem", fontWeight: 700, color: "var(--color-primary)" }}>${Number(milestoneAmount).toLocaleString()}</p>
              )}
            </div>
          )}
          <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "linear-gradient(135deg, rgba(0,107,118,0.12), rgba(255,182,145,0.08))", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: "8px", background: "var(--color-surface-container-highest)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "var(--color-secondary)" }}>shield</span>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontFamily: "var(--font-headline)", fontSize: "0.8rem", color: "var(--color-on-surface)" }}>Secured by SafePay</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "var(--color-on-surface-variant)", lineHeight: 1.5 }}>
                Checkout opens in a new tab. Complete payment, then click <strong>Confirm Deposit</strong> on the escrow card.
              </p>
            </div>
          </div>
          <input
            type="number"
            placeholder="$0.00"
            className="modal-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{ background: "transparent", color: "var(--color-primary)", border: "none", cursor: "pointer", fontFamily: "var(--font-headline)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeposit}
              disabled={isProcessing}
              style={{
                background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
                color: "var(--color-on-primary)",
                border: "none",
                padding: "0.5rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "var(--font-headline)"
              }}
            >
              {isProcessing ? "Redirecting to SafePay..." : "Pay via SafePay →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EscrowModal;
