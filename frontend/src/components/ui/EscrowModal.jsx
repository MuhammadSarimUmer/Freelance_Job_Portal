import { useState } from "react";
import { escrowService } from "../../api/services/escrowService";

function EscrowModal({ milestoneId, onClose }) {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async () => {
    try {
      if (!milestoneId) return;
      setIsProcessing(true);
      await escrowService.depositToEscrow({
        milestoneID: milestoneId,
        depositAmount: Number(amount),
      });
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
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
      `}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-surface" onClick={e => e.stopPropagation()}>
          <h2 style={{ fontFamily: "var(--font-headline)", marginBottom: "1rem" }}>Initialize Escrow</h2>
          <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "2rem" }}>
            Securely lock funds in the workspace matrix.
          </p>
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
              Abort
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
              {isProcessing ? "Allocating..." : "Deposit Funds"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EscrowModal;
