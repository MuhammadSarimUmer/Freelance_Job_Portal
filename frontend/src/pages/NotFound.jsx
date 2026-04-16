import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="anim-fade-in"
      style={{
        backgroundColor: "var(--color-background)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "var(--font-body)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Teal Glow */}
      <div
        className="teal-glow"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <h1
          className="anim-slide-up"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "clamp(8rem, 20vw, 16rem)",
            fontWeight: 700,
            color: "var(--color-surface-container-highest)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            marginBottom: "0",
          }}
        >
          404
        </h1>
        <p
          className="anim-fade-in-up anim-delay-1"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "1.5rem",
            fontWeight: 500,
            color: "var(--color-on-surface)",
            marginBottom: "1rem",
            letterSpacing: "-0.02em",
          }}
        >
          Page not found.
        </p>
        <p
          className="anim-fade-in-up anim-delay-1"
          style={{
            color: "var(--color-secondary)",
            fontSize: "1rem",
            maxWidth: "400px",
            margin: "0 auto 3rem",
            lineHeight: 1.7,
            fontFamily: "var(--font-body)"
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="anim-fade-in-up anim-delay-2" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", padding: "0 1rem" }}>
          <button
            onClick={() => navigate("/")}
            className="signature-cta"
            style={{
              padding: "1rem 2.5rem",
              color: "var(--color-on-primary-container)",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
              transition: "filter 0.2s, transform 0.2s",
              borderRadius: "4px"
            }}
            onMouseEnter={(e) => {
              e.target.style.filter = "brightness(1.1)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.filter = "brightness(1)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "1rem 2.5rem",
              background: "transparent",
              color: "var(--color-secondary)",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              border: "2px solid var(--color-outline-variant-strong)",
              cursor: "pointer",
              transition: "background 0.2s",
              borderRadius: "4px"
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "var(--color-surface-container-high)")
            }
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
