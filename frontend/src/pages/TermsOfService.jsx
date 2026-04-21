import Footer from "../components/layout/Footer";

function TermsOfService() {
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
          Terms of Service
        </h1>
        <p style={{ color: "var(--color-secondary)", fontSize: "1rem", marginBottom: "2.5rem" }}>
          Please review the terms that govern platform usage.
        </p>

        <section style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ background: "var(--color-surface-container-low)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              Platform Usage
            </h2>
            <p style={{ color: "var(--color-on-surface-variant)", lineHeight: 1.7 }}>
              Use the platform responsibly. Do not share sensitive information in public areas or attempt to bypass escrow safeguards.
            </p>
          </div>
          <div style={{ background: "var(--color-surface-container-low)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              Payments & Escrow
            </h2>
            <p style={{ color: "var(--color-on-surface-variant)", lineHeight: 1.7 }}>
              Escrow deposits are required before work begins, and releases are handled per milestone completion and agreement.
            </p>
          </div>
          <div style={{ background: "var(--color-surface-container-low)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              Account Responsibilities
            </h2>
            <p style={{ color: "var(--color-on-surface-variant)", lineHeight: 1.7 }}>
              Maintain accurate profile information and keep your account secure. Misuse may result in suspension.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default TermsOfService;
