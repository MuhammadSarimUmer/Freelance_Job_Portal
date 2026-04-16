import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { navbarLinks } from "../../data/mockData";
import logoDark from "../../assets/logo_dark.png";
import logoLight from "../../assets/logo_light.png";
import ThemePullCord from "../ui/ThemePullCord";

function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/auth") return null;

  // Determine dynamic links based on role
  let links = [...navbarLinks];
  if (user?.role === "DEVELOPER") {
    links = [
      { label: "Dashboard", path: "/developer/dashboard" },
      { label: "Open Contracts", path: "/jobs" },
      { label: "My Proposals", path: "/developer/applications" },
    ];
  } else if (user?.role === "CLIENT") {
    links = [
      { label: "Dashboard", path: "/client/dashboard" },
      { label: "Developer Directory", path: "/client/directory" },
    ];
  }

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        background: "var(--color-navbar-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 2rem",
        borderBottom: "1px solid var(--color-outline-variant)",
        transition: "background 0.4s ease, border-color 0.3s ease",
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        <img
          src={isDark ? logoDark : logoLight}
          alt="Codex"
          style={{
            height: "80px",
            width: "auto",
            transition: "opacity 0.3s ease",
          }}
        />
      </div>

      {/* Nav Links — Desktop */}
      <div
        className="hide-mobile"
        style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}
      >
        {links.map((item) => (
          <span
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              color: "var(--color-on-surface)",
              cursor: "pointer",
              fontFamily: "var(--font-headline)",
              fontSize: "0.95rem",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.color = "var(--color-secondary)")
            }
            onMouseLeave={(e) =>
              (e.target.style.color = "var(--color-on-surface)")
            }
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Action Buttons — Desktop */}
      <div
        className="hide-mobile"
        style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
      >
        <ThemePullCord />
        
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "var(--color-on-surface-variant)", fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
              {user.fullName || user.email}
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              style={{
                background: "transparent",
                border: "1px solid var(--color-outline-variant)",
                color: "var(--color-on-surface)",
                padding: "0.4rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "var(--font-headline)",
                fontSize: "0.85rem",
              }}
            >
              Logout
            </button>
            {user.role === "CLIENT" && (
              <button
                onClick={() => navigate("/post-contract")}
                style={{
                  background: "var(--color-primary-container)",
                  color: "var(--color-on-primary-container)",
                  border: "none",
                  padding: "0.6rem 1.5rem",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  borderRadius: "4px",
                  transition: "filter 0.3s ease, transform 0.3s ease",
                }}
              >
                Create Contract
              </button>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/auth")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-on-surface)",
                cursor: "pointer",
                fontFamily: "var(--font-headline)",
                fontSize: "0.95rem",
                fontWeight: 500,
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/post-contract")}
              style={{
                background: "var(--color-primary-container)",
                color: "var(--color-on-primary-container)",
                border: "none",
                padding: "0.6rem 1.5rem",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.95rem",
                borderRadius: "4px",
              }}
            >
              Create Contract
            </button>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <div className="show-mobile" style={{ display: "none", gap: "0.75rem", alignItems: "center" }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            background: "var(--color-surface-container-highest)",
            border: "none",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.1rem", color: "var(--color-primary)" }}
          >
            {isDark ? "light_mode" : "dark_mode"}
          </span>
        </button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.75rem", color: "var(--color-on-surface)" }}
          >
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div
          className="show-mobile"
          style={{
            display: "flex",
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--color-surface-container-low)",
            flexDirection: "column",
            padding: "1.5rem 2rem",
            gap: "1.25rem",
            borderBottom: "1px solid var(--color-outline-variant)",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          {links.map((item) => (
            <span
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              style={{
                color: "var(--color-on-surface)",
                cursor: "pointer",
                fontFamily: "var(--font-headline)",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              {item.label}
            </span>
          ))}

          {user ? (
            <>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate("/");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-secondary)",
                  cursor: "pointer",
                  fontFamily: "var(--font-headline)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  textAlign: "left",
                  padding: 0,
                }}
              >
                Logout
              </button>
              {user.role === "CLIENT" && (
                <button
                  onClick={() => {
                    navigate("/post-contract");
                    setMobileOpen(false);
                  }}
                  style={{
                    background: "var(--color-primary-container)",
                    color: "var(--color-on-primary-container)",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    fontFamily: "var(--font-headline)",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    borderRadius: "4px",
                    textAlign: "center",
                  }}
                >
                  Post a Job
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate("/auth");
                  setMobileOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-secondary)",
                  cursor: "pointer",
                  fontFamily: "var(--font-headline)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  textAlign: "left",
                  padding: 0,
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  navigate("/post-contract");
                  setMobileOpen(false);
                }}
                style={{
                  background: "var(--color-primary-container)",
                  color: "var(--color-on-primary-container)",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                Post a Job
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
