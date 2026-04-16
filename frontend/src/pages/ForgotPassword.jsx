import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/services/authService";
import { useToast } from "../context/ToastContext";

function ForgotPassword() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast("Enter a valid email address.", "error");
      return;
    }
    try {
      setIsProcessing(true);
      await authService.forgotPassword(email);
      setIsSent(true);
      addToast("Recovery link dispatched to your inbox.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to send recovery link.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

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
        className="anim-fade-in"
        style={{
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
            margin: "0 auto 3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 60px var(--color-primary)",
            opacity: 0.9,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "2rem", color: "var(--color-on-primary)" }}
          >
            lock_reset
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 200,
            letterSpacing: "-0.04em",
            color: "var(--color-on-surface)",
            lineHeight: 1,
            marginBottom: "1rem",
            textTransform: "uppercase",
          }}
        >
          System Recovery
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            color: "var(--color-on-surface-variant)",
            marginBottom: "3rem",
            lineHeight: 1.6,
          }}
        >
          {isSent
            ? "A recovery link has been dispatched. Check your inbox and follow the instructions to regain access."
            : "Enter the email address associated with your Codex account. We'll send you a secure recovery link."}
        </p>

        {!isSent ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "2rem", textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontWeight: 700,
                  color: "var(--color-outline)",
                  fontFamily: "var(--font-label)",
                  marginBottom: "0.75rem",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@codex.dev"
                style={{
                  width: "100%",
                  padding: "1.25rem 1rem",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--color-outline-variant)",
                  color: "var(--color-on-surface)",
                  fontFamily: "var(--font-body)",
                  fontSize: "1.1rem",
                  outline: "none",
                  transition: "border-color 0.3s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant)")}
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="signature-cta"
              style={{
                width: "100%",
                padding: "1.25rem",
                background: isProcessing
                  ? "var(--color-surface-container-high)"
                  : "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
                color: "var(--color-on-primary)",
                border: "none",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: isProcessing ? "not-allowed" : "pointer",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                transition: "filter 0.3s, transform 0.3s",
                opacity: isProcessing ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.filter = "brightness(1.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {isProcessing ? "Dispatching..." : "Send Recovery Link"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            style={{
              padding: "1.25rem 3rem",
              background: "transparent",
              border: "1px solid var(--color-outline-variant)",
              color: "var(--color-secondary)",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              borderRadius: "4px",
              textTransform: "uppercase",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "var(--color-surface-container-high)")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Return to Login
          </button>
        )}

        <button
          onClick={() => navigate("/auth")}
          style={{
            display: "block",
            margin: "2rem auto 0",
            background: "transparent",
            border: "none",
            color: "var(--color-outline)",
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
