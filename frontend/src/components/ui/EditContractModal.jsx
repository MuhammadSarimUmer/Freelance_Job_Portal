import { useState, useEffect } from "react";
import { contractService } from "../../api/services/contractService";
import { useToast } from "../../context/ToastContext";

function EditContractModal({ contract, onClose, onSaved }) {
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    status: "",
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        title: contract.title || "",
        description: contract.description || "",
        budget: contract.budget || "",
        deadline: contract.deadline ? contract.deadline.split("T")[0] : "",
        status: contract.status || "OPEN",
      });
    }
  }, [contract]);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      await contractService.updateContract(contract._id || contract.id, {
        title: formData.title,
        description: formData.description,
        budget: Number(formData.budget),
        deadline: formData.deadline,
      });
      addToast("Contract scope updated.", "success");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update contract.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this contract?")) return;
    try {
      setIsProcessing(true);
      await contractService.deleteContract
        ? await contractService.deleteContract(contract._id || contract.id)
        : null;
      addToast("Contract permanently removed.", "success");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to delete contract.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "1rem",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--color-outline-variant)",
    color: "var(--color-on-surface)",
    fontFamily: "var(--font-body)",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.65rem",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    fontWeight: 700,
    color: "var(--color-outline)",
    fontFamily: "var(--font-label)",
    marginBottom: "0.5rem",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="anim-fade-in"
        style={{
          background: "var(--color-surface-container)",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: "12px",
          padding: "3rem",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            background: "transparent",
            border: "none",
            color: "var(--color-outline)",
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.5rem" }}>close</span>
        </button>

        <h2
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--color-on-surface)",
            marginBottom: "0.5rem",
          }}
        >
          Edit Contract Scope
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "var(--color-outline)",
            marginBottom: "2.5rem",
          }}
        >
          Modify the scope, budget, or deadline of your published contract.
        </p>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div>
            <label style={labelStyle}>Contract Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInput}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-primary)")}
              onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant)")}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInput}
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: "100px",
              }}
              onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-primary)")}
              onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant)")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div>
              <label style={labelStyle}>Budget ($)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInput}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInput}
                style={{
                  ...inputStyle,
                  colorScheme: "dark",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant)")}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={isProcessing}
              className="signature-cta"
              style={{
                flex: 1,
                padding: "1.1rem",
                background: isProcessing
                  ? "var(--color-surface-container-high)"
                  : "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
                color: "var(--color-on-primary)",
                border: "none",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: isProcessing ? "not-allowed" : "pointer",
                borderRadius: "4px",
                textTransform: "uppercase",
                opacity: isProcessing ? 0.6 : 1,
              }}
            >
              {isProcessing ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "1.1rem",
                background: "transparent",
                border: "1px solid var(--color-outline-variant)",
                color: "var(--color-on-surface-variant)",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                borderRadius: "4px",
                textTransform: "uppercase",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "var(--color-surface-container-high)")}
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              Cancel
            </button>
          </div>

          {/* Danger Zone */}
          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--color-outline-variant)",
            }}
          >
            <button
              type="button"
              onClick={handleDelete}
              disabled={isProcessing}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-error)",
                fontFamily: "var(--font-label)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                opacity: isProcessing ? 0.4 : 0.8,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "1")}
              onMouseLeave={(e) => (e.target.style.opacity = "0.8")}
            >
              Delete Contract Permanently
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditContractModal;
