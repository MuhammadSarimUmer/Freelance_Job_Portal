function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmStyles = tone === "danger"
    ? {
      background: "var(--color-error)",
      color: "var(--color-on-error)",
      border: "none",
    }
    : {
      background: "var(--color-primary-container)",
      color: "var(--color-on-primary-container)",
      border: "none",
    };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface-container)",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: "12px",
          padding: "2rem",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        <h3 style={{ fontFamily: "var(--font-headline)", marginTop: 0 }}>{title}</h3>
        <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "1.5rem" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              color: "var(--color-on-surface)",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: "6px",
              padding: "0.55rem 1rem",
              cursor: "pointer",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              ...confirmStyles,
              borderRadius: "6px",
              padding: "0.55rem 1rem",
              cursor: "pointer",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
