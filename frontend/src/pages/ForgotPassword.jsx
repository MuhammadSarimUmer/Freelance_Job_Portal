import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/services/authService";
import { useToast } from "../context/ToastContext";

function ForgotPassword() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
      addToast("Reset code dispatched to your inbox.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to send reset code.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast("Enter your email address.", "error");
      return;
    }
    if (!otp.trim()) {
      addToast("Enter the 6-digit reset code.", "error");
      return;
    }
    if (!newPassword.trim()) {
      addToast("Enter a new password.", "error");
      return;
    }

    try {
      setIsProcessing(true);
      await authService.resetPassword({ email, otp, newPassword });
      addToast("Password updated. Please sign in.", "success");
      navigate("/auth");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to reset password.", "error");
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
            ? "Enter the 6-digit code sent to your inbox and choose a new password."
            : "Enter the email address associated with your Codex account. We'll send you a secure reset code."}
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
              {isProcessing ? "Dispatching..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
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
                Reset Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
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
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
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
              {isProcessing ? "Updating..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              style={{
                marginTop: "1rem",
                background: "transparent",
                border: "none",
                color: "var(--color-secondary)",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Resend code
            </button>
          </form>
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
