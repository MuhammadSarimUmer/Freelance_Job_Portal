export default function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-headline)",
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "var(--color-secondary)",
          marginBottom: subtitle ? "0.5rem" : 0,
        }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          style={{
            color: "var(--color-secondary)",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            opacity: 0.9,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

