import { footerLinks, footerCopyright } from "../../data/mockData";

function Footer() {
  return (
    <footer
      style={{
        background: "#051614",
        width: "100%",
        padding: "3rem 2rem",
        borderTop: "1px solid rgba(86,66,57,0.2)",
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
        <div
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#D2E7E3",
          }}
        >
          Kinetic Editorial
        </div>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {footerLinks.map((link) => (
            <span
              key={link}
              style={{
                color: "#83D3DF",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#E37434")}
              onMouseLeave={(e) => (e.target.style.color = "#83D3DF")}
            >
              {link}
            </span>
          ))}
        </div>
        <div style={{ color: "rgba(131,211,223,0.5)", fontSize: "0.875rem" }}>
          {footerCopyright}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
