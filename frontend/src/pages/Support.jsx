import Footer from "../components/layout/Footer";

function Support() {
  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh" }}>
      <main
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "140px 2rem 4rem",
        }}
      >
        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "3rem", marginBottom: "1rem" }}>
          Help Center
        </h1>
        <p style={{ color: "var(--color-secondary)", fontSize: "1rem", marginBottom: "2.5rem" }}>
          Quick answers and step-by-step guidance for clients and developers.
        </p>

        <section style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ background: "var(--color-surface-container-low)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              Frequently Asked Questions
            </h2>
            <ul style={{ color: "var(--color-on-surface-variant)", paddingLeft: "1.25rem", lineHeight: 1.7 }}>
              <li>How do I post a contract and invite developers?</li>
              <li>Where can I review proposals and invitations?</li>
              <li>How does escrow funding and release work?</li>
              <li>How do I update my profile, CV, and portfolio?</li>
            </ul>
          </div>

          <div style={{ background: "var(--color-surface-container-low)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              Client Instructions
            </h2>
            <ol style={{ color: "var(--color-on-surface-variant)", paddingLeft: "1.25rem", lineHeight: 1.7 }}>
              <li>Create a contract from the dashboard.</li>
              <li>Set milestones, assign developers, and publish.</li>
              <li>Track proposals in the dashboard inbox.</li>
              <li>Fund and release escrow from the Escrow tab.</li>
            </ol>
          </div>

          <div style={{ background: "var(--color-surface-container-low)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              Developer Instructions
            </h2>
            <ol style={{ color: "var(--color-on-surface-variant)", paddingLeft: "1.25rem", lineHeight: 1.7 }}>
              <li>Complete your profile and upload a CV.</li>
              <li>Browse open contracts and submit proposals.</li>
              <li>Review invitations in My Proposals & Invites.</li>
              <li>Track payouts in the Earnings page.</li>
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Support;
