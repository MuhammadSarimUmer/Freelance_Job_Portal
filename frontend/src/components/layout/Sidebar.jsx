import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  developerNav,
  clientNav,
  bottomNavItems,
} from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ activePage, role = "developer" }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  const navItems = role === "developer" ? developerNav : clientNav;
  const resolvedRole = user?.role?.toLowerCase() || role;
  const profileData = resolvedRole === "developer" ? user?.developer : user?.client;
  const displayName = user?.fullName || "Account";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AC";
  const subtitle = loading
    ? "Loading..."
    : resolvedRole === "developer"
      ? profileData?.availabilityStatus
        ? profileData.availabilityStatus.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
        : "Developer"
      : profileData?.companyName || "Client";

  const handleBottomAction = (label) => {
    if (label === "Logout") {
      logout();
      navigate("/");
      return;
    }
    if (label === "Help Center") {
      navigate("/");
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "none",
          position: "fixed",
          top: "calc(96px + 1rem)",
          left: "1rem",
          zIndex: 60,
          background: "var(--color-surface-container-highest)",
          border: "none",
          padding: "0.5rem",
          borderRadius: "4px",
          color: "var(--color-on-surface)",
          cursor: "pointer",
        }}
        className="show-mobile-sidebar-toggle"
      >
        <span className="material-symbols-outlined">
          {isOpen ? "close" : "menu"}
        </span>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 40,
          }}
          className="sidebar-mobile-overlay"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`sidebar-container ${isOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          left: 0,
          top: "96px",
          height: "calc(100vh - 96px)",
          width: "256px",
          background: "var(--color-surface-container-low)",
          display: "flex",
          flexDirection: "column",
          padding: "2rem 1rem",
          zIndex: 50,
          borderRight: "1px solid var(--color-outline-variant)",
          transition: "transform 0.3s ease, background 0.3s ease",
        }}
      >
        {/* Responsive CSS handled locally or via globals, we'll inject style block for drawer logic */}
        <style>
          {`
            @media (max-width: 1024px) {
              .sidebar-container {
                transform: translateX(-100%);
              }
              .sidebar-container.open {
                transform: translateX(0);
              }
              .show-mobile-sidebar-toggle {
                display: block !important;
              }
            }
          `}
        </style>

        {/* Nav Links */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {navItems.map((item) => {
            const isActive = activePage === item.label;
            return (
              <div
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  color: isActive
                    ? "var(--color-primary-container)"
                    : "var(--color-secondary)",
                  fontWeight: isActive ? 700 : 400,
                  background: isActive
                    ? "var(--color-surface-container-highest)"
                    : "transparent",
                  borderRight: isActive
                    ? "4px solid var(--color-primary-container)"
                    : "4px solid transparent",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-body)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background =
                      "var(--color-surface-container-high)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Bottom — User Info */}
        <div
          style={{
            borderTop: "1px solid var(--color-outline-variant)",
            paddingTop: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0 1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                color: "var(--color-secondary)",
                fontSize: "0.75rem",
                borderRadius: "4px",
                overflow: "hidden",
                background: "var(--color-surface-container-highest)",
              }}
            >
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={displayName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : initials}
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  fontFamily: "var(--font-headline)",
                }}
              >
                {displayName}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-secondary)" }}>
                {subtitle}
              </p>
            </div>
          </div>

          {/* Navigation link out */}

          {bottomNavItems.map((item) => (
            <div
              key={item.label}
              onClick={() => handleBottomAction(item.label)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                color: "var(--color-secondary)",
                fontSize: "0.875rem",
                fontFamily: "var(--font-body)",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-on-surface)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-secondary)")
              }
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.1rem" }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
