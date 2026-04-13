import { useNavigate } from "react-router-dom";
import {
  developerNav,
  clientNav,
  currentUser,
  bottomNavItems,
} from "../../data/mockData";

function Sidebar({ activePage, role = "developer" }) {
  const navigate = useNavigate();

  const navItems = role === "developer" ? developerNav : clientNav;

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: "256px",
        background: "#0D1F1D",
        display: "flex",
        flexDirection: "column",
        padding: "2rem 1rem",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "#D2E7E3",
          marginBottom: "3rem",
          padding: "0 1rem",
          cursor: "pointer",
          letterSpacing: "-0.04em",
        }}
      >
        Kinetic Editorial
      </div>

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
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                cursor: "pointer",
                transition: "all 0.2s",
                color: isActive ? "#E37434" : "#83D3DF",
                fontWeight: isActive ? 700 : 400,
                background: isActive ? "#263836" : "transparent",
                borderRight: isActive
                  ? "4px solid #E37434"
                  : "4px solid transparent",
                fontSize: "0.9rem",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#1b2d2b";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
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
          borderTop: "1px solid rgba(86,66,57,0.15)",
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
              background: "#263836",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              color: "#83d3df",
              fontSize: "0.75rem",
            }}
          >
            {currentUser.initials}
          </div>
          <div>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#D2E7E3",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              {currentUser.name}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#83D3DF" }}>
              {role === "developer" ? "Senior Engineer" : "Client"}
            </p>
          </div>
        </div>

        {bottomNavItems.map((item) => (
          <div
            key={item.label}
            onClick={() => item.label === "Logout" && navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              color: "#83D3DF",
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#d2e7e3")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#83D3DF")}
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
  );
}

export default Sidebar;
