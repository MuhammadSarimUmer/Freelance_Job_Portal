import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundColor: "#051614",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Teal Glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(0,107,118,0.3) 0%, rgba(5,22,20,0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <h1
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "clamp(8rem, 20vw, 16rem)",
            fontWeight: 700,
            color: "#263836",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            marginBottom: "0",
          }}
        >
          404
        </h1>
        <p
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "1.5rem",
            fontWeight: 500,
            color: "#d2e7e3",
            marginBottom: "1rem",
            letterSpacing: "-0.02em",
          }}
        >
          Page not found.
        </p>
        <p
          style={{
            color: "#83d3df",
            fontSize: "1rem",
            maxWidth: "400px",
            margin: "0 auto 3rem",
            lineHeight: 1.7,
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "1rem 2.5rem",
              background: "#e37434",
              color: "#4e1d00",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
              transition: "filter 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.filter = "brightness(1.1)")}
            onMouseLeave={(e) => (e.target.style.filter = "brightness(1)")}
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "1rem 2.5rem",
              background: "transparent",
              color: "#83d3df",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              border: "2px solid rgba(131,211,223,0.3)",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(131,211,223,0.08)")
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
