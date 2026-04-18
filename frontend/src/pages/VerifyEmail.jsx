import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../api/services/authService";
import { useToast } from "../context/ToastContext";

function VerifyEmail() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [status, setStatus] = useState(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const getApiErrorMessage = (err, fallbackMessage) => {
    const apiMessage = err?.response?.data?.message;
    if (apiMessage) return apiMessage;

    const validationMessage = err?.response?.data?.errors?.[0]?.msg;
    if (validationMessage) return validationMessage;

    if (err?.message === "Network Error") {
      return "Cannot reach the server. Make sure the backend is running on port 3000.";
    }

    return fallbackMessage;
  };

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      setStatus("verifying");
      try {
        const { data } = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(data?.message || "Email verified successfully. You can log in now.");
      } catch (err) {
        setStatus("error");
        setMessage(getApiErrorMessage(err, "Verification failed. Please request a new email."));
      }
    };

    verifyToken();
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      addToast("Please enter your email address.", "error");
      return;
    }

    try {
      setIsResending(true);
      const { data } = await authService.resendVerification(email);
      addToast(data?.message || "Verification email sent.", "success");
    } catch (err) {
      addToast(getApiErrorMessage(err, "Unable to send verification email."), "error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          background: "var(--color-surface-container-low)",
          borderRadius: "8px",
          padding: "2.5rem",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--color-secondary)",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          Email Verification
        </p>
        <h1
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "2rem",
            color: "var(--color-on-surface)",
            marginBottom: "0.75rem",
          }}
        >
          Confirm your address
        </h1>
        <p style={{ color: "var(--color-secondary)", lineHeight: 1.7 }}>
          Use the link sent to your inbox to verify your account. If you do not see it,
          you can request a new email below.
        </p>

        {status === "verifying" && (
          <p style={{ marginTop: "1.5rem", color: "var(--color-primary)" }}>
            Verifying your email...
          </p>
        )}

        {status === "success" && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              borderRadius: "6px",
              background: "var(--color-surface-container)",
              color: "var(--color-on-surface)",
            }}
          >
            {message || "Email verified successfully. You can log in now."}
          </div>
        )}

        {status === "error" && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              borderRadius: "6px",
              background: "var(--color-surface-container)",
              color: "var(--color-on-surface)",
            }}
          >
            {message || "Verification failed. Please request a new email."}
          </div>
        )}

        <div style={{ marginTop: "2rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--color-secondary)",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="alex@codex.io"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "2px solid var(--color-outline-variant-strong)",
              padding: "0.75rem 0",
              color: "var(--color-on-surface)",
              fontSize: "1rem",
              outline: "none",
              fontFamily: "var(--font-body)",
              transition: "border-color 0.3s",
            }}
            onFocus={(event) => (event.target.style.borderBottomColor = "var(--color-secondary)")}
            onBlur={(event) => (event.target.style.borderBottomColor = "var(--color-outline-variant-strong)")}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            style={{
              flex: 1,
              padding: "1rem",
              border: "none",
              borderRadius: "4px",
              cursor: isResending ? "not-allowed" : "pointer",
              background: "var(--color-primary)",
              color: "var(--color-on-primary-container)",
              fontFamily: "var(--font-headline)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "0.75rem",
              fontWeight: 700,
              opacity: isResending ? 0.7 : 1,
            }}
          >
            {isResending ? "Sending..." : "Resend Email"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/auth")}
            style={{
              flex: 1,
              padding: "1rem",
              border: "1px solid var(--color-outline-variant-strong)",
              borderRadius: "4px",
              background: "transparent",
              color: "var(--color-on-surface)",
              fontFamily: "var(--font-headline)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
