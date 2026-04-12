import { useNavigate } from "react-router-dom";
import { navbarLinks } from "../../data/mockData";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        background: "rgba(5,22,20,0.7)",
        backdropFilter: "blur(20px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#D2E7E3",
          cursor: "pointer",
          letterSpacing: "-0.04em",
        }}
      >
        Kinetic Editorial
      </div>

      {/* Nav Links — Sirf zaroori links */}
      <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
        {navbarLinks.map((item) => (
          <span
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              color: "#D2E7E3",
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "0.95rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#83D3DF")}
            onMouseLeave={(e) => (e.target.style.color = "#D2E7E3")}
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <button
          onClick={() => navigate("/auth")}
          style={{
            background: "transparent",
            border: "none",
            color: "#D2E7E3",
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => navigate("/post-contract")}
          style={{
            background: "#E37434",
            color: "#4e1d00",
            border: "none",
            padding: "0.5rem 1.5rem",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "0.95rem",
            transition: "filter 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.filter = "brightness(1.1)")}
          onMouseLeave={(e) => (e.target.style.filter = "brightness(1)")}
        >
          Post a Job
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
