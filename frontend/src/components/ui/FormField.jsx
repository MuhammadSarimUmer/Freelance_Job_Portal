export default function FormField({ label, children, hint }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {label ? (
        <label
          style={{
            display: "block",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            fontWeight: 700,
            color: "var(--color-secondary)",
            fontFamily: "var(--font-label)",
            marginBottom: "0.75rem",
          }}
        >
          {label}
        </label>
      ) : null}
      {children}
      {hint ? (
        <p
          style={{
            marginTop: "0.5rem",
            color: "var(--color-secondary)",
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            opacity: 0.85,
          }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

