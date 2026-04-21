import Footer from "../components/layout/Footer";

function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p style={{ color: "var(--color-secondary)", fontSize: "1rem", marginBottom: "2.5rem" }}>
          How we handle your data and protect your privacy.
        </p>

        <section style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ background: "var(--color-surface-container-low)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              Information We Collect
            </h2>
            <p style={{ color: "var(--color-on-surface-variant)", lineHeight: 1.7 }}>
              We collect account, contract, and payment data required to operate the platform and support escrow transactions.
            </p>
          </div>
          <div style={{ background: "var(--color-surface-container-low)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              How We Use Data
            </h2>
            <p style={{ color: "var(--color-on-surface-variant)", lineHeight: 1.7 }}>
              Data is used to match contracts, notify users, process escrow events, and improve platform security.
            </p>
          </div>
          <div style={{ background: "var(--color-surface-container-low)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              Your Choices
            </h2>
            <p style={{ color: "var(--color-on-surface-variant)", lineHeight: 1.7 }}>
              You can update or delete your account data through profile settings. Contact support for additional requests.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
