import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: "#051614", minHeight: "100vh" }}>
      <Navbar />
      <main
        style={{ position: "relative", paddingTop: "96px", overflow: "hidden" }}
      >
        {/* Teal Glows */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "25%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "#006b76",
            opacity: 0.2,
            filter: "blur(80px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "25%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "#006b76",
            opacity: 0.15,
            filter: "blur(100px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* HERO */}
        <section
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "8rem 2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span
              style={{
                color: "#83D3DF",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                background: "#263836",
                padding: "4px 12px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              v1.0 Live Now
            </span>
          </div>

          <h1
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(4rem, 10vw, 9rem)",
              fontWeight: 700,
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              marginBottom: "3rem",
              color: "#d2e7e3",
            }}
          >
            Connect.
            <br />
            Build.
            <br />
            <span style={{ color: "#ffb691" }}>Ship.</span>
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              maxWidth: "36rem",
              marginBottom: "3rem",
              lineHeight: 1.7,
              color: "#83d3df",
              fontFamily: "Inter, sans-serif",
            }}
          >
            A premium platform for elite software engineering. No templates.
            Just high-performance talent meeting ambitious architecture.
          </p>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/post-contract")}
              style={{
                padding: "1.25rem 2.5rem",
                background: "linear-gradient(135deg, #ffb691 0%, #e37434 100%)",
                color: "#4e1d00",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                border: "none",
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
              }}
              onMouseEnter={(e) => (e.target.style.filter = "brightness(1.1)")}
              onMouseLeave={(e) => (e.target.style.filter = "brightness(1)")}
            >
              Post a Contract
            </button>
            <button
              onClick={() => navigate("/jobs")}
              style={{
                padding: "1.25rem 2.5rem",
                background: "transparent",
                color: "#83d3df",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                border: "2px solid rgba(131,211,223,0.4)",
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "rgba(131,211,223,0.08)")
              }
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              Find Work
            </button>
          </div>
        </section>

        {/* STATS */}
        <section
          style={{
            background: "#0d1f1d",
            padding: "4rem 2rem",
            borderTop: "1px solid rgba(86,66,57,0.15)",
            borderBottom: "1px solid rgba(86,66,57,0.15)",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "3rem",
            }}
          >
            {[
              { number: "1200+", label: "Vetted Developers" },
              { number: "850+", label: "Active Projects" },
              { number: "$2M+", label: "Paid Out Monthly" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "3rem",
                    fontWeight: 700,
                    color: "#d2e7e3",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  {stat.number}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#83d3df",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "8rem 2rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "6rem",
              flexWrap: "wrap",
              gap: "2rem",
            }}
          >
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                color: "#d2e7e3",
                maxWidth: "28rem",
              }}
            >
              Engineered for Precision.
            </h2>
            <p
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#83d3df",
                maxWidth: "200px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              The standard for high-end freelance collaboration.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                icon: "description",
                number: "01",
                title: "Post Contracts",
                desc: "Define complex technical requirements with our industry-leading markdown editor and git-linked briefs.",
              },
              {
                icon: "groups",
                number: "02",
                title: "Hire Developers",
                desc: "Skip the noise. Access a curated pool of senior engineers ready to tackle deep-stack architecture.",
              },
              {
                icon: "speed",
                number: "03",
                title: "Track Milestones",
                desc: "Automated delivery pipelines and smart-contract escrow ensure shipping is synchronized and secure.",
              },
            ].map((card) => (
              <div
                key={card.number}
                style={{
                  background: "#e8e5b5",
                  padding: "2.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "320px",
                  transition: "transform 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "3rem", color: "#323210" }}
                  >
                    {card.icon}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "rgba(50,50,16,0.3)",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
                    {card.number}
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#1d1d01",
                      marginBottom: "1rem",
                      lineHeight: 1.1,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      lineHeight: 1.6,
                      color: "#42411e",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BENTO */}
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 2rem 8rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "2rem",
            }}
          >
            <div
              style={{
                background: "#1b2d2b",
                padding: "3rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                minHeight: "400px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  top: "2rem",
                  right: "2rem",
                  fontSize: "5rem",
                  color: "#ffb691",
                  opacity: 0.15,
                }}
              >
                terminal
              </span>
              <h4
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#d2e7e3",
                  marginBottom: "1rem",
                }}
              >
                Integrated Code Intelligence.
              </h4>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "#83d3df",
                  fontFamily: "Inter, sans-serif",
                  maxWidth: "32rem",
                }}
              >
                We analyze public contributions and commit patterns to ensure a
                perfect technical fit for your stack.
              </p>
            </div>
            <div
              style={{
                background: "#006b76",
                padding: "3rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "400px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.5rem", color: "#99e9f6" }}
              >
                verified_user
              </span>
              <div>
                <h4
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "#99e9f6",
                    marginBottom: "0.75rem",
                  }}
                >
                  Escrow Verified
                </h4>
                <p
                  style={{
                    color: "rgba(153,233,246,0.7)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Payment protection for every milestone, guaranteed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          style={{
            background: "#2b3d3a",
            padding: "10rem 2rem",
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.08,
              backgroundImage: "radial-gradient(#83d3df 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 10,
              maxWidth: "1280px",
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                fontWeight: 700,
                color: "#d2e7e3",
                marginBottom: "3rem",
              }}
            >
              Ready to scale your{" "}
              <span
                style={{
                  color: "#ffb691",
                  fontStyle: "italic",
                  fontWeight: 300,
                }}
              >
                engineering
              </span>{" "}
              capacity?
            </h2>
            <button
              onClick={() => navigate("/auth")}
              style={{
                padding: "1.5rem 3rem",
                background: "#e37434",
                color: "#4e1d00",
                fontWeight: 700,
                fontSize: "1.1rem",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              Join the Editorial
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
