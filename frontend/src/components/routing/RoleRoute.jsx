import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RoleRoute({ allow, children }) {
  const { user, loading, token } = useAuth();

  if (loading || (token && !user)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-secondary)" }}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allow.includes(user.role)) {
    const fallback = user.role === "CLIENT" ? "/client/dashboard" : "/developer/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default RoleRoute;
