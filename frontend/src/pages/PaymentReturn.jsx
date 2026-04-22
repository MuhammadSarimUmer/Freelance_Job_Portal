import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { escrowService } from "../api/services/escrowService";

function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [contractID, setContractID] = useState(null);

  const beacon = searchParams.get("tracker") || searchParams.get("beacon");
  const contractIdFromUrl = searchParams.get("contractId");

  useEffect(() => {
    if (!beacon) {
      setStatus("error");
      setMessage("No payment reference found in the URL. The payment may have been cancelled.");
      return;
    }

    const verify = async () => {
      try {
        const res = await escrowService.verifyPayment(beacon);
        const data = res.data?.data;
        setContractID(data?.contractID || contractIdFromUrl || null);
        setStatus("success");
        setMessage(res.data?.message || "Payment verified. Escrow has been funded.");
      } catch (err) {
        const msg = err?.response?.data?.message || "Payment verification failed.";
        const httpStatus = err?.response?.status;
        if (httpStatus === 402) {
          setStatus("failed");
          setMessage("Payment was not completed or was declined by SafePay.");
        } else {
          setStatus("error");
          setMessage(msg);
        }
      }
    };

    verify();
  }, [beacon]);

  const iconMap = {
    verifying: { icon: "hourglass_top", color: "var(--color-primary)" },
    success: { icon: "check_circle", color: "#4ade80" },
    failed: { icon: "cancel", color: "var(--color-error)" },
    error: { icon: "error", color: "var(--color-error)" },
  };

  const titleMap = {
    verifying: "Verifying your payment...",
    success: "Payment Successful",
    failed: "Payment Failed",
    error: "Something went wrong",
  };

  const current = iconMap[status] || iconMap.error;

  return (
    <div
      style={{
        backgroundColor: "var(--color-background)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "var(--color-surface-container-low)",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: "12px",
          padding: "3rem 2.5rem",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "3.5rem",
            color: current.color,
            display: "block",
            marginBottom: "1.25rem",
            animation: status === "verifying" ? "spin 1.2s linear infinite" : "none",
          }}
        >
          {current.icon}
        </span>

        <h1
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--color-on-surface)",
            marginBottom: "0.75rem",
          }}
        >
          {titleMap[status]}
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-on-surface-variant)",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          {message || "Please wait..."}
        </p>

        {status !== "verifying" ? (
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            {status === "success" && contractID ? (
              <button
                type="button"
                onClick={() => navigate(`/contracts/${contractID}`)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "var(--color-primary)",
                  border: "none",
                  color: "var(--color-on-primary)",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                Go to Contract
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate("/escrow")}
              style={{
                padding: "0.75rem 1.5rem",
                background: "transparent",
                border: "1px solid var(--color-outline-variant)",
                color: "var(--color-on-surface)",
                borderRadius: "5px",
                cursor: "pointer",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              {status === "success" ? "View Escrow" : "Back to Escrow"}
            </button>
          </div>
        ) : null}

        {beacon ? (
          <p
            style={{
              marginTop: "2rem",
              fontSize: "0.65rem",
              color: "var(--color-outline)",
              fontFamily: "var(--font-label)",
              letterSpacing: "0.06em",
              wordBreak: "break-all",
            }}
          >
            REF: {beacon}
          </p>
        ) : null}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PaymentReturn;
