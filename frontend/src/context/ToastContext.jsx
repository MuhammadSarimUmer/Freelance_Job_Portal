/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div 
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          zIndex: 9999,
          pointerEvents: "none"
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="anim-fade-in"
            style={{
              background: "var(--color-surface-container-highest)",
              color: toast.type === "error" ? "var(--color-error)" : toast.type === "success" ? "var(--color-primary)" : "var(--color-on-surface)",
              borderLeft: `4px solid ${toast.type === "error" ? "var(--color-error)" : toast.type === "success" ? "var(--color-primary)" : "var(--color-secondary)"}`,
              padding: "1rem 1.5rem",
              borderRadius: "4px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              fontFamily: "var(--font-headline)",
              fontSize: "0.95rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              pointerEvents: "auto",
              minWidth: "300px"
            }}
          >
            <span className="material-symbols-outlined">
              {toast.type === "error" ? "error" : toast.type === "success" ? "check_circle" : "info"}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
