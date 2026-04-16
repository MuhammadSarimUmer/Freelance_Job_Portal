export default function TagPill({ text, onRemove, tone = "secondary" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.35rem 0.75rem",
        borderRadius: "999px",
        fontFamily: "var(--font-label)",
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        border: `1px solid var(--color-outline-variant)`,
        background:
          tone === "error" ? "var(--color-error-container)" : "var(--color-surface-container-lowest)",
        color: tone === "error" ? "var(--color-on-error-container)" : "var(--color-secondary)",
      }}
    >
      {text}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${text}`}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "inherit",
            fontWeight: 800,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}

