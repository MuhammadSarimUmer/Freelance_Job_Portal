import { useLocation } from "react-router-dom";
import { footerLinks, footerCopyright } from "../../data/mockData";
import logoDark from "../../assets/logo_dark.png";
import logoLight from "../../assets/logo_light.png";
import { useTheme } from "../../context/ThemeContext";

function Footer() {
  const { isDark } = useTheme();
  const { pathname } = useLocation();

  return (
    <footer
      style={{
        background: "var(--color-surface)",
        width: "100%",
        padding: "3rem 2rem",
        borderTop: "1px solid var(--color-outline-variant)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {pathname === "/" && (
              <img
                src={isDark ? logoDark : logoLight}
                alt="Codex"
                style={{
                  height: "80px",
                  width: "auto",
                  transition: "opacity 0.3s ease",
                  filter: "grayscale(100%) opacity(0.6)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = "grayscale(0%) opacity(1)"}
                onMouseLeave={(e) => e.currentTarget.style.filter = "grayscale(100%) opacity(0.6)"}
              />
          )}
        </div>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          {footerLinks.map((link) => (
            <span
              key={link}
              style={{
                color: "var(--color-secondary)",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "color 0.2s",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary-container)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-secondary)")}
            >
              {link}
            </span>
          ))}
        </div>
        <div style={{ color: "var(--color-outline)", fontSize: "0.875rem", fontFamily: "var(--font-body)" }}>
          {footerCopyright}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
