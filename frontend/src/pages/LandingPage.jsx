import { useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";
import TechStackMarquee from "../components/ui/TechStackMarquee";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh" }}>
      <main
        style={{ position: "relative", paddingTop: "96px", overflow: "hidden" }}
      >
        {/* Teal Glows */}
        <div
          className="teal-glow"
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />
        <div
          className="teal-glow"
          style={{
            position: "absolute",
            top: "60%",
            right: "10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
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
            alignItems: "center",
            textAlign: "center",
            gap: "2rem",
          }}
        >
          {/* Hero Content */}
          <div className="anim-fade-in-up" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <span
                style={{
                  color: "var(--color-secondary)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  background: "var(--color-surface-container-highest)",
                  padding: "4px 12px",
                  fontFamily: "var(--font-label)",
                }}
              >
                v1.0 Live Now
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "clamp(3.5rem, 8vw, 8rem)",
                fontWeight: 700,
                lineHeight: 0.85,
                letterSpacing: "-0.04em",
                marginBottom: "3rem",
                color: "var(--color-on-surface)",
              }}
            >
              Connect. Build. <span style={{ color: "var(--color-primary)" }}>Ship.</span>
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                maxWidth: "36rem",
                marginBottom: "3rem",
                lineHeight: 1.7,
                color: "var(--color-secondary)",
                fontFamily: "var(--font-body)",
              }}
            >
              A premium platform for elite software engineering. No templates.
              Just high-performance talent meeting ambitious architecture.
            </p>

            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={() => navigate("/post-contract")}
                className="signature-cta"
                style={{
                  padding: "1.25rem 2.5rem",
                  color: "var(--color-on-primary-container)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-headline)",
                  transition: "transform 0.3s ease, filter 0.3s ease",
                  borderRadius: "4px",
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
                Post a Contract
              </button>
              <button
                onClick={() => navigate("/jobs")}
                style={{
                  padding: "1.25rem 2.5rem",
                  background: "transparent",
                  color: "var(--color-secondary)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  border: "2px solid var(--color-outline-variant-strong)",
                  cursor: "pointer",
                  fontFamily: "var(--font-headline)",
                  transition: "background 0.3s ease",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "var(--color-surface-container-high)")
                }
                onMouseLeave={(e) => (e.target.style.background = "transparent")}
              >
                Find Work
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section
          style={{
            background: "var(--color-surface-container-low)",
            padding: "4rem 2rem",
            borderTop: "1px solid var(--color-outline-variant)",
            borderBottom: "1px solid var(--color-outline-variant)",
          }}
          className="anim-fade-in-up anim-delay-3"
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
                    color: "var(--color-on-surface)",
                    fontFamily: "var(--font-headline)",
                  }}
                >
                  {stat.number}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--color-secondary)",
                    fontFamily: "var(--font-label)",
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
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "8rem 2rem 2rem 2rem" }}
          className="anim-fade-in-up anim-delay-4"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "4rem",
              flexWrap: "wrap",
              gap: "2rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                color: "var(--color-on-surface)",
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
                color: "var(--color-secondary)",
                maxWidth: "200px",
                fontFamily: "var(--font-label)",
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
                  background: "var(--color-tertiary-fixed)",
                  padding: "2.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "320px",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "default",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02) translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1) translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
                    style={{ fontSize: "3rem", color: "var(--color-on-tertiary-fixed)" }}
                  >
                    {card.icon}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--color-on-tertiary-fixed-variant)",
                      opacity: 0.3,
                      fontFamily: "var(--font-headline)",
                    }}
                  >
                    {card.number}
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "var(--color-on-tertiary-fixed)",
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
                      color: "var(--color-on-tertiary-container)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TECH STACK MARQUEE */}
        <TechStackMarquee />

        {/* BENTO */}
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "4rem 2rem 8rem",
          }}
          className="anim-fade-in-up anim-delay-6"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            <div
              style={{
                background: "var(--color-surface-container-high)",
                padding: "3rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                minHeight: "400px",
                position: "relative",
                overflow: "hidden",
                borderRadius: "8px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  top: "2rem",
                  right: "2rem",
                  fontSize: "5rem",
                  color: "var(--color-primary)",
                  opacity: 0.15,
                }}
              >
                terminal
              </span>
              <h4
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  marginBottom: "1rem",
                }}
              >
                Integrated Code Intelligence.
              </h4>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "var(--color-secondary)",
                  fontFamily: "var(--font-body)",
                  maxWidth: "32rem",
                }}
              >
                We analyze public contributions and commit patterns to ensure a
                perfect technical fit for your stack.
              </p>
            </div>
            <div
              style={{
                background: "var(--color-secondary-container)",
                padding: "3rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "400px",
                borderRadius: "8px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.5rem", color: "var(--color-on-secondary-container)" }}
              >
                verified_user
              </span>
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--color-on-secondary-container)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Escrow Verified
                </h4>
                <p
                  style={{
                    color: "var(--color-on-secondary-container)",
                    opacity: 0.8,
                    fontFamily: "var(--font-body)",
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
            background: "var(--color-surface-bright)",
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
              opacity: 0.1,
              backgroundImage: "radial-gradient(var(--color-secondary) 1px, transparent 1px)",
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
                fontFamily: "var(--font-headline)",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                marginBottom: "3rem",
              }}
            >
              Ready to scale your{" "}
              <span
                style={{
                  color: "var(--color-primary)",
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
              className="signature-cta"
              style={{
                padding: "1.5rem 3rem",
                color: "var(--color-on-primary-container)",
                fontWeight: 700,
                fontSize: "1.1rem",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-headline)",
                transition: "transform 0.3s ease, filter 0.3s ease",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05)";
                e.target.style.filter = "brightness(1.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.filter = "brightness(1)";
              }}
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
